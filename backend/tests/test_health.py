import pytest


@pytest.mark.asyncio
async def test_health(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["service"] == "kazihub-api"


@pytest.mark.asyncio
async def test_categories_seeded(client, seeded):
    resp = await client.get("/api/v1/services/categories")
    assert resp.status_code == 200
    slugs = {c["slug"] for c in resp.json()}
    assert {"tech", "beauty", "rental", "construction"} <= slugs
    assert len(slugs) == 21
