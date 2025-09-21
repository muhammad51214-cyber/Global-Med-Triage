# GlobalMedTriage Backend

## Setup

1. Copy `.env.example` to `.env` and set API keys and DB URL (including GEMINI_API_KEY for translation).
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run migrations:
   ```bash
   alembic upgrade head
   ```
4. Start server:
   ```bash
   uvicorn main:app --reload
   ```

## Features
- FastAPI async backend
- WebSocket agent orchestration
- JWT authentication
- HIPAA/GDPR compliance
