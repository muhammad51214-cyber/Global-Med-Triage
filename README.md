# GlobalMed-Triage

## Local Python Environment (Single .venv Policy)
To simplify development and avoid drift, this repo now uses ONE canonical virtual environment at the root: `.venv/`.

Removed legacy experimental environments: `.venv_optionb/`, `.venv_test/`, `.venv_test2/`.

If you need to recreate the environment:
```
python -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
# (Optional) install all extras
# pip install -r backend/requirements.all.txt
```

Regenerate dependency lock files (if you add packages) rather than adding new parallel env folders.

Why only one?
- Prevents accidental use of stale dependencies.
- Keeps Docker + local parity clearer.
- Avoids committing large, duplicate directories.

If you truly need an alternate profile (e.g., testing minimal vs. full), prefer using a requirements extras file or a `make` target instead of a second `.venv_*` directory.

---

## Environment Variables

Add your Gemini API key to `.env` or `backend/.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
```

This is used by the translation coordinator agent for all translation requests.

## Database Setup (PostgreSQL)

A full Postgres service and comprehensive schema have been added.

### Quick start

```
# Start only the database (first run initializes schema + seed data)
docker compose up -d db

# Or start everything (db + backend + translation service)
docker compose up -d --build

# View logs
docker compose logs -f db
```

On first startup the following files are executed automatically by the Postgres entrypoint:
- `db/schema.sql` (creates all tables, indexes, view)
- `db/seed.sql` (inserts demo/reference data)

### Connection URL
Inside containers use:
```
postgresql://globalmed:changeme@db:5432/triage
```
From your host (if you map port 5432:5432 and run psql locally):
```
postgresql://globalmed:changeme@localhost:5432/triage
```

### Verifying the seed
```
docker compose exec db psql -U globalmed -d triage -c "SELECT id, username FROM users;"
docker compose exec db psql -U globalmed -d triage -c "SELECT id, name FROM protocols;"
```

### Password hashes
`db/seed.sql` uses placeholder bcrypt strings (`bcrypt$2a$12$REPLACE_THIS_HASH`). Generate real hashes before production:
```
python - <<'PY'
from passlib.hash import bcrypt
print(bcrypt.hash('ChangeMe123!'))
PY
```
Update the `users` table or `seed.sql` accordingly.

### Extending the schema
Edit `db/schema.sql` (idempotent) and add new objects above the indexes section. For complex changes prefer Alembic migrations (`backend/alembic`).

### Safety notes
- Rotate any real API keys committed to `.env`.
- The seed data is for demo only—remove or anonymize before real deployment.

## Services
Defined in `docker-compose.yml`:
- `db`: PostgreSQL 16 with mounted schema + seed
- `backend`: FastAPI app (exposes port 8000)
- `translation_service`: Separate translation microservice (Gemini)

## Makefile Shortcuts
A `Makefile` is included for convenience. Examples:
```
make up            # Build and start all services
make up-db         # Start only Postgres
make logs-backend  # Tail backend logs
make psql          # Open psql shell inside db container
make reset-db      # Recreate DB (destroys data!)
make health        # Hit backend health endpoint
```
You can override variables, e.g.:
```
make COMPOSE="docker compose" up
```

## Useful Commands
```
# Rebuild backend after code changes
docker compose build backend

# Run a psql shell
docker compose exec db psql -U globalmed -d triage

# Tail backend logs
docker compose logs -f backend
```

## End-to-End Integration Overview

This prototype stitches together multiple micro/agent services:

Component | Purpose | Port | Key Endpoints
--------- | ------- | ---- | -------------
backend (FastAPI) | Orchestrates all agents, REST + WS APIs | 8000 | /api/triage, /ws/triage, /api/* CRUD, /api/health
translation_service | Stand‑alone translation microservice (Gemini) | 8002 | /translate, /health
coral_medicaloffice | Medical office history collection (stub + optional LLM init) | 8010 | /collect-history, /health
PostgreSQL | Persistence (triage logs, patients, etc.) | 5432 | n/a

### Orchestration Flow (WebSocket /ws/triage)
1. Frontend records audio, sends base64 payload.
2. backend -> voice_interface_agent (transcription) [placeholder: external ElevenLabs].
3. backend -> medical_triage_agent (ESI classification) [Mistral placeholder].
4. backend -> translation_coordinator_agent (Gemini placeholder).
5. backend -> medical_office_triage_voice_agent -> HTTP call -> coral_medicaloffice /collect-history.
6. backend -> vital_signs_monitor_agent -> /mock-ml-api (local mock) or ML_API_URL.
7. backend -> insurance_verification_agent (Crossmint placeholder).
8. Aggregated result returned to client, persisted in triage_logs (PII redacted for emails/phones).

### Persistence
Table | Source
----- | ------
triage_logs | Automatic after REST /api/triage and WS flow
users / patients / etc. | Managed via CRUD endpoints
protocols | Insert manually (see below) or seed script

### Verifying Core Tables
```bash
# List recent triage logs
docker compose exec db psql -U globalmed -d triage -c "SELECT id, language, esi_level, left(symptoms,50) AS symptoms_snip, created_at FROM triage_logs ORDER BY id DESC LIMIT 5;"
# List protocols
docker compose exec db psql -U globalmed -d triage -c "SELECT id, name, description FROM protocols;"
```

If protocols are empty, insert a sample:
```bash
docker compose exec db psql -U globalmed -d triage -c "INSERT INTO protocols (name, description, steps) VALUES ('Chest Pain','Protocol for chest pain triage','[\"Assess pain\",\"Check SOB\",\"Monitor vitals\"]') ON CONFLICT (name) DO NOTHING;"
```

### REST Triage Test
```bash
curl -s -X POST http://localhost:8000/api/triage \
  -H 'Content-Type: application/json' \
  -d '{"symptoms":"fever and cough","language":"en"}' | jq .
```
Check persistence:
```bash
docker compose exec db psql -U globalmed -d triage -c "SELECT count(*) FROM triage_logs;"
```

### WebSocket Triage Test (wscat)
```bash
wscat -c ws://localhost:8000/ws/triage
> {"audio":"data:audio/webm;base64,QUJDRA=="}
```
You should receive a JSON object with keys: voice, triage, translation, history, vitals, dispatch, insurance.

### Health Endpoints
```bash
curl -s http://localhost:8000/api/health
curl -s http://localhost:8002/health
curl -s http://localhost:8010/health
```

### Environment Variables (Key)
Var | Purpose | Default/Fallback
--- | ------- | ---------------
DATABASE_URL | Postgres connection | postgresql://globalmed:changeme@db:5432/triage
ML_API_URL | Vital signs ML endpoint | http://localhost:8000/mock-ml-api
MEDICAL_OFFICE_TRIAGE_API_URL | Coral history service | http://coral_medicaloffice:8010/collect-history
GEMINI_API_KEY | Translation (Gemini) | required for real translation
MISTRAL_API_KEY | Triage LLM | demo placeholder
ELEVENLABS_API_KEY | Speech API | required for real transcription/tts
CROSSMINT_API_KEY | Insurance verification | demo placeholder

### Current Placeholders & How to Replace
Agent | Placeholder | What To Do
----- | ---------- | ---------
voice_interface_agent | ElevenLabs endpoint + API key missing? | Add real key or mock service.
medical_triage_agent | Mistral endpoint may be non-final | Verify real API path + key.
translation_coordinator_agent | Simplified Gemini translate payload | Adjust per official API.
medical_office_triage_voice_agent | History is stub from coral service | Implement real summarization logic.
insurance_verification_agent | Crossmint verify endpoint guessed | Align with actual insurance/claims API.
vital_signs_monitor_agent | Mock stress/heart rate | Point ML_API_URL to real model service.

### Error Resilience
Each agent call in `agent_orchestrator.py` is wrapped in try/except and returns an `error` field on failure while preserving the rest of the pipeline.

### Security / Production Hardening TODO
- Enforce JWT on WebSocket & CRUD.
- Replace plaintext password_hash inserts with securely hashed values (passlib).
- Implement structured logging + request IDs.
- Add rate limiting / throttling on WebSocket.
- Use Alembic migrations instead of editing schema.sql post‑init.

### Optional Next Enhancements
1. Streaming audio chunks rather than single base64 blob.
2. Real ML pipeline for vital signs (e.g., gRPC microservice or Torch model service).
3. Multi-language UI selection driving translation_agent target.
4. per-user triage session retrieval (link triage_logs to patient/encounter tables—currently separate).
5. Add unit/integration tests (pytest) for orchestrator fallbacks and persistence.

### Quick Cleanup / Reset
```bash
# Stop & remove containers (data persists because of volume)
docker compose down
# Full reset INCLUDING data (dangerous)
docker compose down -v
# Rebuild everything
docker compose up --build -d
```

---
This section was auto-generated to document the prototype integration state (Sept 2025). Keep it updated as services evolve.
