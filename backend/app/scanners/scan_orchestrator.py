import os
from app.core.logger import logger
from app.scanners.engines.bandit_engine import run_bandit
from app.scanners.normalizer import normalize_bandit


def detect_languages(repo_path: str) -> list[str]:
    #Detecta los lenguajes dentro del repo
    
    lang_map = {
        ".py":   "python",
        ".js":   "javascript",
        ".ts":   "typescript",
        ".jsx":  "javascript",
        ".tsx":  "typescript",
        ".java": "java",
        ".cs":   "csharp",
        ".go":   "go",
        ".rb":   "ruby",
        ".php":  "php",
    }
    found = set()
    for root, _, files in os.walk(repo_path):
        # Ignorar node_modules, .git, venv, etc.
        root_parts = root.split(os.sep)
        if any(p in root_parts for p in ["node_modules", ".git", "venv", "__pycache__", ".venv"]):
            continue
        for f in files:
            ext = os.path.splitext(f)[1].lower()
            if ext in lang_map:
                found.add(lang_map[ext])
    langs = list(found)
    logger.info(f"Lenguajes detectados: {langs}")
    return langs


def run_scan(repo_path: str, repository_id: str, scan_id: str) -> list[dict]:
    #Corre la carpeta de los engines disponibles segun los lenguajes 

    languages = detect_languages(repo_path)
    all_vulns = []

    if "python" in languages:
        logger.info("Ejecutando Bandit (Python)")
        raw = run_bandit(repo_path)
        vulns = normalize_bandit(raw, repository_id, scan_id)
        all_vulns.extend(vulns)
        logger.info(f"Bandit: {len(vulns)} vulnerabilidades encontradas")
    else:
        logger.info("No se detectó Python en el repo, saltando Bandit")

    # Aca debn ir mas Frameworks
    # if "javascript" in languages run_semgrep etc
    return all_vulns