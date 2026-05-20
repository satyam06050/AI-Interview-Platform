import io
import os
from pathlib import Path
from fastapi import UploadFile, HTTPException

try:
    from pdfminer.high_level import extract_text_to_fp
    from pdfminer.layout import LAParams
    PDFMINER_AVAILABLE = True
except ImportError:
    PDFMINER_AVAILABLE = False

try:
    import PyPDF2
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False

UPLOAD_DIR = Path("uploads/resumes")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


async def save_resume_file(file: UploadFile, user_id: str) -> tuple[str, str]:
    """Save uploaded PDF, return (storage_path, filename)."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large. Maximum 5 MB.")

    safe_name = f"{user_id}_{file.filename.replace(' ', '_')}"
    dest = UPLOAD_DIR / safe_name
    dest.write_bytes(content)
    return str(dest), file.filename


def extract_text_from_pdf(path: str) -> str:
    """Extract raw text from a PDF file."""
    text = ""

    if PDFMINER_AVAILABLE:
        try:
            output = io.StringIO()
            with open(path, "rb") as f:
                extract_text_to_fp(f, output, laparams=LAParams(), output_type="text", codec="utf-8")
            text = output.getvalue().strip()
        except Exception:
            pass

    if not text and PYPDF2_AVAILABLE:
        try:
            with open(path, "rb") as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() or ""
            text = text.strip()
        except Exception:
            pass

    return text
