from app.rag.retriever import retriever
from app.services.seed_data import seed_database_if_empty

def test_retrieval_returns_relevant_chunks():
    # Ensure synthetic circular is seeded
    seed_database_if_empty()

    citations, raw_chunks, evidence_found = retriever.retrieve(
        query="What is the minimum Liquidity Coverage Ratio (LCR) requirement?",
        top_k=3
    )

    assert evidence_found is True
    assert len(citations) > 0
    assert len(raw_chunks) > 0

    # Ensure top citation contains relevant keywords
    top_chunk_text = raw_chunks[0]["content"].lower()
    assert "liquidity" in top_chunk_text or "lcr" in top_chunk_text
    assert citations[0].similarity_score > 0.22
