import uuid
from typing import List, Dict, Any, Optional
from app.models.schemas import ChatResponse, Citation, RuleProposalDraft
from app.services.llm import llm_service

INSUFFICIENT_EVIDENCE_MESSAGE = "I couldn't find sufficient information in the uploaded documents to answer this question confidently."

class Generator:
    def generate(
        self,
        query: str,
        citations: List[Citation],
        retrieved_chunks: List[Dict[str, Any]],
        evidence_found: bool,
        conversation_id: Optional[str] = None,
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> ChatResponse:
        conv_id = conversation_id or str(uuid.uuid4())

        # Enforce insufficient evidence rule
        if not evidence_found or not retrieved_chunks:
            return ChatResponse(
                answer=INSUFFICIENT_EVIDENCE_MESSAGE,
                summary=INSUFFICIENT_EVIDENCE_MESSAGE,
                facts=[],
                suggestions=[
                    "Upload the relevant regulatory circular (PDF/DOCX) in the Knowledge Base.",
                    "Verify that the document indexing status shows 'indexed'.",
                    "Try refining query keywords (e.g. 'capital adequacy ratio', 'AML reporting deadline', 'liquidity buffer')."
                ],
                human_verification=[
                    "Check if the required regulatory circular has been gazetted or released by the supervisory authority.",
                    "Consult the Compliance Register to verify if the bank holds an unindexed copy."
                ],
                citations=[],
                rule_proposals=[],
                evidence_found=False,
                model_used=llm_service.model if llm_service.is_configured else "CIDAN Compliance Core",
                is_fallback=not llm_service.is_configured,
                conversation_id=conv_id
            )

        # Grounded generation with separation of facts, suggestions, and verification
        grounded_data = llm_service.generate_grounded_response(
            query=query, 
            retrieved_chunks=retrieved_chunks, 
            conversation_history=conversation_history
        )

        # If model determined evidence was insufficient
        if grounded_data.get("has_sufficient_evidence") is False:
            return ChatResponse(
                answer=INSUFFICIENT_EVIDENCE_MESSAGE,
                summary=INSUFFICIENT_EVIDENCE_MESSAGE,
                facts=[],
                suggestions=grounded_data.get("suggestions", []),
                human_verification=grounded_data.get("human_verification", []),
                citations=[],
                rule_proposals=[],
                evidence_found=False,
                model_used=grounded_data.get("model_used", "CIDAN Compliance Core"),
                is_fallback=grounded_data.get("is_fallback", False),
                conversation_id=conv_id
            )

        answer_text = llm_service._format_short_answer(
            grounded_data.get("answer", ""),
            retrieved_chunks
        )
        summary_text = grounded_data.get("summary") or (answer_text[:200] + "..." if len(answer_text) > 200 else answer_text)

        return ChatResponse(
            answer=answer_text,
            summary=summary_text,
            facts=grounded_data.get("facts", []),
            suggestions=grounded_data.get("suggestions", []),
            human_verification=grounded_data.get("human_verification", []),
            citations=citations,
            rule_proposals=grounded_data.get("rule_proposals", []),
            evidence_found=True,
            model_used=grounded_data.get("model_used", "CIDAN Compliance Core"),
            is_fallback=grounded_data.get("is_fallback", False),
            conversation_id=conv_id
        )

generator = Generator()
