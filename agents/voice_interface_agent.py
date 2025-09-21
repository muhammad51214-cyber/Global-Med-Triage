"""
Voice Interface Agent
- Integrates with ElevenLabs API for multilingual speech recognition & synthesis
- Detects language and panic tone
- Exposes async functions for backend orchestrator
"""
import os
import httpx

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

async def transcribe_audio(audio_bytes: bytes, language: str = "auto") -> dict:
    """Send audio to ElevenLabs for transcription."""
    url = "https://api.elevenlabs.io/v1/speech-to-text"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/octet-stream"
    }
    params = {"language": language}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, params=params, headers=headers, content=audio_bytes)
        response.raise_for_status()
        data = response.json()
        return {
            "text": data.get("text", ""),
            "language": data.get("language", language),
            "panic": data.get("panic", False)
        }

async def synthesize_speech(text: str, language: str = "en") -> bytes:
    """Synthesize speech using ElevenLabs."""
    url = "https://api.elevenlabs.io/v1/text-to-speech"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    payload = {"text": text, "language": language}
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.content
