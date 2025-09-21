# coral_agents/translation_coordinator_agent.py
from coral import Agent, action, Context
import requests
import os

# Use env var to keep it flexible
TRANSLATION_URL = os.getenv("TRANSLATION_API_URL", "http://translation_service:8000/translate")

class TranslationCoordinatorAgent(Agent):
    """
    🌍 Coral Agent Wrapper for Translation
    Provides multilingual translation with medical context.
    Integrates with backend FastAPI translation_service.
    """

    def __init__(self):
        super().__init__(
            name="TranslationCoordinatorAgent",
            description="Handles multilingual medical translation for GlobalMed-Triage.",
            version="1.0.0",
            author="Your Team",
            tags=["translation", "medical", "multilingual"]
        )

    @action(
        name="translate_text",
        description="Translate medical/emergency text between languages",
        parameters={
            "text": {"type": "string", "description": "Text to be translated"},
            "source": {"type": "string", "description": "Source language code (e.g. 'es')", "default": "auto"},
            "target": {"type": "string", "description": "Target language code (e.g. 'en')"}
        }
    )
    def translate_text(self, ctx: Context, text: str, source: str = "auto", target: str = "en") -> dict:
        try:
            response = requests.post(
                TRANSLATION_URL,
                json={"text": text, "source": source, "target": target}
            )
            response.raise_for_status()
            result = response.json()
            return {"translatedText": result.get("translatedText", ""), "source": source, "target": target}
        except Exception as e:
            return {"error": str(e)}

# Only run if this agent is launched standalone
if __name__ == "__main__":
    agent = TranslationCoordinatorAgent()
    agent.serve()
