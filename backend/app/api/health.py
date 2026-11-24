from fastapi import APIRouter
from app.config import settings
from app.models.schemas import HealthResponse
from app.rag.vector_store import vector_store
from app.services.embeddings import embedding_service
from app.services.llm import llm_service
from app.services.doc_registry import doc_registry

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def get_health():
    try:
        chunk_count = vector_store.get_count()
        chroma_status = "operational"
    except Exception as e:
        chroma_status = f"unhealthy: {str(e)}"
        chunk_count = 0

    indexed_docs = len(doc_registry.list_documents())

    return HealthResponse(
        status="healthy",
        backend_online=True,
        chroma_status=chroma_status,
        embedding_model=embedding_service.model_name,
        embedding_status="operational" if embedding_service.is_ready else "initializing",
        llm_status="configured (OpenAI)" if llm_service.is_configured else "offline / extractive engine",
        llm_model=llm_service.model if llm_service.is_configured else "extractive-synthesizer",
        indexed_documents_count=indexed_docs,
        indexed_chunks_count=chunk_count,
        version="1.0.0-enterprise"
    )
