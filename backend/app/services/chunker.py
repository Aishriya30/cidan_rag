from typing import List, Dict, Any, Tuple
import re

def split_text_into_chunks(
    text: str, 
    chunk_size: int = 700, 
    chunk_overlap: int = 150
) -> List[str]:
    """
    Split text into overlapping chunks respecting natural paragraph and sentence boundaries.
    """
    text = re.sub(r'\s+', ' ', text).strip()
    if not text:
        return []

    if len(text) <= chunk_size:
        return [text]

    chunks: List[str] = []
    start = 0
    total_len = len(text)

    while start < total_len:
        end = start + chunk_size
        if end >= total_len:
            chunks.append(text[start:].strip())
            break

        # Look for natural boundary near end (period, newline, semicolon)
        boundary = -1
        for sep in [". ", "? ", "! ", "; ", ".\n", "\n\n", " "]:
            idx = text.rfind(sep, start + chunk_size // 2, end)
            if idx != -1:
                boundary = idx + len(sep)
                break

        if boundary == -1 or boundary <= start:
            boundary = end

        chunk = text[start:boundary].strip()
        if chunk:
            chunks.append(chunk)

        # Advance start with overlap
        start = max(start + 1, boundary - chunk_overlap)

    return chunks

def chunk_document_pages(
    pages_text: List[Tuple[int, str]],
    doc_id: str,
    filename: str,
    doc_type: str = "Regulatory Circular",
    chunk_size: int = 700,
    chunk_overlap: int = 150
) -> List[Dict[str, Any]]:
    """
    Chunks document pages into overlapping segments while retaining page number and metadata.
    """
    all_chunks: List[Dict[str, Any]] = []
    global_chunk_idx = 0

    for page_num, page_content in pages_text:
        page_chunks = split_text_into_chunks(page_content, chunk_size, chunk_overlap)
        for page_chunk_idx, chunk_text in enumerate(page_chunks):
            chunk_id = f"{doc_id}_p{page_num}_c{page_chunk_idx + 1}"
            all_chunks.append({
                "chunk_id": chunk_id,
                "doc_id": doc_id,
                "filename": filename,
                "doc_type": doc_type,
                "page_number": page_num,
                "chunk_index": global_chunk_idx,
                "content": chunk_text
            })
            global_chunk_idx += 1

    return all_chunks
