import base64
from pathlib import Path

import fitz  # PyMuPDF


def detect_pdf_type(file_path: str) -> str:
    doc = fitz.open(file_path)
    total_text_len = 0
    for page in doc:
        total_text_len += len(page.get_text("text").strip())
    doc.close()

    avg_text_per_page = total_text_len / max(doc.page_count, 1)
    return "machine_readable" if avg_text_per_page > 50 else "scanned"


def extract_text_pages(file_path: str) -> list[str]:
    doc = fitz.open(file_path)
    pages = []
    for page in doc:
        text = page.get_text("text").strip()
        if text:
            pages.append(text)
    doc.close()
    return pages


def extract_image_pages(file_path: str) -> list[str]:
    doc = fitz.open(file_path)
    pages_b64 = []
    for page in doc:
        pix = page.get_pixmap(dpi=200)
        png_bytes = pix.tobytes("png")
        b64 = base64.b64encode(png_bytes).decode("utf-8")
        pages_b64.append(b64)
    doc.close()
    return pages_b64


def get_page_count(file_path: str) -> int:
    doc = fitz.open(file_path)
    count = doc.page_count
    doc.close()
    return count
