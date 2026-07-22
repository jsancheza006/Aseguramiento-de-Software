from typing import List, Optional

from bson.errors import InvalidId
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.core.deps import get_current_user
from app.core.logger import logger
from app.services.scanner_service import get_scan_status, get_scan_results
from app.services.upload_service import (
    UploadProcessingError,
    UploadValidationError,
    process_upload,
)

router = APIRouter(prefix="/api/upload", tags=["upload"])

ALLOWED_ANALYSIS_TYPES = {"full", "quick"}


@router.post("/start")
async def start_upload_endpoint(
    files: Optional[List[UploadFile]] = File(default=None),
    code: Optional[str] = Form(default=None),
    language: Optional[str] = Form(default=None),
    analysis_type: str = Form(default="full"),
    current_user: dict = Depends(get_current_user),
):
    # Filtrar entradas vacías que algunos clientes multipart envían cuando no se adjunta archivo
    files = [f for f in files if f and f.filename] if files else None

    if analysis_type not in ALLOWED_ANALYSIS_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"analysis_type inválido, valores permitidos: {', '.join(sorted(ALLOWED_ANALYSIS_TYPES))}",
        )

    try:
        result = await process_upload(
            user_id=str(current_user["_id"]),
            files=files,
            code=code,
            language=language,
            analysis_type=analysis_type,
        )
    except UploadValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except UploadProcessingError:
        raise HTTPException(
            status_code=500,
            detail="No se pudo procesar el análisis por un error interno. Intenta nuevamente más tarde.",
        )
    except Exception as e:
        logger.error(f"Error inesperado en upload: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="No se pudo procesar el análisis por un error interno. Intenta nuevamente más tarde.",
        )

    return result


@router.get("/{scan_id}/status")
async def upload_status_endpoint(scan_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = await get_scan_status(scan_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="scan_id tiene un formato inválido")
    except Exception as e:
        logger.error(f"Error consultando estado del upload {scan_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno al consultar el estado del análisis.")

    if not result:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
    return result


@router.get("/{scan_id}/results")
async def upload_results_endpoint(scan_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = await get_scan_results(scan_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="scan_id tiene un formato inválido")
    except Exception as e:
        logger.error(f"Error consultando resultados del upload {scan_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno al consultar los resultados del análisis.")

    if not result:
        raise HTTPException(status_code=404, detail="Análisis no encontrado")
    if result["status"] == "running":
        raise HTTPException(status_code=202, detail="Análisis todavía en progreso")
    return result
