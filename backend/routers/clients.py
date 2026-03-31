import json

from fastapi import APIRouter, HTTPException

from config import CLIENT_CONFIGS_DIR
from models.schemas import ClientConfig, ClientConfigSummary

router = APIRouter(prefix="/api/clients", tags=["clients"])


def _load_config(client_id: str) -> ClientConfig:
    path = CLIENT_CONFIGS_DIR / f"{client_id}.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Client config '{client_id}' not found")
    data = json.loads(path.read_text())
    return ClientConfig(id=client_id, **data)


@router.get("", response_model=list[ClientConfigSummary])
async def list_clients():
    configs = []
    for path in sorted(CLIENT_CONFIGS_DIR.glob("*.json")):
        data = json.loads(path.read_text())
        configs.append(ClientConfigSummary(id=path.stem, name=data["name"]))
    return configs


@router.get("/{client_id}", response_model=ClientConfig)
async def get_client(client_id: str):
    return _load_config(client_id)
