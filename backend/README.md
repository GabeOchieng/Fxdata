# KaziHub API

FastAPI backend for KaziHub — Kenya's gig-economy super-platform. Implements the
technical brief (`../docs/blueprint.html`): four marketplace modules (services,
rentals, footwear commerce, market intelligence) behind shared JWT auth, with a
WhatsApp-native checkout and M-Pesa (Safaricom Daraja) STK Push payments.

## Stack

- **FastAPI** (async) + **SQLAlchemy 2.0** + **Pydantic v2**
- **PostgreSQL 15** primary store (async `asyncpg`); **SQLite** fallback for local dev/tests
- **Redis** for OTP/session/M-Pesa-token cache and the **Celery** broker
- **M-Pesa Daraja** STK Push · **WhatsApp Business Cloud API** · Africa's Talking SMS

Column types are portable (`GUID`/`JSONB` decorators), so the exact same models
run on Postgres in production and SQLite in tests without external services.

## Quick start (Docker — full stack)

```bash
cp backend/.env.example backend/.env      # optional: add M-Pesa / WhatsApp creds
docker compose up --build                 # api, worker, postgres, redis, elasticsearch
# API docs:  http://localhost:8000/api/docs
# Frontend:  http://localhost:8000/        (static pages served by the API)
```

## Quick start (local, no Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.seed          # creates tables (SQLite) + seeds categories & demo data
uvicorn app.main:app --reload  # http://localhost:8000/api/docs
```

With no `DATABASE_URL`/`REDIS_URL` set, the app uses a local SQLite file and an
in-process cache fallback, so it boots with zero infrastructure.

## Tests

```bash
cd backend
pip install -r requirements.txt
pytest
```

## Layout

```
app/
├── main.py            FastAPI app, CORS/GZip, static frontend mount, /health
├── core/              config, database, security (JWT), cache (redis+fallback), deps
├── models/            SQLAlchemy models (+ portable GUID/JSONB types)
├── schemas/           Pydantic v2 request/response models
├── api/v1/            auth, users, services, rentals, products, orders routers
├── services/          mpesa.py, whatsapp.py, notifications.py
├── tasks/             celery_app.py, jobs.py
└── db/seed.py         categories + demo content
alembic/               migration scaffolding (autogenerate from metadata)
schema.sql             canonical PostgreSQL DDL (reference)
```

## Key endpoints

| Area | Route |
|------|-------|
| Auth | `POST /api/v1/auth/register` · `verify-otp` · `login` · `refresh` |
| Services | `GET /api/v1/services/` · `/{id}` · `/categories` · `/bubble-data` |
| Rentals | `GET /api/v1/rentals/` · `/{id}` · `POST /{id}/enquire` · `/areas` |
| Products | `GET /api/v1/products/` · `/{id}` · `POST /` (variants) |
| Orders | `POST /api/v1/orders/` (returns WhatsApp msg) · `POST /{id}/pay` · `mpesa-callback` |

See the live OpenAPI docs at `/api/docs` once running.
