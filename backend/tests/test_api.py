import pytest
from fastapi.testclient import TestClient

import importlib

# Import the FastAPI app
from backend import main  # assuming tests run from repo root where backend is a package

client = TestClient(main.app)

@pytest.fixture(autouse=True)
def patch_agents(monkeypatch):
    """Patch external agent calls to avoid real network requests."""
    import agents.medical_triage_agent as med
    import agents.translation_coordinator_agent as trans

    async def fake_analyze(symptoms: str, language: str = "en"):
        return {"esi_level": 4, "analysis": f"Mock analysis for: {symptoms}"}

    async def fake_translate(text: str, target_language: str):
        # just echo with marker
        return f"[{target_language}] {text} (translated)"

    monkeypatch.setattr(med, "analyze_symptoms", fake_analyze, raising=True)
    monkeypatch.setattr(trans, "translate_medical", fake_translate, raising=True)

    yield


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_triage_post():
    payload = {"symptoms": "Chest pain and shortness of breath", "language": "es"}
    r = client.post("/api/triage", json=payload)
    assert r.status_code == 200
    data = r.json()
    # Validate structure
    for key in ["voice", "triage", "translation", "history", "vitals", "dispatch", "insurance"]:
        assert key in data, f"Missing key {key} in response"
    assert data["triage"]["esi_level"] == 4
    assert "Mock analysis" in data["triage"]["analysis"]
    assert data["translation"].startswith("[es]")
    # voice echo
    assert data["voice"]["text"] == payload["symptoms"]

