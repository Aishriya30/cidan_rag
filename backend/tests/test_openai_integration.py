import json
from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from openai import AuthenticationError, RateLimitError, APIConnectionError, OpenAIError

from app.main import app
from app.services.llm import LLMService, INSUFFICIENT_EVIDENCE_TEXT
from app.services.conversation import conversation_manager
from app.services.seed_data import seed_database_if_empty

client = TestClient(app)

def test_sdk_client_initialization():
    service = LLMService()
    # Without key, is_configured is False
    with patch.object(service, '_get_api_key', return_value=None):
        assert service.is_configured is False
        assert service.get_client() is None

    # With key, is_configured is True and client is created
    with patch.object(service, '_get_api_key', return_value="sk-test-mock-key-12345"):
        assert service.is_configured is True
        sdk_client = service.get_client()
        assert sdk_client is not None
        assert sdk_client.api_key == "sk-test-mock-key-12345"

def test_natural_conversational_answer_generation():
    seed_database_if_empty()

    mock_llm_response = {
        "has_sufficient_evidence": True,
        "answer": (
            "### Overview of Liquidity Requirements\n\n"
            "Under **Central Bank Circular CB-2024-09 (Page 2)**, all commercial banks are mandated "
            "to maintain a minimum **Liquidity Coverage Ratio (LCR) of 105%**.\n\n"
            "In simple terms, this means your bank must hold enough reliable liquid cash and high-quality assets "
            "to survive a 30-day severe cash drain without external assistance.\n\n"
            "### Key Obligations:\n"
            "• **Daily Monitoring**: The Treasury Department must calculate the LCR every business day.\n"
            "• **Breach Notification**: Report any drop below 105% to the Central Bank within 24 hours."
        ),
        "summary": "Mandatory 105% LCR ratio with daily monitoring by Treasury and 24-hour breach notification.",
        "facts": [
            "Banks shall maintain a minimum Liquidity Coverage Ratio (LCR) of 105% at all times. (Source: SYNTHETIC_CIRCULAR_CB_2024_09.docx, Page 2)",
            "LCR calculations must be performed daily by Treasury. (Source: SYNTHETIC_CIRCULAR_CB_2024_09.docx, Page 2)"
        ],
        "suggestions": [
            "Establish automated daily alerts in the core banking system at 107% buffer threshold."
        ],
        "human_verification": [
            "Chief Risk Officer must sign off monthly on the LCR liquidity stress testing report."
        ],
        "rule_proposals": []
    }

    mock_completion = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps(mock_llm_response)
    mock_completion.choices = [mock_choice]

    with patch("app.services.llm.llm_service._get_api_key", return_value="sk-test-valid-key"):
        with patch("app.services.llm.llm_service.get_client") as mock_get_client:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create.return_value = mock_completion
            mock_get_client.return_value = mock_client_instance

            resp = client.post(
                "/api/chat",
                json={"message": "What is the minimum Liquidity Coverage Ratio?", "top_k": 3}
            )

            assert resp.status_code == 200
            data = resp.json()
            assert data["evidence_found"] is True
            assert "Overview of Liquidity Requirements" in data["answer"]
            assert "105%" in data["answer"]
            assert len(data["citations"]) > 0
            assert data["citations"][0]["document_name"].endswith(".docx")
            assert data["citations"][0]["page_number"] is not None

def test_short_simple_grounded_answers():
    seed_database_if_empty()

    mock_llm_response = {
        "has_sufficient_evidence": True,
        "answer": (
            "### Overview of Liquidity Requirements\n\n"
            "Under **Central Bank Circular CB-2024-09 (Page 2)**, all banks must maintain a minimum **Liquidity Coverage Ratio (LCR) of 105%**.\n\n"
            "This means the bank needs enough liquid assets to survive a 30-day stress event.\n\n"
            "### Key Obligations\n"
            "• Daily monitoring is required.\n"
            "• Breach notifications must be sent within 24 hours."
        ),
        "summary": "Minimum LCR 105%, with daily monitoring and breach notice within 24 hours.",
        "facts": [
            "Banks must maintain a minimum LCR of 105%. (Source: SYNTHETIC_CIRCULAR_CB_2024_09.docx, Page 2)",
            "Daily monitoring is required. (Source: SYNTHETIC_CIRCULAR_CB_2024_09.docx, Page 2)"
        ],
        "suggestions": ["Review treasury monitoring controls."],
        "human_verification": ["Confirm with the CRO."],
        "rule_proposals": []
    }

    mock_completion = MagicMock()
    mock_choice = MagicMock()
    mock_choice.message.content = json.dumps(mock_llm_response)
    mock_completion.choices = [mock_choice]

    with patch("app.services.llm.llm_service._get_api_key", return_value="sk-test-valid-key"):
        with patch("app.services.llm.llm_service.get_client") as mock_get_client:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create.return_value = mock_completion
            mock_get_client.return_value = mock_client_instance

            resp = client.post(
                "/api/chat",
                json={"message": "What is the minimum LCR requirement?", "top_k": 3}
            )

            assert resp.status_code == 200
            data = resp.json()
            answer = data["answer"]
            assert "Page 2" in answer
            assert "###" not in answer
            assert "•" not in answer
            assert len(answer.splitlines()) <= 3


def test_conversational_memory_follow_up():
    seed_database_if_empty()
    conv_id = "test-session-multi-turn-001"
    conversation_manager.clear(conv_id)

    # Turn 1: Initial query
    resp1 = client.post(
        "/api/chat",
        json={
            "message": "What are the Liquidity Coverage Ratio requirements?",
            "conversation_id": conv_id,
            "top_k": 3
        }
    )
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["conversation_id"] == conv_id

    # Verify session history recorded
    history = conversation_manager.get_history(conv_id)
    assert len(history) == 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"

    # Turn 2: Follow-up query
    enriched_query = conversation_manager.get_search_query(conv_id, "Explain the second requirement.")
    assert "Explain the second requirement." in enriched_query
    assert "context:" in enriched_query

    resp2 = client.post(
        "/api/chat",
        json={
            "message": "Explain the second requirement.",
            "conversation_id": conv_id,
            "top_k": 3
        }
    )
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["conversation_id"] == conv_id

def test_error_handling_invalid_api_key():
    seed_database_if_empty()

    mock_resp = MagicMock()
    mock_resp.status_code = 401
    mock_resp.headers = {}
    auth_err = AuthenticationError(
        message="Incorrect API key provided.",
        response=mock_resp,
        body=None
    )

    with patch("app.services.llm.llm_service._get_api_key", return_value="sk-invalid-key"):
        with patch("app.services.llm.llm_service.get_client") as mock_get_client:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create.side_effect = auth_err
            mock_get_client.return_value = mock_client_instance

            # Must not crash, should fall back to extractive engine gracefully
            resp = client.post(
                "/api/chat",
                json={"message": "What is the LCR minimum?", "top_k": 2}
            )

            assert resp.status_code == 200
            data = resp.json()
            assert data["evidence_found"] is True
            assert data["is_fallback"] is True
            assert "Extractive Engine" in data["model_used"]
            assert len(data["facts"]) > 0

def test_error_handling_rate_limit():
    seed_database_if_empty()

    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.headers = {}
    rate_err = RateLimitError(
        message="Rate limit exceeded.",
        response=mock_resp,
        body=None
    )

    with patch("app.services.llm.llm_service._get_api_key", return_value="sk-rate-limited"):
        with patch("app.services.llm.llm_service.get_client") as mock_get_client:
            mock_client_instance = MagicMock()
            mock_client_instance.chat.completions.create.side_effect = rate_err
            mock_get_client.return_value = mock_client_instance

            resp = client.post(
                "/api/chat",
                json={"message": "What is the LCR ratio?", "top_k": 2}
            )

            assert resp.status_code == 200
            data = resp.json()
            assert data["evidence_found"] is True
            assert data["is_fallback"] is True

def test_unsupported_evidence_rejection():
    seed_database_if_empty()

    # When query has no evidence in documents
    resp = client.post(
        "/api/chat",
        json={"message": "How do you manufacture cryogenic rocket fuel in Antarctica?", "top_k": 2}
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["evidence_found"] is False
    assert data["answer"] == INSUFFICIENT_EVIDENCE_TEXT
    assert len(data["citations"]) == 0
