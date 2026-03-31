import json
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import LLM_CONFIG_PATH
from models.llm_config_model import LLMConfig
from routers import chat, clients, upload
from services.llm_client import LLMClient


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: load LLM config and create client
    config_data = json.loads(LLM_CONFIG_PATH.read_text())
    llm_config = LLMConfig(**config_data)
    app.state.llm_client = LLMClient(llm_config)
    yield
    # Shutdown: close HTTP client
    await app.state.llm_client.close()


app = FastAPI(
    title="SSI Extractor",
    description="Standard Settlement Instructions PDF extraction using LLM",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clients.router)
app.include_router(upload.router)
app.include_router(chat.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
