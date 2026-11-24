from pydantic import BaseModel, Field
from typing import List, Optional

class Citation(BaseModel):
    document_name: str
    doc_id: str
    doc_type: str = "Regulatory Circular"
    page_number: Optional[int] = None
    chunk_id: str
    excerpt: str
    similarity_score: float = Field(..., description="Cosine similarity score between 0 and 1")

class RuleProposalDraft(BaseModel):
    id: str
    title: str
    target_policy: str
    clause_reference: str
    current_rule_summary: str
    proposed_text: str
    regulatory_rationale: str
    status: str = "DRAFT - Requires Human Approval"
    evidence_sources: List[str] = Field(default_factory=list)
    impact_level: str = "Medium"
    created_at: str

class DocumentItem(BaseModel):
    doc_id: str
    filename: str
    doc_type: str
    file_size_bytes: int
    page_count: int
    chunk_count: int
    upload_timestamp: str
    indexing_status: str  # 'indexed', 'failed', 'processing'
    is_synthetic_fixture: bool = False
    summary: Optional[str] = None

class DocumentUploadResponse(BaseModel):
    success: bool
    message: str
    document: DocumentItem

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[str] = None
    top_k: int = Field(default=4, ge=1, le=10)
    doc_type_filter: Optional[str] = None

class ChatResponse(BaseModel):
    answer: str
    summary: str
    facts: List[str] = Field(default_factory=list, description="Strictly retrieved, traceable facts from sources")
    suggestions: List[str] = Field(default_factory=list, description="AI-generated inferences or recommendations")
    human_verification: List[str] = Field(default_factory=list, description="Items requiring human sign-off/legal review")
    citations: List[Citation] = Field(default_factory=list)
    rule_proposals: List[RuleProposalDraft] = Field(default_factory=list)
    evidence_found: bool = True
    model_used: str
    is_fallback: bool = False
    conversation_id: str

class HealthResponse(BaseModel):
    status: str
    backend_online: bool
    chroma_status: str
    embedding_model: str
    embedding_status: str
    llm_status: str
    llm_model: str
    indexed_documents_count: int
    indexed_chunks_count: int
    version: str

class ObligationItem(BaseModel):
    id: str
    circular_id: str
    circular_title: str
    clause: str
    category: str
    requirement_summary: str
    impacted_functions: List[str]
    compliance_status: str  # 'Compliant', 'Action Required', 'Pending Policy Revision'
    risk_rating: str        # 'High', 'Medium', 'Low'
    effective_date: str

class PolicyMappingItem(BaseModel):
    id: str
    circular_clause: str
    circular_title: str
    policy_code: str
    policy_title: str
    policy_section: str
    alignment_status: str  # 'Fully Aligned', 'Gap Identified', 'Update Required'
    gap_analysis: str
    recommended_action: str
