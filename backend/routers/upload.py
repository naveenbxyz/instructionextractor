import uuid
from pathlib import Path

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile

from config import UPLOAD_DIR
from models.schemas import ExtractionResponse
from routers.clients import _load_config
from services.chat_service import create_session
from services.extraction_service import extract_document
from services.pdf_processor import detect_pdf_type, extract_image_pages, extract_text_pages

router = APIRouter(prefix="/api", tags=["upload"])


@router.post("/upload", response_model=ExtractionResponse)
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    client_id: str = Form(...),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    client_config = _load_config(client_id)

    # Save uploaded file
    file_id = uuid.uuid4().hex[:12]
    save_path = UPLOAD_DIR / f"{file_id}_{file.filename}"
    content = await file.read()
    save_path.write_bytes(content)

    try:
        pdf_type = detect_pdf_type(str(save_path))

        if pdf_type == "machine_readable":
            pages_content = extract_text_pages(str(save_path))
        else:
            pages_content = extract_image_pages(str(save_path))

        if not pages_content:
            raise HTTPException(status_code=400, detail="PDF appears to be empty")

        llm_client = request.app.state.llm_client
        page_results = await extract_document(
            file_path=str(save_path),
            pdf_type=pdf_type,
            pages_content=pages_content,
            client_config=client_config,
            llm_client=llm_client,
        )

        session_id = uuid.uuid4().hex
        create_session(
            session_id=session_id,
            filename=file.filename,
            pdf_type=pdf_type,
            pages_content=pages_content,
            extraction_result=[r.model_dump() for r in page_results],
        )

        return ExtractionResponse(
            filename=file.filename,
            total_pages=len(pages_content),
            pdf_type=pdf_type,
            pages=page_results,
            session_id=session_id,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Extraction failed: {str(e)}")
