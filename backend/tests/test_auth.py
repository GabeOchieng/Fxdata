import pytest


@pytest.mark.asyncio
async def test_register_verify_and_me(client, monkeypatch):
    captured = {}

    # Capture the OTP the app generates (it is normally SMS-delivered).
    from app.core import cache as cache_mod

    real_setex = cache_mod.cache.setex

    async def spy_setex(key, ttl, value):
        if key.startswith("otp:"):
            captured["otp"] = value
        return await real_setex(key, ttl, value)

    monkeypatch.setattr(cache_mod.cache, "setex", spy_setex)

    # Register
    resp = await client.post(
        "/api/v1/auth/register",
        json={"phone": "0712345678", "name": "Test User", "password": "secret12"},
    )
    assert resp.status_code == 201, resp.text
    assert resp.json()["phone"] == "+254712345678"

    # Duplicate registration is rejected
    dup = await client.post(
        "/api/v1/auth/register",
        json={"phone": "0712345678", "name": "Test User"},
    )
    assert dup.status_code == 409

    # Verify OTP → tokens
    verify = await client.post(
        "/api/v1/auth/verify-otp",
        json={"phone": "0712345678", "otp": captured["otp"]},
    )
    assert verify.status_code == 200, verify.text
    token = verify.json()["access_token"]
    assert verify.json()["user"]["is_verified"] is True

    # Authenticated /me
    me = await client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me.status_code == 200
    assert me.json()["phone"] == "+254712345678"


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post(
        "/api/v1/auth/register",
        json={"phone": "0722000111", "name": "Jane", "password": "rightpass"},
    )
    bad = await client.post(
        "/api/v1/auth/login",
        json={"identifier": "+254722000111", "password": "wrongpass"},
    )
    assert bad.status_code == 401


@pytest.mark.asyncio
async def test_me_requires_auth(client):
    resp = await client.get("/api/v1/users/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_invalid_phone_rejected(client):
    resp = await client.post(
        "/api/v1/auth/register",
        json={"phone": "12345", "name": "Nope"},
    )
    assert resp.status_code == 422
