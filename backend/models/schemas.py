from pydantic import BaseModel
from typing import Optional


class SectionDef(BaseModel):
    name: str
    description: Optional[str] = None
    fields: list[str]


class ClientConfig(BaseModel):
    id: str
    name: str
    prompt: str
    sections: list[SectionDef]


class ClientConfigSummary(BaseModel):
    id: str
    name: str


class PageResult(BaseModel):
    page_number: int
    extracted: dict
    accuracy: Optional[dict] = None


class ExtractionResponse(BaseModel):
    filename: str
    total_pages: int
    pdf_type: str
    pages: list[PageResult]
    session_id: str


class ChatRequest(BaseModel):
    message: str
    session_id: str
