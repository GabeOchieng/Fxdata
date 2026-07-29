# KaziHub — Kenya's Gig Economy Platform

KaziHub is a multi-sided marketplace for Kenya's **informal sector** — connecting
fundis, mama fuas, chefs, drivers, tutors, artisans (jua kali), caregivers and
hundreds of other skilled hustlers with the people and businesses who need them.

It spans four marketplace modules under one identity, shared auth, and a
**WhatsApp-native** checkout with **M-Pesa** payments:

- 🗺 **Market** — browse 250+ service categories on an interactive map
- 👔 **Hire a Pro** — professional portfolios & storefronts
- 🏠 **Rentals** — rooms, apartments and spaces across Nairobi
- 👟 **Footwear / Merch** — commerce with size/colour variants

## Repository layout

```
web/             Premium React (Next.js 14 + TS + Tailwind) frontend — new build
frontend/        Static HTML/JS prototype (original site; kept until web/ reaches parity)
backend/         FastAPI + PostgreSQL + Redis + Celery API (M-Pesa, WhatsApp)
docs/            blueprint.html — the system architecture & technical brief
docker-compose.yml   Runs the API stack (api, worker, postgres, redis, elasticsearch)
```

> **Frontend note:** `docs/blueprint.html` is the technical brief, not a public
> page, so it is not linked in the site navigation. The production frontend is
> being rebuilt in **React/Next.js** under `web/` with an Inngest-grade premium
> look; the static `frontend/` prototype stays until `web/` reaches parity.

## Web frontend (React / Next.js)

```bash
cd web
npm install
cp .env.example .env.local        # point NEXT_PUBLIC_API_URL at the backend
npm run dev                       # http://localhost:3000
npm run build                     # production build
```

Stack: Next.js 14 (App Router) · TypeScript · Tailwind · Framer Motion. The
design system lives in `web/tailwind.config.ts` + `web/app/globals.css`; shared
brand data in `web/lib/constants.ts`; the API client in `web/lib/api.ts`. The
Home page is complete; Market, Hire a Pro, Rentals, Footwear and Merch are
scaffolded and being migrated from the static prototype.

## Run the whole stack

```bash
cp backend/.env.example backend/.env      # optional: add M-Pesa / WhatsApp creds
docker compose up --build
# API + docs:  http://localhost:8000/api/docs
# Frontend:    http://localhost:8000/
```

## Backend only (no Docker)

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python -m app.db.seed          # tables + categories + demo data (SQLite by default)
uvicorn app.main:app --reload
pytest                         # 13 tests
```

The backend is Postgres-first but falls back to SQLite + an in-memory cache when
no `DATABASE_URL`/`REDIS_URL` is set, so it boots with zero infrastructure.
See `backend/README.md` for the full API reference and architecture.

## Frontend pages (current static site)

| File | Nav label | What it is |
|------|-----------|------------|
| `frontend/index.html` | — | Landing entry point (redirects to Home) |
| `frontend/kazihub-home.html` | Home | Marketing / overview |
| `frontend/kazihub.html` | 🗺 Market | Interactive skills-market canvas |
| `frontend/kazihub-store.html` | 👔 Hire a Pro | Professional portfolios & storefronts |
| `frontend/kazihub-rentals.html` | 🏠 Rentals | Rentals & stays |
| `frontend/kazihub-footwear.html` | 👟 Footwear | Footwear storefront |
| `frontend/kazihub-tshirt.html` | 👕 Merch | Merch store |
