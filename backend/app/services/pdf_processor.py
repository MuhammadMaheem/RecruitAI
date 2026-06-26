import pdfplumber
from pathlib import Path


def extract_text_from_pdf(file_path: str | Path) -> str:
    text_parts = []
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text.strip())
    return "\n\n".join(text_parts)


def validate_pdf(file_path: str | Path) -> bool:
    try:
        with pdfplumber.open(file_path) as pdf:
            return len(pdf.pages) > 0
    except Exception:
        return False
