import uuid
import logging
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from app.config import settings
from app.models.schemas import DocumentItem, DocumentUploadResponse
from app.services.extractor import sanitize_filename, extract_text_from_file
from app.services.chunker import chunk_document_pages
from app.services.embeddings import embedding_service
from app.rag.vector_store import vector_store
from app.services.doc_registry import doc_registry

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/documents", response_model=list[DocumentItem])
def list_documents():
    return doc_registry.list_documents()

@router.post("/documents/upload", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form("Regulatory Circular")
):
    original_name = file.filename or "unnamed_document"
    safe_name = sanitize_filename(original_name)
    suffix = Path(safe_name).suffix.lower()

    if suffix not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{suffix}'. Only PDF and DOCX files are permitted."
        )

    doc_id = f"doc_{uuid.uuid4().hex[:10]}"
    saved_path = settings.UPLOADS_DIR / f"{doc_id}_{safe_name}"

    # Read and validate file size safely
    content_bytes = bytearray()
    chunk_size = 1024 * 1024  # 1MB chunks
    total_size = 0

    while True:
        chunk = await file.read(chunk_size)
        if not chunk:
            break
        total_size += len(chunk)
        if total_size > settings.MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024*1024)}MB."
            )
        content_bytes.extend(chunk)

    # Save to disk
    with open(saved_path, "wb") as f:
        f.write(content_bytes)

    # Temporary record
    upload_timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    is_synthetic = "synthetic" in safe_name.lower() or "fixture" in safe_name.lower()

    # Process extraction, chunking, and embedding
    try:
        pages_text = extract_text_from_file(saved_path, safe_name)
        page_count = len(pages_text)

        chunks = chunk_document_pages(
            pages_text=pages_text,
            doc_id=doc_id,
            filename=safe_name,
            doc_type=doc_type,
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP
        )

        if not chunks:
            raise ValueError("No valid text segments produced from document.")

        # Embed all chunks
        chunk_texts = [c["content"] for c in chunks]
        embeddings = embedding_service.embed_texts(chunk_texts)

        # Store in ChromaDB
        indexed_count = vector_store.add_chunks(chunks, embeddings)

        doc_item = DocumentItem(
            doc_id=doc_id,
            filename=safe_name,
            doc_type=doc_type,
            file_size_bytes=total_size,
            page_count=page_count,
            chunk_count=indexed_count,
            upload_timestamp=upload_timestamp,
            indexing_status="indexed",
            is_synthetic_fixture=is_synthetic,
            summary=f"Successfully extracted {page_count} page(s) and indexed {indexed_count} chunks."
        )

        doc_registry.upsert_document(doc_item)
        logger.info(f"Document {safe_name} ({doc_id}) successfully indexed.")

        return DocumentUploadResponse(
            success=True,
            message=f"Document '{safe_name}' successfully parsed and indexed into vector store.",
            document=doc_item
        )

    except Exception as e:
        logger.error(f"Failed to process and index document {safe_name}: {e}")
        # Clean up partial file if needed
        if saved_path.exists():
            try:
                saved_path.unlink()
            except Exception:
                pass

        failed_item = DocumentItem(
            doc_id=doc_id,
            filename=safe_name,
            doc_type=doc_type,
            file_size_bytes=total_size,
            page_count=0,
            chunk_count=0,
            upload_timestamp=upload_timestamp,
            indexing_status="failed",
            is_synthetic_fixture=is_synthetic,
            summary=f"Indexing failed: {str(e)}"
        )
        doc_registry.upsert_document(failed_item)

        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Document parsing/indexing failed: {str(e)}"
        )

@router.delete("/documents/{doc_id}")
def delete_document(doc_id: str):
    doc = doc_registry.get_document(doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail=f"Document with ID '{doc_id}' not found.")

    # Remove from Chroma
    deleted_chunks = vector_store.delete_document(doc_id)
    # Remove from registry
    doc_registry.delete_document(doc_id)

    # Remove file on disk if exists
    for p in settings.UPLOADS_DIR.glob(f"{doc_id}_*"):
        try:
            p.unlink()
        except Exception as e:
            logger.warning(f"Failed to delete file {p}: {e}")

    return {
        "success": True,
        "message": f"Document '{doc.filename}' and {deleted_chunks} indexed chunk(s) removed successfully.",
        "doc_id": doc_id
    }
