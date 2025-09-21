from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise RuntimeError("GEMINI_API_KEY not set in environment variables.")

# Configure Gemini client
genai.configure(api_key=API_KEY)

# FastAPI app
app = FastAPI(title="GlobalMed Translation Service (Gemini)")

@app.get("/health")
def health() -> dict:
    return {"status": "ok"}

# Request model
class TranslationRequest(BaseModel):
    text: str
    source: str = "auto"
    target: str = "en"

@app.post("/translate")
def translate_text(req: TranslationRequest) -> dict:
    """
    Uses Gemini to simulate translation.
    """
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")

        # Prompt Gemini to translate
        prompt = f"Translate this text from {req.source} to {req.target}:\n{req.text}"
        response = model.generate_content(prompt)

        return {"translated_text": response.text.strip()}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")
