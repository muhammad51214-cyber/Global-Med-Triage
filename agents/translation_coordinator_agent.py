"""
Translation Coordinator Agent
- Specialized for medical translations
- Exposes async functions for backend orchestrator
"""
import os
import httpx

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

async def translate_medical(text: str, target_language: str) -> str:
    """Translate text to target language using Gemini API."""
    url = "https://api.gemini.com/v1/translate"  # Replace with Gemini's actual endpoint if different
    headers = {
        "Authorization": f"Bearer {GEMINI_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "q": text,
        "target": target_language
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(url, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data.get("translatedText", text)
