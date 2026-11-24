import {
  HealthResponse,
  DocumentItem,
  ChatResponse,
  ObligationItem,
  PolicyMappingItem,
  RuleProposalDraft,
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export async function fetchHealth(): Promise<HealthResponse> {
  const resp = await fetch(`${API_BASE}/health`);
  if (!resp.ok) {
    throw new Error(`Health check failed with status: ${resp.status}`);
  }
  return resp.json();
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  const resp = await fetch(`${API_BASE}/documents`);
  if (!resp.ok) {
    throw new Error(`Failed to fetch documents: ${resp.statusText}`);
  }
  return resp.json();
}

export async function uploadDocument(
  file: File,
  docType: string = 'Regulatory Circular'
): Promise<{ success: boolean; message: string; document: DocumentItem }> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('doc_type', docType);

  const resp = await fetch(`${API_BASE}/documents/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.detail || `Upload failed with status: ${resp.status}`);
  }

  return resp.json();
}

export async function deleteDocument(docId: string): Promise<{ success: boolean; message: string }> {
  const resp = await fetch(`${API_BASE}/documents/${docId}`, {
    method: 'DELETE',
  });

  if (!resp.ok) {
    throw new Error(`Delete failed: ${resp.statusText}`);
  }

  return resp.json();
}

export async function sendChatMessage(
  message: string,
  topK: number = 4,
  conversationId?: string | null
): Promise<ChatResponse> {
  const resp = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      top_k: topK,
      ...(conversationId ? { conversation_id: conversationId } : {}),
    }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.detail || `Chat request failed: ${resp.statusText}`);
  }

  return resp.json();
}

export async function fetchSuggestions(): Promise<string[]> {
  try {
    const resp = await fetch(`${API_BASE}/chat/suggestions`);
    if (resp.ok) {
      return resp.json();
    }
  } catch (e) {
    console.warn('Failed to fetch dynamic suggestions:', e);
  }
  return [
    'Summarize an uploaded regulatory circular.',
    'Identify the obligations introduced by this circular.',
    'Find internal policies related to an obligation.',
    'Explain which evidence supports a compliance answer.',
  ];
}

export async function fetchObligations(): Promise<ObligationItem[]> {
  const resp = await fetch(`${API_BASE}/compliance/obligations`);
  if (!resp.ok) {
    throw new Error('Failed to fetch regulatory obligations');
  }
  return resp.json();
}

export async function fetchPolicyMappings(): Promise<PolicyMappingItem[]> {
  const resp = await fetch(`${API_BASE}/compliance/policy-mappings`);
  if (!resp.ok) {
    throw new Error('Failed to fetch policy mappings');
  }
  return resp.json();
}

export async function fetchRuleDrafts(): Promise<RuleProposalDraft[]> {
  const resp = await fetch(`${API_BASE}/compliance/rule-drafts`);
  if (!resp.ok) {
    throw new Error('Failed to fetch rule drafts');
  }
  return resp.json();
}

export async function submitRuleDraftAction(
  draftId: string,
  action: string,
  comments: string = ''
): Promise<{ success: boolean; message: string; draft: RuleProposalDraft }> {
  const resp = await fetch(`${API_BASE}/compliance/rule-drafts/${draftId}/action`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action,
      reviewed_by: 'Chief Compliance Officer',
      comments,
    }),
  });

  if (!resp.ok) {
    throw new Error('Failed to update draft action');
  }

  return resp.json();
}
