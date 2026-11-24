import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from app.config import settings

logger = logging.getLogger(__name__)

class VectorStore:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        logger.info(f"Connecting to ChromaDB at: {settings.CHROMA_PERSIST_DIR}")
        self.client = chromadb.PersistentClient(
            path=str(settings.CHROMA_PERSIST_DIR),
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name=settings.CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
        logger.info(f"ChromaDB collection '{settings.CHROMA_COLLECTION_NAME}' ready. Current count: {self.collection.count()}")

    def add_chunks(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]]) -> int:
        if not chunks:
            return 0

        ids = [c["chunk_id"] for c in chunks]
        documents = [c["content"] for c in chunks]
        metadatas = [
            {
                "doc_id": str(c["doc_id"]),
                "filename": str(c["filename"]),
                "doc_type": str(c.get("doc_type", "Regulatory Circular")),
                "page_number": int(c.get("page_number", 1)),
                "chunk_index": int(c.get("chunk_index", 0))
            }
            for c in chunks
        ]

        # Upsert into ChromaDB
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=documents,
            metadatas=metadatas
        )
        logger.info(f"Upserted {len(chunks)} chunks into ChromaDB.")
        return len(chunks)

    def query(
        self, 
        query_embedding: List[float], 
        top_k: int = 4, 
        where: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        count = self.collection.count()
        if count == 0:
            return []

        actual_k = min(top_k, count)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=actual_k,
            where=where,
            include=["documents", "metadatas", "distances"]
        )

        retrieved: List[Dict[str, Any]] = []
        if not results or not results["ids"] or not results["ids"][0]:
            return []

        ids = results["ids"][0]
        docs = results["documents"][0] if results.get("documents") else []
        metas = results["metadatas"][0] if results.get("metadatas") else []
        dists = results["distances"][0] if results.get("distances") else []

        for i in range(len(ids)):
            dist = dists[i] if i < len(dists) else 1.0
            # For cosine distance: distance is 1 - cosine_similarity. Thus similarity = 1 - distance
            similarity = max(0.0, min(1.0, 1.0 - dist))
            meta = metas[i] if i < len(metas) else {}
            doc_content = docs[i] if i < len(docs) else ""

            retrieved.append({
                "chunk_id": ids[i],
                "content": doc_content,
                "metadata": meta,
                "distance": dist,
                "similarity": similarity
            })

        return retrieved

    def delete_document(self, doc_id: str) -> int:
        try:
            # Query chunks belonging to doc_id
            existing = self.collection.get(
                where={"doc_id": doc_id},
                include=["metadatas"]
            )
            if existing and existing["ids"]:
                chunk_ids = existing["ids"]
                self.collection.delete(ids=chunk_ids)
                logger.info(f"Deleted {len(chunk_ids)} chunks for doc_id {doc_id}")
                return len(chunk_ids)
            return 0
        except Exception as e:
            logger.error(f"Error deleting doc {doc_id}: {e}")
            return 0

    def get_count(self) -> int:
        return self.collection.count()

vector_store = VectorStore.get_instance()
