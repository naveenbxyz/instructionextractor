from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
CLIENT_CONFIGS_DIR = BASE_DIR / "client_configs"
LLM_CONFIG_PATH = BASE_DIR / "llm_config.json"
UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(exist_ok=True)
