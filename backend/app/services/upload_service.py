import io
import os
import shutil
import tempfile
import time
import zipfile
from datetime import datetime, timezone
from typing import List, Optional

from bson import ObjectId
from fastapi import UploadFile

from app.config import settings
from app.core.logger import logger, log_analysis_event
from app.database.connection import get_db
from app.scanners.scan_orchestrator import run_scan, detect_languages
from app.scanners.normalizer import compute_metrics, compute_security_score

# Mismo mensaje que usa el flujo de Scan (GitHub) para que el frontend
# pueda mostrar la misma alerta sin importar el origen del análisis
UNSUPPORTED_LANGUAGE_MESSAGE = (
    "⚠️ Alerta: No se puede analizar el archivo ya que no tiene código Python. "
    "Estamos trabajando para próximamente soportar más lenguajes."
)

# Extensión por defecto para guardar código pegado según el lenguaje indicado
LANGUAGE_EXTENSION_MAP = {
    "python":     ".py",
    "javascript": ".js",
    "typescript": ".ts",
    "java":       ".java",
    "csharp":     ".cs",
    "go":         ".go",
    "ruby":       ".rb",
    "php":        ".php",
}


class UploadValidationError(Exception):
    #Error de validacion del cliente, debe traducirse a HTTP 400
    pass


class UploadProcessingError(Exception):
    #Error interno durante el procesamiento, debe traducirse a HTTP 500 generico
    pass


def _validate_input(files: Optional[List[UploadFile]], code: Optional[str], language: Optional[str]) -> None:
    if not files and not (code and code.strip()):
        raise UploadValidationError("Debes enviar al menos un archivo/ZIP o código pegado para analizar")

    if code and code.strip():
        if not language or not language.strip():
            raise UploadValidationError("Debes especificar el lenguaje del código pegado")
        if language.strip().lower() not in LANGUAGE_EXTENSION_MAP:
            raise UploadValidationError(f"Lenguaje no reconocido: '{language}'")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    if files:
        for f in files:
            ext = os.path.splitext(f.filename or "")[1].lower()
            if not ext:
                raise UploadValidationError(f"El archivo '{f.filename}' no tiene una extensión válida")
            if ext not in settings.ALLOWED_UPLOAD_EXTENSIONS:
                raise UploadValidationError(f"Extensión no permitida: '{ext}'")
            size = getattr(f, "size", None)
            if size is not None and size > max_bytes:
                raise UploadValidationError(
                    f"El archivo '{f.filename}' excede el tamaño máximo permitido ({settings.MAX_UPLOAD_SIZE_MB} MB)"
                )

    if code and len(code.encode("utf-8")) > max_bytes:
        raise UploadValidationError(
            f"El código pegado excede el tamaño máximo permitido ({settings.MAX_UPLOAD_SIZE_MB} MB)"
        )


def _extract_zip(content: bytes, dest_dir: str, filename: str) -> None:
    try:
        with zipfile.ZipFile(io.BytesIO(content)) as zf:
            for member in zf.namelist():
                # Prevenir path traversal (zip slip)
                member_path = os.path.normpath(os.path.join(dest_dir, member))
                if not member_path.startswith(os.path.normpath(dest_dir) + os.sep) and member_path != os.path.normpath(dest_dir):
                    raise UploadValidationError(f"El archivo ZIP '{filename}' contiene rutas inválidas")
            zf.extractall(dest_dir)
    except zipfile.BadZipFile:
        raise UploadValidationError(f"El archivo '{filename}' no es un ZIP válido o está corrupto")
    except UploadValidationError:
        raise
    except Exception as e:
        raise UploadProcessingError(f"Error al descomprimir '{filename}': {e}")


async def _save_files(files: List[UploadFile], dest_dir: str) -> None:
    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    total_size = 0

    for f in files:
        try:
            content = await f.read()
        except Exception as e:
            raise UploadProcessingError(f"No se pudo leer el archivo '{f.filename}': {e}")

        total_size += len(content)
        if total_size > max_bytes:
            raise UploadValidationError(
                f"El tamaño total de los archivos excede el máximo permitido ({settings.MAX_UPLOAD_SIZE_MB} MB)"
            )

        safe_name = os.path.basename(f.filename)
        ext = os.path.splitext(safe_name)[1].lower()

        if ext == ".zip":
            _extract_zip(content, dest_dir, safe_name)
        else:
            try:
                with open(os.path.join(dest_dir, safe_name), "wb") as out:
                    out.write(content)
            except OSError as e:
                raise UploadProcessingError(f"No se pudo guardar el archivo '{safe_name}': {e}")


def _save_pasted_code(code: str, language: str, dest_dir: str) -> None:
    ext = LANGUAGE_EXTENSION_MAP.get(language.strip().lower(), ".txt")
    try:
        with open(os.path.join(dest_dir, f"pasted_code{ext}"), "w", encoding="utf-8") as out:
            out.write(code)
    except OSError as e:
        raise UploadProcessingError(f"No se pudo guardar el código pegado: {e}")


async def process_upload(
    user_id: str,
    files: Optional[List[UploadFile]] = None,
    code: Optional[str] = None,
    language: Optional[str] = None,
    analysis_type: str = "full",
) -> dict:
    #Valida, guarda, escanea y persiste los resultados de un analisis por upload (archivos/ZIP o codigo pegado)

    # 1. Validaciones de formato/limites que no requieren tocar disco ni DB
    _validate_input(files, code, language)

    tmp_dir = tempfile.mkdtemp(prefix="aisecure_upload_")
    start_time = time.monotonic()
    scan_id = None
    scan_id_obj = None
    languages: List[str] = []

    try:
        # 2. Guardar archivos/código en un directorio temporal
        if files:
            await _save_files(files, tmp_dir)
        if code and code.strip():
            _save_pasted_code(code, language, tmp_dir)

        # 3. Detectar lenguaje antes de crear registros en DB
        languages = detect_languages(tmp_dir)
        if not languages:
            raise UploadValidationError(
                "No se pudo inferir el lenguaje del código subido. "
                "Verifica que los archivos tengan una extensión reconocida."
            )

        # 4. Crear registros en DB (recien aca, con input ya validado)
        db = get_db()
        now = datetime.now(timezone.utc)
        upload_name = files[0].filename if files and len(files) == 1 else (
            f"{len(files)} archivos" if files else "Código pegado"
        )

        repo_doc = {
            "_id":         ObjectId(),
            "user_id":     user_id,
            "name":        upload_name,
            "source_type": "upload",
            "created_at":  now,
            "updated_at":  now,
        }
        await db["repositories"].insert_one(repo_doc)
        repository_id = str(repo_doc["_id"])

        scan_id_obj = ObjectId()
        scan_id = str(scan_id_obj)
        await db["scans"].insert_one({
            "_id":                 scan_id_obj,
            "repository_id":       repository_id,
            "user_id":             user_id,
            "status":              "running",
            "analysis_type":       analysis_type,
            "started_at":          now,
            "created_at":          now,
            "security_score":      None,
            "metrics":             None,
            "ai_analysis":         None,
            "executive_summary":   None,
            "report_generated_at": None,
            "completed_at":        None,
        })
        await db["repositories"].update_one(
            {"_id": repo_doc["_id"]},
            {"$set": {"last_scan_id": scan_id_obj}},
        )

        # 5. Ejecutar los scanners disponibles
        vulns, languages = run_scan(tmp_dir, repository_id, scan_id)

        if vulns:
            vuln_now = datetime.now(timezone.utc)
            for v in vulns:
                v["created_at"] = vuln_now
            await db["vulnerabilities"].insert_many(vulns)

        metrics = compute_metrics(vulns)
        score = compute_security_score(metrics)
        total = sum(metrics.values())

        if "python" not in languages:
            summary = UNSUPPORTED_LANGUAGE_MESSAGE
            score = None
        else:
            summary = (
                f"Se detectaron {total} vulnerabilidades en {upload_name}: "
                f"{metrics['critical']} críticas, {metrics['high']} altas, "
                f"{metrics['medium']} medias, {metrics['low']} bajas. "
                f"Score de seguridad: {score}/100."
            )

        completed_at = datetime.now(timezone.utc)
        await db["scans"].update_one(
            {"_id": scan_id_obj},
            {"$set": {
                "status":              "completed",
                "security_score":      score,
                "metrics":             metrics,
                "executive_summary":   summary,
                "report_generated_at": completed_at,
                "completed_at":        completed_at,
            }},
        )

        logger.info(f"Upload {scan_id} completado: {total} vulns, score {score}")
        log_analysis_event(
            origin="upload",
            analysis_id=scan_id,
            language=",".join(languages) if languages else None,
            duration_seconds=time.monotonic() - start_time,
            result="success",
        )

        vulns_out = []
        for v in vulns:
            v_out = dict(v)
            v_out["_id"] = str(v_out.get("_id", ""))
            vulns_out.append(v_out)

        return {
            "scan_id":         scan_id,
            "status":          "completed",
            "repo_name":       upload_name,
            "security_score":  score,
            "metrics":         metrics,
            "summary":         summary,
            "vulnerabilities": vulns_out,
            "completed_at":    completed_at.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }

    except UploadValidationError as e:
        if scan_id_obj is not None:
            db = get_db()
            await db["scans"].update_one(
                {"_id": scan_id_obj},
                {"$set": {"status": "failed", "completed_at": datetime.now(timezone.utc)}},
            )
        log_analysis_event(
            origin="upload",
            analysis_id=scan_id or "unassigned",
            language=",".join(languages) if languages else None,
            duration_seconds=time.monotonic() - start_time,
            result="failed",
            error=str(e),
        )
        raise

    except UploadProcessingError as e:
        logger.error(f"Upload {scan_id or 'unassigned'} falló al procesar: {e}", exc_info=True)
        if scan_id_obj is not None:
            db = get_db()
            await db["scans"].update_one(
                {"_id": scan_id_obj},
                {"$set": {"status": "failed", "completed_at": datetime.now(timezone.utc)}},
            )
        log_analysis_event(
            origin="upload",
            analysis_id=scan_id or "unassigned",
            language=",".join(languages) if languages else None,
            duration_seconds=time.monotonic() - start_time,
            result="failed",
            error=str(e),
        )
        raise

    except Exception as e:
        logger.error(f"Upload {scan_id or 'unassigned'} falló inesperadamente: {e}", exc_info=True)
        if scan_id_obj is not None:
            db = get_db()
            await db["scans"].update_one(
                {"_id": scan_id_obj},
                {"$set": {"status": "failed", "completed_at": datetime.now(timezone.utc)}},
            )
        log_analysis_event(
            origin="upload",
            analysis_id=scan_id or "unassigned",
            language=",".join(languages) if languages else None,
            duration_seconds=time.monotonic() - start_time,
            result="failed",
            error=str(e),
        )
        raise UploadProcessingError("Error interno al procesar el análisis. Intenta nuevamente más tarde.") from e

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)
