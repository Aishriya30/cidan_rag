import logging
import gc
from typing import List
import torch
from sentence_transformers import SentenceTransformer
from app.config import settings

# Restrict PyTorch to 1 CPU thread to minimize memory on 512MB hosts
torch.set_num_threads(1)

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
            logger.info(f"Initializing SentenceTransformer on CPU: {settings.EMBEDDING_MODEL_NAME}")
            self._model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME, device="cpu")
            self._model.eval()
            logger.info("SentenceTransformer model successfully initialized.")
        except Exception as e:
            logger.error(f"Error loading SentenceTransformer: {e}")
            raise e

    def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        with torch.inference_mode():
            # batch_size=4 keeps tensor memory under 15MB
            embeddings = self._model.encode(
                texts,
                batch_size=4,
                convert_to_numpy=True,
                normalize_embeddings=True,
                show_progress_bar=False
            )
        result = embeddings.tolist()
        gc.collect()
        return result

    def embed_query(self, query: str) -> List[float]:
        return self.embed_texts([query])[0]

    @property
    def model_name(self) -> str:
        return settings.EMBEDDING_MODEL_NAME

    @property
    def is_ready(self) -> bool:
        return self._model is not None

embedding_service = EmbeddingService.get_instance()
