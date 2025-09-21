# agent.py
import os
import httpx
from typing import Dict

# Get the ML API URL from environment variable or default to local FastAPI endpoint
ML_API_URL = os.getenv("ML_API_URL", "http://localhost:8000/mock-ml-api")


async def analyze_vitals(audio_bytes: bytes) -> Dict[str, any]:
    """
    Send audio bytes to the ML API for stress and heart rate analysis.

    Parameters:
    - audio_bytes: Raw audio in bytes (preferably WAV, 16kHz mono)

    Returns:
    - dict with keys:
        - "stress_level": "low" | "medium" | "high"
        - "heart_rate": integer (bpm)
    """
    headers = {"Content-Type": "application/octet-stream"}

    try:
        async with httpx.AsyncClient(timeout=20.0) as client:
            response = await client.post(ML_API_URL, headers=headers, content=audio_bytes)
            response.raise_for_status()
            data = response.json()

            # Ensure keys exist in the response
            stress_level = data.get("stress_level", "unknown")
            heart_rate = data.get("heart_rate", 0)

            return {"stress_level": stress_level, "heart_rate": heart_rate}

    except httpx.RequestError as e:
        # Network or connection error
        print(f"[ERROR] Request failed: {e}")
        return {"stress_level": "unknown", "heart_rate": 0}

    except httpx.HTTPStatusError as e:
        # Non-200 HTTP response
        print(f"[ERROR] HTTP error: {e.response.status_code} - {e.response.text}")
        return {"stress_level": "unknown", "heart_rate": 0}

    except Exception as e:
        # Catch-all for unexpected errors
        print(f"[ERROR] Unexpected error: {e}")
        return {"stress_level": "unknown", "heart_rate": 0}
