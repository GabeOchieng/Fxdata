"""Async cache / ephemeral store.

Uses Redis when reachable (sessions, OTPs, M-Pesa token & pending-checkout
matching, Celery broker). Falls back to an in-process TTL store so the API
still runs in local dev / tests without a Redis server.
"""
from __future__ import annotations

import time
from typing import Optional

from app.core.config import settings

try:  # redis is optional for local dev
    from redis import asyncio as aioredis  # type: ignore

    _HAS_REDIS = True
except Exception:  # pragma: no cover
    _HAS_REDIS = False


class _MemoryCache:
    """Minimal async, TTL-aware, in-process fallback for Redis."""

    def __init__(self) -> None:
        self._store: dict[str, tuple[bytes, Optional[float]]] = {}

    def _expired(self, key: str) -> bool:
        item = self._store.get(key)
        if item is None:
            return True
        _, expiry = item
        if expiry is not None and expiry < time.monotonic():
            self._store.pop(key, None)
            return True
        return False

    async def get(self, key: str) -> Optional[bytes]:
        if self._expired(key):
            return None
        return self._store[key][0]

    async def set(self, key: str, value: str | bytes) -> None:
        self._store[key] = (_to_bytes(value), None)

    async def setex(self, key: str, ttl: int, value: str | bytes) -> None:
        self._store[key] = (_to_bytes(value), time.monotonic() + ttl)

    async def delete(self, *keys: str) -> None:
        for key in keys:
            self._store.pop(key, None)

    async def ping(self) -> bool:
        return True

    async def close(self) -> None:  # symmetry with redis client
        self._store.clear()


def _to_bytes(value: str | bytes) -> bytes:
    return value.encode() if isinstance(value, str) else value


class Cache:
    """Lazy proxy that prefers Redis and degrades to memory on failure."""

    def __init__(self) -> None:
        self._client = None
        self._memory = _MemoryCache()
        self._using_redis = False

    async def _resolve(self):
        if self._client is not None:
            return self._client
        if _HAS_REDIS:
            try:
                client = aioredis.from_url(settings.REDIS_URL)
                await client.ping()
                self._client = client
                self._using_redis = True
                return client
            except Exception:
                # Redis configured but unreachable — degrade quietly.
                self._client = self._memory
                return self._client
        self._client = self._memory
        return self._client

    async def get(self, key: str) -> Optional[bytes]:
        client = await self._resolve()
        return await client.get(key)

    async def set(self, key: str, value: str | bytes) -> None:
        client = await self._resolve()
        await client.set(key, value)

    async def setex(self, key: str, ttl: int, value: str | bytes) -> None:
        client = await self._resolve()
        await client.setex(key, ttl, value)

    async def delete(self, *keys: str) -> None:
        client = await self._resolve()
        await client.delete(*keys)

    @property
    def using_redis(self) -> bool:
        return self._using_redis


cache = Cache()
