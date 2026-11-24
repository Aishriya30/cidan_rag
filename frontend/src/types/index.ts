export interface Citation {
  document_name: string;
  doc_id: string;
  doc_type: string;
  page_number?: number | null;
  chunk_id: string;
  excerpt: string;
  similarity_score: number;
}

export interface RuleProposalDraft {
  id: string;
  title: string;
  target_policy: string;
  clause_reference: string;
  current_rule_summary: string;
  proposed_text: string;
  regulatory_rationale: string;
  status: string;
  evidence_sources: string[];
  impact_level: string;
  created_at: string;
}

export interface DocumentItem {
  doc_id: string;
  filename: string;
  doc_type: string;
  file_size_bytes: number;
  page_count: number;
  chunk_count: number;
  upload_timestamp: string;
  indexing_status: 'indexed' | 'failed' | 'processing';
  is_synthetic_fixture: boolean;
  summary?: string | null;
}

export interface ChatResponse {
  answer: string;
  summary: string;
  facts: string[];
  suggestions: string[];
  human_verification: string[];
  citations: Citation[];
  rule_proposals: RuleProposalDraft[];
  evidence_found: boolean;
  model_used: string;
  is_fallback: boolean;
  conversation_id: string;
}

export interface HealthResponse {
  status: string;
  backend_online: boolean;
  chroma_status: string;
  embedding_model: string;
  embedding_status: string;
  llm_status: string;
  llm_model: string;
  indexed_documents_count: number;
  indexed_chunks_count: number;
  version: string;
}

export interface ObligationItem {
  id: string;
  circular_id: string;
  circular_title: string;
  clause: string;
  category: string;
  requirement_summary: string;
  impacted_functions: string[];
  compliance_status: string;
  risk_rating: string;
  effective_date: string;
}

export interface PolicyMappingItem {
  id: string;
  circular_clause: string;
  circular_title: string;
  policy_code: string;
  policy_title: string;
  policy_section: string;
  alignment_status: string;
  gap_analysis: string;
  recommended_action: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  responseData?: ChatResponse;
  timestamp: string;
}
