from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["backend_online"] is True
    assert "chroma_status" in data
    assert "embedding_status" in data
    assert "llm_status" in data
    assert data["embedding_model"] == "all-MiniLM-L6-v2"
    assert data["indexed_chunks_count"] >= 0
