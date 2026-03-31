from pydantic import BaseModel
from typing import Literal, Optional


class LLMConfig(BaseModel):
    auth_type: Literal["api_key", "azure_ad"]
    base_url: str
    api_key: Optional[str] = None
    model: str
    stream: bool = True
    verify_ssl: bool = False
    azure_model: Optional[str] = None
    ca_bundle: Optional[str] = None
    https_proxy: Optional[str] = None
