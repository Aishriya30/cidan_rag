import json
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime
from app.config import settings
from app.models.schemas import DocumentItem

logger = logging.getLogger(__name__)

class DocumentRegistry:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def __init__(self):
        self.registry_file = settings.DATA_DIR / "documents.json"
        self._ensure_storage()

    def _ensure_storage(self):
        if not self.registry_file.exists():
            self._save_docs([])

    def _load_docs(self) -> List[dict]:
        try:
            if self.registry_file.exists():
                with open(self.registry_file, "r", encoding="utf-8") as f:
                    return json.load(f)
            return []
        except Exception as e:
            logger.error(f"Error loading document registry: {e}")
            return []

    def _save_docs(self, docs: List[dict]):
        try:
            with open(self.registry_file, "w", encoding="utf-8") as f:
                json.dump(docs, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving document registry: {e}")

    def list_documents(self) -> List[DocumentItem]:
        raw_docs = self._load_docs()
        return [DocumentItem(**d) for d in raw_docs]

    def get_document(self, doc_id: str) -> Optional[DocumentItem]:
        docs = self._load_docs()
        for d in docs:
            if d.get("doc_id") == doc_id:
                return DocumentItem(**d)
        return None

    def upsert_document(self, doc: DocumentItem):
        docs = self._load_docs()
        updated = False
        for i, existing in enumerate(docs):
            if existing.get("doc_id") == doc.doc_id:
                docs[i] = doc.model_dump()
                updated = True
                break
        if not updated:
            docs.append(doc.model_dump())
        self._save_docs(docs)

    def delete_document(self, doc_id: str) -> bool:
        docs = self._load_docs()
        new_docs = [d for d in docs if d.get("doc_id") != doc_id]
        if len(new_docs) < len(docs):
            self._save_docs(new_docs)
            return True
        return False

doc_registry = DocumentRegistry.get_instance()
