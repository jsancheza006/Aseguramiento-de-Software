from datetime import datetime, timezone
from bson import ObjectId
from app.database.connection import get_db
from app.services.repo_fetcher_service import fetch_repo, cleanup_repo
from app.scanners.scan_orchestrator import run_scan
from app.scanners.normalizer import compute_metrics, compute_security_score
from app.core.logger import logger


async def _emit_event(db, scan_id: str, event_type: str, message: str):
    #Inserta un evento de scan a la db
    await db["scan_events"].insert_one({
        "scan_id":    scan_id,
        "type":       event_type,
        "message":    message,
        "created_at": datetime.now(timezone.utc),
    })


async def start_scan(
    clone_url:  str,
    branch:     str,
    repo_name:  str,
    user_id:    str,
) -> str:
    
    #Crea los documentos en DB, clona el repo, escanea y da resultados
    
    db = get_db()
    now = datetime.now(timezone.utc)

    # Upsert repo
    repo_doc = await db["repositories"].find_one_and_update(
        {"user_id": user_id, "github_url": clone_url},
        {"$setOnInsert": {
            "_id":             ObjectId(),
            "user_id":         user_id,
            "name":            repo_name,
            "source_type":     "github",
            "github_url":      clone_url,
            "github_metadata": {"branch": branch, "clone_url": clone_url},
            "created_at":      now,
        }, "$set": {"updated_at": now}},
        upsert=True,
        return_document=True,
    )
    repository_id = str(repo_doc["_id"])

    # Crear scan en estado "running"
    scan_id_obj = ObjectId()
    scan_id = str(scan_id_obj)
    await db["scans"].insert_one({
        "_id":           scan_id_obj,
        "repository_id": repository_id,
        "user_id":       user_id,
        "status":        "running",
        "started_at":    now,
        "created_at":    now,
        # Campos que se rellenan al completar
        "security_score":      None,
        "metrics":             None,
        "ai_analysis":         None,
        "executive_summary":   None,
        "report_generated_at": None,
        "completed_at":        None,
    })

    # Actualizar last_scan_id en el repo para la vista dashboard
    await db["repositories"].update_one(
        {"_id": repo_doc["_id"]},
        {"$set": {"last_scan_id": scan_id_obj}},
    )

    # Ejecutar el scan con Thread Pool
    import asyncio
    asyncio.create_task(_run_scan_task(db, scan_id, repository_id, clone_url, branch, repo_name))

    return scan_id


async def _run_scan_task(db, scan_id: str, repository_id: str, clone_url: str, branch: str, repo_name: str):
    # Ejecuta el scan completo y actualiza la DB
    repo_path = None
    try:
        await _emit_event(db, scan_id, "progress", f"Clonando {repo_name} rama {branch}...")

        # Clonar repo 
        import asyncio
        from app.services.repo_fetcher_service import fetch_repo
        loop = asyncio.get_event_loop()
        repo_path = await loop.run_in_executor(None, fetch_repo, clone_url, branch)

        await _emit_event(db, scan_id, "progress", "Detectando lenguajes y ejecutando scanners...")

        # Escanear
        vulns = await loop.run_in_executor(None, run_scan, repo_path, repository_id, scan_id)

        await _emit_event(db, scan_id, "progress", "Calculando métricas y generando reporte...")

        # vulnerabilidades
        if vulns:
            now = datetime.now(timezone.utc)
            for v in vulns:
                v["created_at"] = now
            await db["vulnerabilities"].insert_many(vulns)

        # Calcular metricas
        metrics = compute_metrics(vulns)
        score   = compute_security_score(metrics)
        total   = sum(metrics.values())
        summary = (
            f"Se detectaron {total} vulnerabilidades en {repo_name}: "
            f"{metrics['critical']} críticas, {metrics['high']} altas, "
            f"{metrics['medium']} medias, {metrics['low']} bajas. "
            f"Score de seguridad: {score}/100."
        )

        completed_at = datetime.now(timezone.utc)
        await db["scans"].update_one(
            {"_id": ObjectId(scan_id)},
            {"$set": {
                "status":              "completed",
                "security_score":      score,
                "metrics":             metrics,
                "executive_summary":   summary,
                "report_generated_at": completed_at,
                "completed_at":        completed_at,
            }},
        )

        await _emit_event(db, scan_id, "completed", f"Scan completado — {total} vulnerabilidades encontradas")
        logger.info(f"Scan {scan_id} completado: {total} vulns, score {score}")

    except Exception as e:
        logger.error(f"Scan {scan_id} falló: {e}", exc_info=True)
        await db["scans"].update_one(
            {"_id": ObjectId(scan_id)},
            {"$set": {"status": "failed", "completed_at": datetime.now(timezone.utc)}},
        )
        await _emit_event(db, scan_id, "failed", f"Error durante el scan: {str(e)}")

    finally:
        if repo_path:
            cleanup_repo(repo_path)


async def get_scan_status(scan_id: str) -> dict | None:
    # Estatus del scan 
    db = get_db()
    scan = await db["scans"].find_one({"_id": ObjectId(scan_id)})
    if not scan:
        return None

    # Último evento
    last_event = await db["scan_events"].find_one(
        {"scan_id": scan_id},
        sort=[("created_at", -1)],
    )

    return {
        "scan_id":        scan_id,
        "status":         scan["status"],
        "message":        last_event["message"] if last_event else "",
        "security_score": scan.get("security_score"),
        "metrics":        scan.get("metrics"),
        "summary":        scan.get("executive_summary"),
        "repository_id":  str(scan.get("repository_id", "")),
    }


async def get_scan_results(scan_id: str) -> dict | None:

    # Scan completo con vulnerabilidades

    db = get_db()
    scan = await db["scans"].find_one({"_id": ObjectId(scan_id)})
    if not scan:
        return None

    vulns_cursor = db["vulnerabilities"].find({"scan_id": scan_id})
    vulns = []
    async for v in vulns_cursor:
        v["_id"] = str(v["_id"])
        vulns.append(v)

    repo = await db["repositories"].find_one({"_id": ObjectId(scan["repository_id"])})

    return {
        "scan_id":        scan_id,
        "status":         scan["status"],
        "repo_name":      repo["name"] if repo else "",
        "security_score": scan.get("security_score"),
        "metrics":        scan.get("metrics"),
        "summary":        scan.get("executive_summary"),
        "vulnerabilities": vulns,
        "completed_at":   scan.get("completed_at").strftime("%Y-%m-%dT%H:%M:%SZ") if scan.get("completed_at") else None,
    }