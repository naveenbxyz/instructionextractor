import asyncio
import json
import ssl
import time
from typing import AsyncGenerator, Optional

import httpx

from models.llm_config_model import LLMConfig


class LLMClient:
    def __init__(self, config: LLMConfig):
        self._config = config
        self._azure_token: Optional[str] = None
        self._azure_token_expiry: float = 0

        verify: ssl.SSLContext | bool
        if config.ca_bundle:
            ctx = ssl.create_default_context(cafile=config.ca_bundle)
            verify = ctx
        elif not config.verify_ssl:
            verify = False
        else:
            verify = True

        self._http = httpx.AsyncClient(
            base_url=config.base_url,
            verify=verify,
            proxy=config.https_proxy or None,
            timeout=httpx.Timeout(180.0, connect=15.0),
        )

    async def _get_headers(self) -> dict[str, str]:
        if self._config.auth_type == "api_key":
            return {
                "Authorization": f"Bearer {self._config.api_key}",
                "Content-Type": "application/json",
            }
        token = await self._get_azure_token()
        return {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        }

    async def _get_azure_token(self) -> str:
        if self._azure_token and time.time() < self._azure_token_expiry - 60:
            return self._azure_token

        proc = await asyncio.create_subprocess_exec(
            "az", "account", "get-access-token",
            "--resource", "https://cognitiveservices.azure.com",
            "--query", "accessToken", "-o", "tsv",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout, stderr = await proc.communicate()
        if proc.returncode != 0:
            raise RuntimeError(f"az CLI token fetch failed: {stderr.decode().strip()}")

        self._azure_token = stdout.decode().strip()
        self._azure_token_expiry = time.time() + 3000  # ~50 min cache
        return self._azure_token

    def _get_model(self) -> str:
        if self._config.auth_type == "azure_ad" and self._config.azure_model:
            return self._config.azure_model
        return self._config.model

    async def complete(self, messages: list[dict]) -> dict:
        headers = await self._get_headers()
        payload = {
            "model": self._get_model(),
            "messages": messages,
            "temperature": 0.1,
        }
        resp = await self._http.post("/chat/completions", json=payload, headers=headers)
        resp.raise_for_status()
        data = resp.json()
        return data["choices"][0]["message"]

    async def complete_stream(self, messages: list[dict]) -> AsyncGenerator[str, None]:
        headers = await self._get_headers()
        payload = {
            "model": self._get_model(),
            "messages": messages,
            "temperature": 0.1,
            "stream": True,
        }
        async with self._http.stream("POST", "/chat/completions", json=payload, headers=headers) as resp:
            resp.raise_for_status()
            async for line in resp.aiter_lines():
                if not line.startswith("data: "):
                    continue
                data_str = line[6:]
                if data_str.strip() == "[DONE]":
                    break
                try:
                    chunk = json.loads(data_str)
                    delta = chunk["choices"][0].get("delta", {})
                    content = delta.get("content")
                    if content:
                        yield content
                except (json.JSONDecodeError, KeyError, IndexError):
                    continue

    async def close(self):
        await self._http.aclose()
