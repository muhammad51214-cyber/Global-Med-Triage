# GlobalMedTriage Database

## Setup

1. Start PostgreSQL (see docker-compose.yml)
2. Run schema and seed scripts:
   ```bash
   psql -U globalmed -d triage -h localhost -f schema.sql
   psql -U globalmed -d triage -h localhost -f seed.sql
   ```

## Tables
- users
- triage_logs
- protocols
