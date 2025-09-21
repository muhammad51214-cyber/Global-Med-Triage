"""
Vital Signs Monitor Agent
- Analyzes stress/voice with ML API
- Exposes async functions for backend orchestrator
"""
import os
import httpx

ML_API_URL = os.getenv("ML_API_URL", "http://localhost:8000/mock-ml-api")

async def analyze_vitals(audio_bytes: bytes) -> dict:
    """Send audio to ML API for vital signs analysis."""
    url = ML_API_URL
    headers = {"Content-Type": "application/octet-stream"}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, content=audio_bytes)
        response.raise_for_status()
        data = response.json()
        return {
            "stress_level": data.get("stress_level", "unknown"),
            "heart_rate": data.get("heart_rate", 0)
        }
