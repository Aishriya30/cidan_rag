from fastapi.testclient import TestClient
from app.main import app
from app.rag.generator import INSUFFICIENT_EVIDENCE_MESSAGE
from app.services.seed_data import seed_database_if_empty

client = TestClient(app)

def test_insufficient_evidence_handling():
    seed_database_if_empty()

    # Query completely unrelated to banking compliance or indexed documents
    irrelevant_query = "What is the secret recipe for baking strawberry cheesecake cupcakes in space?"
    
    response = client.post(
        "/api/chat",
        json={"message": irrelevant_query, "top_k": 3}
    )

    assert response.status_code == 200
    data = response.json()
    
    # Must flag evidence_found as False
    assert data["evidence_found"] is False
    # Must return exact required insufficient evidence message
    assert data["answer"] == "I couldn't find sufficient information in the uploaded documents to answer this question confidently."
    assert data["summary"] == "I couldn't find sufficient information in the uploaded documents to answer this question confidently."
    assert INSUFFICIENT_EVIDENCE_MESSAGE == "I couldn't find sufficient information in the uploaded documents to answer this question confidently."
    # Citations must be empty
    assert len(data["citations"]) == 0
    # Must provide constructive next-step suggestions
    assert len(data["suggestions"]) > 0
