from app.rag.retriever import retriever
from app.services.seed_data import seed_database_if_empty

def test_citation_metadata_integrity():
    seed_database_if_empty()

    citations, _, evidence_found = retriever.retrieve(
        query="What are the Recovery Time Objective requirements for cloud workloads?",
        top_k=2
    )

    assert evidence_found is True
    assert len(citations) > 0

    citation = citations[0]
    # Check that citation has non-empty document name, page number, and excerpt
    assert citation.document_name.endswith(".docx") or citation.document_name.endswith(".pdf")
    assert citation.page_number is not None
    assert citation.page_number >= 1
    assert len(citation.excerpt) > 10
    assert 0.0 <= citation.similarity_score <= 1.0
    assert len(citation.chunk_id) > 0
