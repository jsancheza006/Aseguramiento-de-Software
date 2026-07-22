import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)

logger = logging.getLogger("aisecureqa")


def log_analysis_event(
    *,
    origin: str,
    analysis_id: str,
    language: str | None = None,
    duration_seconds: float | None = None,
    result: str,
    error: str | None = None,
) -> None:
    #Loguea de forma estructurada cada analisis ejecutado (scan de GitHub o upload)
    #origin: "github" o "upload" | result: "success" o "failed"
    fields = {
        "origin":           origin,
        "analysis_id":      analysis_id,
        "language":         language or "unknown",
        "duration_seconds": round(duration_seconds, 3) if duration_seconds is not None else None,
        "result":           result,
    }
    message = "analysis_event " + " ".join(f"{k}={v}" for k, v in fields.items())

    if error:
        logger.error(f"{message} error={error!r}")
    else:
        logger.info(message)