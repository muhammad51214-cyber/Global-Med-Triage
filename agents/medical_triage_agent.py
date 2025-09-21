"""
Medical Triage Agent
- Integrates with Mistral AI for symptom analysis and ESI classification
- Exposes async functions for backend orchestrator
"""
import os
import httpx

MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY", "demo")

async def analyze_symptoms(symptoms: str, language: str = "en") -> dict:
    """Send symptoms to Mistral AI for ESI classification."""
    url = "https://api.mistral.ai/v1/medical/triage"
    headers = {
        "Authorization": f"Bearer {MISTRAL_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {"symptoms": symptoms, "language": language}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return {
            "esi_level": data.get("esi_level", 3),
            "analysis": data.get("analysis", "No analysis available.")
        }
