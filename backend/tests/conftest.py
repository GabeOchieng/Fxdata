"""Pytest fixtures: isolated SQLite DB + async HTTP client per test."""
from __future__ import annotations

import os

os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("SERVE_FRONTEND", "false")
os.environ.setdefault("SECRET_KEY", "test-secret-key-at-least-32-characters-long")

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.database import get_session
from app.main import app
from app.models import Base


@pytest_asyncio.fixture
async def db_engine():
    # One shared in-memory SQLite connection for the whole test.
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture
async def client(db_engine):
    TestingSession = async_sessionmaker(db_engine, expire_on_commit=False)

    async def _override():
        async with TestingSession() as session:
            yield session

    app.dependency_overrides[get_session] = _override
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def seeded(db_engine):
    """Seed the 21 categories into the test DB and return {slug: id}."""
    from sqlalchemy.ext.asyncio import async_sessionmaker

    from app.db.seed import seed_categories

    TestingSession = async_sessionmaker(db_engine, expire_on_commit=False)
    async with TestingSession() as session:
        return await seed_categories(session)
