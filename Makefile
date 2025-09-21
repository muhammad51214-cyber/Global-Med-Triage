# Convenience Makefile for GlobalMed Triage project
# Usage: make <target>
# Override variables like: make COMPOSE="docker compose" up

COMPOSE ?= docker compose
DB_SERVICE ?= db
BACKEND_SERVICE ?= backend
UP_FLAGS ?= -d

.PHONY: help up up-db down logs logs-backend logs-db psql rebuild-backend reset-db health

help:
	@echo "Available targets:"
	@echo "  up             - Start all services (db, backend, translation)"
	@echo "  up-db          - Start only the database"
	@echo "  down           - Stop all services (keep volumes)"
	@echo "  reset-db       - Stop and remove volumes (DANGEROUS: wipes data)"
	@echo "  logs           - Tail all service logs"
	@echo "  logs-backend   - Tail backend logs"
	@echo "  logs-db        - Tail database logs"
	@echo "  psql           - Open psql shell inside db"
	@echo "  rebuild-backend- Rebuild backend image and restart backend"
	@echo "  health         - Hit backend health endpoint"

up:
	$(COMPOSE) up $(UP_FLAGS) --build

up-db:
	$(COMPOSE) up $(UP_FLAGS) $(DB_SERVICE)

down:
	$(COMPOSE) down

reset-db:
	@echo "WARNING: This will destroy database volume. Ctrl+C to abort." && sleep 3 || true
	$(COMPOSE) down -v
	$(COMPOSE) up $(UP_FLAGS) $(DB_SERVICE)

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f $(BACKEND_SERVICE)

logs-db:
	$(COMPOSE) logs -f $(DB_SERVICE)

psql:
	$(COMPOSE) exec $(DB_SERVICE) psql -U globalmed -d triage

rebuild-backend:
	$(COMPOSE) build $(BACKEND_SERVICE)
	$(COMPOSE) up $(UP_FLAGS) $(BACKEND_SERVICE)

health:
	curl -s http://localhost:8000/api/health || true

