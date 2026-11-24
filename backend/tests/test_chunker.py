from app.services.chunker import split_text_into_chunks, chunk_document_pages

def test_split_text_into_chunks():
    sample_text = (
        "Commercial banks shall maintain an ongoing Liquidity Coverage Ratio of not less than 105%. "
        "The High-Quality Liquid Assets portfolio must comprise at least 70% Level 1 unencumbered sovereign securities. "
        "Daily monitoring is required. In the event of a variance where the LCR dips below 108%, immediate written notice must be submitted."
    )
    chunks = split_text_into_chunks(sample_text, chunk_size=120, chunk_overlap=30)
    assert len(chunks) >= 2
    # Ensure natural sentence/word split
    for chunk in chunks:
        assert len(chunk) > 0
        assert not chunk.startswith(" ")

def test_chunk_document_pages_metadata():
    pages = [
        (1, "Section 1: General provisions and scope for commercial banks under Tier 1 guidelines."),
        (2, "Section 2: Minimum capital adequacy and liquidity buffer requirements.")
    ]
    chunks = chunk_document_pages(
        pages_text=pages,
        doc_id="doc_test_123",
        filename="test_circular.docx",
        doc_type="Regulatory Circular",
        chunk_size=100,
        chunk_overlap=20
    )
    assert len(chunks) == 2
    assert chunks[0]["page_number"] == 1
    assert chunks[0]["chunk_id"] == "doc_test_123_p1_c1"
    assert chunks[0]["filename"] == "test_circular.docx"
    assert chunks[0]["doc_type"] == "Regulatory Circular"
    assert chunks[1]["page_number"] == 2
    assert chunks[1]["chunk_id"] == "doc_test_123_p2_c1"
