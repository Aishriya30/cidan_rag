import re
from pathlib import Path
from typing import List, Tuple
import pymupdf
import docx

def sanitize_filename(filename: str) -> str:
    """
    Sanitize filename to prevent directory traversal and remove unsafe characters.
    """
    # Keep only base name
    cleaned = Path(filename).name
    # Replace dangerous characters with underscores
    cleaned = re.sub(r'[^a-zA-Z0-9_\.\-]', '_', cleaned)
    # Prevent hidden files or double dots
    cleaned = re.sub(r'\.{2,}', '.', cleaned)
    if cleaned.startswith('.'):
        cleaned = 'doc' + cleaned
    return cleaned

def extract_text_from_file(file_path: Path, filename: str) -> List[Tuple[int, str]]:
    """
    Extracts text from PDF or DOCX file, preserving 1-indexed page numbers.
    Returns: List of (page_number, page_text) tuples.
    """
    suffix = file_path.suffix.lower()
    pages_text: List[Tuple[int, str]] = []

    if suffix == ".pdf":
        doc = pymupdf.open(file_path)
        for page_idx in range(len(doc)):
            page = doc[page_idx]
            text = page.get_text("text").strip()
            if text:
                pages_text.append((page_idx + 1, text))
        doc.close()

    elif suffix == ".docx":
        doc = docx.Document(file_path)
        current_page = 1
        page_chunks: List[str] = []
        word_count = 0

        for p in doc.paragraphs:
            text = p.text.strip()
            if not text:
                continue

            # Check for explicit page break in runs
            has_page_break = False
            for run in p.runs:
                if 'lastRenderedPageBreak' in run._r.xml or 'w:br w:type="page"' in run._r.xml:
                    has_page_break = True
                    break

            page_chunks.append(text)
            words = len(text.split())
            word_count += words

            # Increment page if explicit break or ~450 words reached
            if has_page_break or word_count >= 450:
                pages_text.append((current_page, "\n".join(page_chunks)))
                page_chunks = []
                word_count = 0
                current_page += 1

        # Also extract table contents if any
        table_chunks: List[str] = []
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    table_chunks.append(row_text)

        if table_chunks:
            page_chunks.append("\n[Document Tables]\n" + "\n".join(table_chunks))

        if page_chunks:
            pages_text.append((current_page, "\n".join(page_chunks)))

    else:
        raise ValueError(f"Unsupported file format '{suffix}'. Allowed formats: .pdf, .docx")

    if not pages_text:
        raise ValueError(f"No extractable text found in '{filename}'. File may be empty or scanned image without OCR.")

    return pages_text
