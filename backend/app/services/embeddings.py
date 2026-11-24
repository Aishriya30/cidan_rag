import logging
from typing import List
from sentence_transformers import SentenceTransformer
from app.config import settings

logger = logging.getLogger(__name__)

class EmbeddingService:
    _instance = None
    _model = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        try:
            logger.info(f"Initializing SentenceTransformer with model: {settings.EMBEDDING_MODEL_NAME}")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            logger.info("SentenceTransformer model successfully initialized.")
        except Exception as e:
            logger.error(f"Error loading SentenceTransformer: {e}")
            raise e

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        embeddings = self._model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
        return embeddings.tolist()

    def embed_query(self, query: str) -> List[float]:
        return self.embed_texts([query])[0]

    @property
    def model_name(self) -> str:
        return settings.EMBEDDING_MODEL_NAME

    @property
    def is_ready(self) -> bool:
        return self._model is not None

embedding_service = EmbeddingService.get_instance()
