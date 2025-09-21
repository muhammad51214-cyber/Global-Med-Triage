"""
Agent Orchestrator for GlobalMedTriage
- Coordinates all agents via async calls
- Entry point for backend to route requests
"""
from agents import (
    medical_triage_agent,
    translation_coordinator_agent,
    medical_office_triage_voice_agent,
    vital_signs_monitor_agent,
    insurance_verification_agent,
    voice_interface_agent,
)

import asyncio

async def run_emergency_flow(audio_bytes: bytes, user_language: str = "auto") -> dict:
    """Run full emergency flow with resilient fallbacks.
    Each agent call is wrapped so one failure doesn't break the whole workflow.
    """
    # Voice transcription
    try:
        voice_result = await voice_interface_agent.transcribe_audio(audio_bytes, language=user_language)
    except Exception as e:  # noqa
        voice_result = {"text": "", "language": user_language, "panic": False, "error": f"voice_interface: {e}"}

    # Medical triage (ESI)
    try:
        triage_result = await medical_triage_agent.analyze_symptoms(voice_result.get("text", ""), language=voice_result.get("language", user_language))
    except Exception as e:  # noqa
        triage_result = {"esi_level": 5, "analysis": "unavailable", "error": f"medical_triage: {e}"}

    # Translation
    try:
        translation = await translation_coordinator_agent.translate_medical(
            f"ESI Level: {triage_result.get('esi_level', 'unknown')}", voice_result.get("language", user_language)
        )
    except Exception as e:  # noqa
        translation = f"translation_error: {e}"

    # History collection
    try:
        history = await medical_office_triage_voice_agent.collect_history(audio_bytes)
    except Exception as e:  # noqa
        history = {"history": "unavailable", "error": f"history_agent: {e}"}

    # Vital signs
    try:
        vitals = await vital_signs_monitor_agent.analyze_vitals(audio_bytes)
    except Exception as e:  # noqa
        vitals = {"stress_level": "unknown", "heart_rate": 0, "error": f"vitals_agent: {e}"}

    # Insurance verification
    try:
        insurance = await insurance_verification_agent.verify_insurance("REPLACE_WITH_REAL_USER_ID")
    except Exception as e:  # noqa
        insurance = {"verified": False, "provider": "Unknown", "error": f"insurance_agent: {e}"}

    # Dispatch placeholder retained (removed original emergency dispatch agent)
    dispatch = {"status": "pending", "location": "unknown"}

    return {
        "voice": voice_result,
        "triage": triage_result,
        "translation": translation,
        "history": history,
        "vitals": vitals,
        "dispatch": dispatch,
        "insurance": insurance,
    }
