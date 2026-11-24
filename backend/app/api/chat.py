import logging
import uuid
from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ChatRequest, ChatResponse
from app.rag.retriever import retriever
from app.rag.generator import generator
from app.services.doc_registry import doc_registry
from app.services.conversation import conversation_manager

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
def handle_chat(request: ChatRequest):
    query = request.message.strip()
    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User query message cannot be empty."
        )

    conv_id = request.conversation_id or str(uuid.uuid4())
    logger.info(f"Received chat query: '{query[:80]}...' (conv_id={conv_id}, top_k={request.top_k})")

    # Step 1: Resolve context query for follow-up questions
    context_query = conversation_manager.get_search_query(conv_id, query)

    # Step 2: Retrieve evidence chunks and citations
    citations, raw_chunks, evidence_found = retriever.retrieve(
        query=query,
        top_k=request.top_k,
        doc_type_filter=request.doc_type_filter,
        context_query=context_query
    )

    # Step 3: Fetch prior conversation history for conversational synthesis
    history = conversation_manager.get_history(conv_id)

    # Step 4: Grounded generation with conversational context
    response = generator.generate(
        query=query,
        citations=citations,
        retrieved_chunks=raw_chunks,
        evidence_found=evidence_found,
        conversation_id=conv_id,
        conversation_history=history
    )

    # Step 5: Save interaction turn in session memory if evidence found
    conversation_manager.add_turn(
        conversation_id=conv_id,
        user_query=query,
        assistant_answer=response.answer,
        citations=citations
    )

    return response

@router.post("/chat/reset")
def reset_chat_session(conversation_id: Optional[str] = None):
    """Resets conversational memory for a given session."""
    if conversation_id:
        conversation_manager.clear(conversation_id)
    return {"success": True, "message": "Conversation session reset successfully."}

@router.get("/chat/suggestions", response_model=List[str])
def get_chat_suggestions():
    # Base required prompts
    suggestions = [
        "Summarize the Prudential Liquidity Circular CB-2024-09.",
        "What are the minimum LCR ratio and reporting obligations?",
        "Identify gaps between Circular CB-2024-09 and internal policy POL-TREAS-04.",
        "What cloud vendor recovery time (RTO) standards are mandated?",
        "Explain which bank departments are responsible for liquidity compliance.",
        "Suggest a draft compliance rule to align internal policies with circular provisions."
    ]

    docs = doc_registry.list_documents()
    for doc in docs[:2]:
        suggestions.append(f"What key compliance dates are specified in {doc.filename}?")

    return suggestions[:6]
