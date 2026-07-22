import re
from fastapi import APIRouter, HTTPException, Depends, Body
from pydantic import BaseModel, ValidationError, field_validator
from bson.errors import InvalidId
from app.services.scanner_service import start_scan, get_scan_status, get_scan_results
from app.core.deps import get_current_user
from app.core.logger import logger
from app.database.connection import get_db
from bson import ObjectId

router = APIRouter(prefix="/api/scan", tags=["scan"])

# Acepta URLs HTTPS o SSH de GitHub, con o sin sufijo .git
GITHUB_URL_PATTERN = re.compile(
    r"^(https://github\.com/[\w.-]+/[\w.-]+(\.git)?/?|git@github\.com:[\w.-]+/[\w.-]+\.git)$"
)
BRANCH_PATTERN = re.compile(r"^[\w][\w./-]{0,99}$")
REPO_NAME_PATTERN = re.compile(r"^[\w.-]{1,100}$")


class ScanRequest(BaseModel):
    clone_url: str
    branch:    str = "main"
    repo_name: str = ""

    @field_validator("clone_url")
    @classmethod
    def validate_clone_url(cls, v: str) -> str:
        if not v or not GITHUB_URL_PATTERN.match(v.strip()):
            raise ValueError(
                "clone_url debe ser una URL válida de GitHub "
                "(https://github.com/usuario/repo o git@github.com:usuario/repo.git)"
            )
        return v.strip()

    @field_validator("branch")
    @classmethod
    def validate_branch(cls, v: str) -> str:
        v = (v or "").strip() or "main"
        if not BRANCH_PATTERN.match(v):
            raise ValueError("branch tiene un formato inválido")
        return v

    @field_validator("repo_name")
    @classmethod
    def validate_repo_name(cls, v: str) -> str:
        v = (v or "").strip()
        if v and not REPO_NAME_PATTERN.match(v):
            raise ValueError("repo_name tiene un formato inválido")
        return v


def _format_validation_errors(exc: ValidationError) -> str:
    #Convierte los errores de Pydantic en un mensaje legible para el cliente
    return "; ".join(err["msg"] for err in exc.errors())


@router.post("/start")
async def start_scan_endpoint(payload: dict = Body(...), current_user: dict = Depends(get_current_user)):
    try:
        body = ScanRequest(**payload)
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=_format_validation_errors(e))

    if not body.clone_url:
        raise HTTPException(status_code=400, detail="clone_url es requerido")

    repo_name = body.repo_name or body.clone_url.rstrip("/").split("/")[-1].replace(".git", "")

    try:
        scan_id = await start_scan(
            clone_url=body.clone_url,
            branch=body.branch,
            repo_name=repo_name,
            user_id=str(current_user["_id"]),
        )
    except Exception as e:
        logger.error(f"Error iniciando scan para {body.clone_url}: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="No se pudo iniciar el scan por un error interno. Intenta nuevamente más tarde.",
        )

    return {"scan_id": scan_id, "status": "running"}


@router.get("/latest")
async def latest_scan_endpoint(current_user: dict = Depends(get_current_user)):
    #Retorna el ultimo scan completado del usuario
    db = get_db()
    scan = await db["scans"].find_one(
        {"user_id": str(current_user["_id"]), "status": "completed"},
        sort=[("completed_at", -1)],
    )
    if not scan:
        raise HTTPException(status_code=404, detail="No hay scans completados")

    scan_id = str(scan["_id"])
    return await get_scan_results(scan_id)

@router.get("/history")
async def scan_history_endpoint(current_user: dict = Depends(get_current_user)):
    db = get_db()
    cursor = db["scans"].find(
        {"user_id": str(current_user["_id"])},
        sort=[("completed_at", -1)],
    )
    scans = []
    async for scan in cursor:
        repo = await db["repositories"].find_one({"_id": ObjectId(scan["repository_id"])})
        vuln_counts = await db["vulnerabilities"].count_documents({"scan_id": str(scan["_id"])})
        
        # Obtener severidades únicas presentes
        pipeline = [
            {"$match": {"scan_id": str(scan["_id"])}},
            {"$group": {"_id": "$severity"}},
        ]
        severity_docs = await db["vulnerabilities"].aggregate(pipeline).to_list(length=10)
        severities = [d["_id"] for d in severity_docs if d["_id"]]

        scans.append({
            "scan_id":        str(scan["_id"]),
            "repo_name":      repo["name"] if repo else "Unknown",
            "branch":         repo["github_metadata"]["branch"] if repo else "main",
            "status":         scan["status"],
            "security_score": scan.get("security_score"),
            "metrics":        scan.get("metrics"),
            "total_issues":   vuln_counts,
            "severities":     severities,
            "completed_at":   scan["completed_at"].isoformat() if scan.get("completed_at") else None,
            "started_at":     scan["started_at"].isoformat() if scan.get("started_at") else None,
        })
    return scans

@router.get("/{scan_id}/status")
async def scan_status_endpoint(scan_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = await get_scan_status(scan_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="scan_id tiene un formato inválido")
    except Exception as e:
        logger.error(f"Error consultando estado del scan {scan_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno al consultar el estado del scan.")

    if not result:
        raise HTTPException(status_code=404, detail="Scan no encontrado")
    return result


@router.get("/{scan_id}/results")
async def scan_results_endpoint(scan_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = await get_scan_results(scan_id)
    except InvalidId:
        raise HTTPException(status_code=400, detail="scan_id tiene un formato inválido")
    except Exception as e:
        logger.error(f"Error consultando resultados del scan {scan_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error interno al consultar los resultados del scan.")

    if not result:
        raise HTTPException(status_code=404, detail="Scan no encontrado")
    if result["status"] == "running":
        raise HTTPException(status_code=202, detail="Scan todavía en progreso")
    return result

