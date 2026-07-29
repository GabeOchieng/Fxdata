"""Async SQLAlchemy engine + session management.

Postgres-first (asyncpg) per the technical brief, with a SQLite/aiosqlite
fallback so the app and test-suite run without external services.
"""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

_engine_kwargs: dict = {"echo": settings.DEBUG and settings.ENV == "development"}
if settings.is_postgres:
    _engine_kwargs.update(pool_size=20, max_overflow=10, pool_pre_ping=True)

engine = create_async_engine(settings.DATABASE_URL, **_engine_kwargs)

SessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency yielding a request-scoped async session."""
    async with SessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise


async def init_models() -> None:
    """Create all tables (dev convenience; use Alembic in production)."""
    from app.models.base import Base  # local import avoids circulars

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
