"""
Medical Office Triage Voice Agent
- Collects history, follows protocols, HIPAA-compliant
- Exposes async functions for backend orchestrator
"""
import os
import httpx

async def collect_history(audio_bytes: bytes) -> dict:
    """Collects medical history from audio using the Coral Medical Office Triage API."""
    url = os.getenv("MEDICAL_OFFICE_TRIAGE_API_URL", "http://coral_medicaloffice:8010/collect-history")
    headers = {"Content-Type": "application/octet-stream"}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, content=audio_bytes)
        response.raise_for_status()
        data = response.json()
        return {"history": data.get("history", "No history found."), "bytes": data.get("bytes")}
