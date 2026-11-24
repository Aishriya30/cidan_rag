import time
import re
from typing import List, Dict, Any, Optional

class ConversationManager:
    """
    In-memory session manager for conversational context within CIDAN chat sessions.
    Stores recent turns per conversation_id, resolves follow-up queries,
    and formats context for the OpenAI model.
    """
    def __init__(self, ttl_seconds: int = 86400):
        # Maps conversation_id -> list of turn dicts
        self._conversations: Dict[str, List[Dict[str, Any]]] = {}
        self._last_accessed: Dict[str, float] = {}
        self.ttl_seconds = ttl_seconds

    def add_turn(
        self,
        conversation_id: str,
        user_query: str,
        assistant_answer: str,
        citations: Optional[List[Any]] = None
    ):
        self._cleanup_expired()
        if conversation_id not in self._conversations:
            self._conversations[conversation_id] = []
        
        turn = {
            "user_query": user_query.strip(),
            "assistant_answer": assistant_answer.strip(),
            "citations": [
                {
                    "doc_name": getattr(c, "document_name", None) or (c.get("document_name") if isinstance(c, dict) else None),
                    "page": getattr(c, "page_number", None) or (c.get("page_number") if isinstance(c, dict) else None)
                }
                for c in (citations or [])
            ],
            "timestamp": time.time()
        }
        self._conversations[conversation_id].append(turn)
        self._last_accessed[conversation_id] = time.time()

    def get_history(self, conversation_id: Optional[str], max_turns: int = 4) -> List[Dict[str, str]]:
        """Returns message list suitable for OpenAI chat format: [{'role': 'user', 'content': '...'}, ...]."""
        if not conversation_id or conversation_id not in self._conversations:
            return []
        
        turns = self._conversations[conversation_id][-max_turns:]
        messages = []
        for t in turns:
            messages.append({"role": "user", "content": t["user_query"]})
            messages.append({"role": "assistant", "content": t["assistant_answer"]})
        return messages

    def get_search_query(self, conversation_id: Optional[str], current_query: str) -> str:
        """
        If current_query is a conversational follow-up (e.g. 'Explain the second requirement', 'Who is responsible?'),
        enriches the query with context keywords from previous turns to ensure high vector similarity in ChromaDB.
        """
        if not conversation_id or conversation_id not in self._conversations or not self._conversations[conversation_id]:
            return current_query

        q_clean = current_query.strip()
        q_lower = q_clean.lower()
        
        follow_up_triggers = [
            "second", "third", "first", "fourth", "last", "previous", "that", "this",
            "the requirement", "the obligation", "the policy", "the circular", "it",
            "why", "how", "who", "when", "explain more", "tell me more", "elaborate",
            "what about", "which department", "clarify", "detail"
        ]
        
        words = q_lower.split()
        is_follow_up = len(words) <= 7 or any(trigger in q_lower for trigger in follow_up_triggers)

        if not is_follow_up:
            return current_query

        last_turn = self._conversations[conversation_id][-1]
        prev_user = last_turn["user_query"]
        
        # Enriched query for retrieval
        enriched = f"{current_query} (context: {prev_user})"
        return enriched

    def clear(self, conversation_id: str):
        self._conversations.pop(conversation_id, None)
        self._last_accessed.pop(conversation_id, None)

    def _cleanup_expired(self):
        now = time.time()
        expired = [cid for cid, last_time in self._last_accessed.items() if now - last_time > self.ttl_seconds]
        for cid in expired:
            self.clear(cid)

conversation_manager = ConversationManager()
