import logging
from typing import List, Tuple, Optional, Dict, Any
from app.config import settings
from app.models.schemas import Citation
from app.services.embeddings import embedding_service
from app.rag.vector_store import vector_store

logger = logging.getLogger(__name__)

class Retriever:
    def __init__(self, threshold: float = settings.SIMILARITY_THRESHOLD):
        self.threshold = threshold

    def retrieve(
        self, 
        query: str, 
        top_k: int = settings.TOP_K_RETRIEVAL, 
        doc_type_filter: Optional[str] = None,
        context_query: Optional[str] = None
    ) -> Tuple[List[Citation], List[Dict[str, Any]], bool]:
        """
        Retrieves relevant document chunks for a query.
        Optionally uses an enriched context_query for follow-up questions to resolve references.
        Returns:
            - citations: List[Citation]
            - raw_chunks: List[Dict[str, Any]]
            - evidence_found: bool (True if at least one chunk meets the similarity threshold)
        """
        if not query or not query.strip():
            return [], [], False

        where_filter = None
        if doc_type_filter:
            where_filter = {"doc_type": doc_type_filter}

        # 1. Query with user query
        query_embedding = embedding_service.embed_query(query.strip())
        raw_results = vector_store.query(
            query_embedding=query_embedding,
            top_k=top_k,
            where=where_filter
        ) or []

        # 2. If context_query differs (e.g. conversational follow-up), query context as well
        combined_map: Dict[str, Dict[str, Any]] = {
            item["chunk_id"]: item for item in raw_results
        }

        if context_query and context_query.strip() and context_query.strip() != query.strip():
            context_embedding = embedding_service.embed_query(context_query.strip())
            context_results = vector_store.query(
                query_embedding=context_embedding,
                top_k=top_k,
                where=where_filter
            ) or []

            for item in context_results:
                cid = item["chunk_id"]
                if cid not in combined_map or item["similarity"] > combined_map[cid]["similarity"]:
                    combined_map[cid] = item

        # Sort all candidates by similarity descending
        all_candidates = sorted(combined_map.values(), key=lambda x: x["similarity"], reverse=True)[:top_k]

        if not all_candidates:
            logger.info("No chunks returned from vector store.")
            return [], [], False

        # Filter strictly by similarity threshold
        valid_chunks: List[Dict[str, Any]] = []
        citations: List[Citation] = []

        for item in all_candidates:
            sim = item["similarity"]
            if sim >= self.threshold:
                valid_chunks.append(item)
                meta = item["metadata"]
                
                content = item["content"].strip()
                excerpt = content if len(content) <= 350 else content[:347] + "..."

                citations.append(
                    Citation(
                        document_name=meta.get("filename", "Unknown Document"),
                        doc_id=meta.get("doc_id", "unknown"),
                        doc_type=meta.get("doc_type", "Regulatory Circular"),
                        page_number=meta.get("page_number"),
                        chunk_id=item["chunk_id"],
                        excerpt=excerpt,
                        similarity_score=round(sim, 4)
                    )
                )

        evidence_found = len(valid_chunks) > 0
        logger.info(f"Retrieved {len(citations)} citations meeting threshold {self.threshold} (total candidates: {len(all_candidates)})")

        return citations, valid_chunks, evidence_found

retriever = Retriever()
