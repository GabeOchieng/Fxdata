"""KaziHub FastAPI application entry point."""
from __future__ import annotations

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles

from app import __version__
from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import init_models


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Dev convenience: create tables on startup. Use Alembic in production.
    if not settings.is_postgres or settings.ENV == "development":
        await init_models()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="Kenya's gig economy super-platform — API v1",
    version=__version__,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["meta"])
async def health():
    from app.core.cache import cache

    # Round-trip the cache so we report Redis vs in-memory fallback accurately.
    await cache.set("health:ping", "1")
    return {
        "status": "ok",
        "service": "kazihub-api",
        "version": __version__,
        "cache": "redis" if cache.using_redis else "memory-fallback",
    }


# ── Optionally serve the static HTML frontend from the same origin ──────
_frontend = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", settings.FRONTEND_DIR)
)
if settings.SERVE_FRONTEND and os.path.isdir(_frontend):
    app.mount("/", StaticFiles(directory=_frontend, html=True), name="frontend")
