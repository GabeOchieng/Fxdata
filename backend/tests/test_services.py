import pytest


async def _seller_token(client, phone="0700555444"):
    await client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Seller", "password": "pass1234", "role": "seller"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"identifier": phone, "password": "pass1234"},
    )
    return login.json()["access_token"]


@pytest.mark.asyncio
async def test_create_and_list_service(client, seeded):
    token = await _seller_token(client)
    headers = {"Authorization": f"Bearer {token}"}

    created = await client.post(
        "/api/v1/services/",
        json={
            "category_id": seeded["beauty"],
            "title": "Mobile Braiding",
            "price_from": "800",
            "workers": 3,
            "area": "Kasarani",
        },
        headers=headers,
    )
    assert created.status_code == 201, created.text
    listing_id = created.json()["id"]

    # New listings default to 'pending' — activate so it shows in the public list.
    await client.put(
        f"/api/v1/services/{listing_id}",
        json={"status": "active"},
        headers=headers,
    )

    listed = await client.get("/api/v1/services/", params={"category": seeded["beauty"]})
    assert listed.status_code == 200
    assert listed.json()["total"] == 1
    assert listed.json()["items"][0]["title"] == "Mobile Braiding"


@pytest.mark.asyncio
async def test_buyer_cannot_create_listing(client, seeded):
    await client.post(
        "/api/v1/auth/register",
        json={"phone": "0700111000", "name": "B", "password": "pass1234", "role": "buyer"},
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"identifier": "0700111000", "password": "pass1234"},
    )
    token = login.json()["access_token"]
    resp = await client.post(
        "/api/v1/services/",
        json={"category_id": seeded["tech"], "title": "X"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_bubble_data_shape(client, seeded):
    resp = await client.get("/api/v1/services/bubble-data")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 21
    assert {"category_id", "slug", "listings", "workers", "xp"} <= set(data[0])
