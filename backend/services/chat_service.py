from typing import AsyncGenerator

from services.llm_client import LLMClient

# In-memory session store: session_id -> session data
_sessions: dict[str, dict] = {}


def create_session(session_id: str, filename: str, pdf_type: str, pages_content: list[str], extraction_result: list[dict]):
    context_parts = []
    for i, page in enumerate(pages_content):
        if pdf_type == "machine_readable":
            context_parts.append(f"--- Page {i + 1} ---\n{page}")

    context_text = "\n\n".join(context_parts) if context_parts else "(Scanned document — text not available, refer to extraction results)"

    extraction_json = "\n".join(
        f"Page {r['page_number']}: {r['extracted']}" for r in extraction_result
    )

    _sessions[session_id] = {
        "filename": filename,
        "pdf_type": pdf_type,
        "system_message": {
            "role": "system",
            "content": f"""You are an assistant helping analyze a Standard Settlement Instruction (SSI) document.

Document: {filename}
Type: {pdf_type}

## Document Content
{context_text}

## Extracted Data
{extraction_json}

Answer questions about this document accurately. Reference specific fields and values from the extracted data. If something is unclear or not in the data, say so.""",
        },
        "messages": [],
    }


def get_session(session_id: str) -> dict | None:
    return _sessions.get(session_id)


async def chat_stream(session_id: str, user_message: str, llm_client: LLMClient) -> AsyncGenerator[str, None]:
    session = _sessions.get(session_id)
    if not session:
        yield "Error: Session not found."
        return

    session["messages"].append({"role": "user", "content": user_message})

    messages = [session["system_message"]] + session["messages"]

    full_response = []
    async for chunk in llm_client.complete_stream(messages):
        full_response.append(chunk)
        yield chunk

    session["messages"].append({"role": "assistant", "content": "".join(full_response)})
