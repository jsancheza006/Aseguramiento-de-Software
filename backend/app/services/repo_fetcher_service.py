import os
import shutil
import tempfile
import subprocess
from app.core.logger import logger


def fetch_repo(clone_url: str, branch: str = "main") -> str:
    #Clona un repositorio de GitHub en un directorio temporal usando Thread Pool con hilos para poder escanear varios archivos a la vez
    #Retorna la ruta del directorio temporal

    tmp_dir = tempfile.mkdtemp(prefix="aisecure_")
    try:
        logger.info(f"Clonando {clone_url} rama {branch} en {tmp_dir}")
        result = subprocess.run(
            ["git", "clone", "--depth", "1", "--branch", branch, clone_url, tmp_dir],
            capture_output=True,
            text=True,
            timeout=120,
        )
        if result.returncode != 0:
            shutil.rmtree(tmp_dir, ignore_errors=True)
            raise RuntimeError(f"Git clone failed: {result.stderr.strip()}")
        logger.info(f"Clone exitoso en {tmp_dir}")
        return tmp_dir
    except subprocess.TimeoutExpired:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise RuntimeError("Git clone timeout (120s)")
    except Exception as e:
        shutil.rmtree(tmp_dir, ignore_errors=True)
        raise


def cleanup_repo(path: str):
    #Elimina el directorio temporal del repo clonado
    if path and os.path.exists(path):
        shutil.rmtree(path, ignore_errors=True)
        logger.info(f"Directorio temporal eliminado: {path}")