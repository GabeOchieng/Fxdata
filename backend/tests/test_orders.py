import uuid

import pytest


async def _auth_token(client, phone="0733111222", role="buyer"):
    await client.post(
        "/api/v1/auth/register",
        json={"phone": phone, "name": "Buyer", "password": "pass1234", "role": role},
    )
    login = await client.post(
        "/api/v1/auth/login",
        json={"identifier": phone, "password": "pass1234"},
    )
    return login.json()["access_token"]


@pytest.mark.asyncio
async def test_create_order_returns_whatsapp_message(client):
    token = await _auth_token(client)
    headers = {"Authorization": f"Bearer {token}"}
    body = {
        "type": "product",
        "delivery_type": "cbd",
        "items": [
            {
                "item_id": str(uuid.uuid4()),
                "item_type": "product",
                "name": "Canvas Low-Top",
                "qty": 2,
                "unit_price": "2999",
                "size": "42",
                "color": "black",
            }
        ],
    }
    resp = await client.post("/api/v1/orders/", json=body, headers=headers)
    assert resp.status_code == 201, resp.text
    data = resp.json()

    # subtotal = 2 × 2999 = 5998; cbd delivery = 150
    from decimal import Decimal

    assert Decimal(data["subtotal"]) == Decimal("5998")
    assert Decimal(data["delivery_fee"]) == Decimal("150")
    assert "NEW ORDER — KaziHub" in data["whatsapp_message"]
    assert "TOTAL: KES 6,148" in data["whatsapp_message"]
    assert data["whatsapp_link"].startswith("https://wa.me/")


@pytest.mark.asyncio
async def test_order_requires_auth(client):
    resp = await client.post(
        "/api/v1/orders/",
        json={"type": "product", "items": []},
    )
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_delivery_address_validation(client):
    token = await _auth_token(client, phone="0733999888")
    headers = {"Authorization": f"Bearer {token}"}
    body = {
        "type": "product",
        "delivery_type": "upcountry",  # requires an address
        "items": [
            {
                "item_id": str(uuid.uuid4()),
                "item_type": "product",
                "qty": 1,
                "unit_price": "1000",
            }
        ],
    }
    resp = await client.post("/api/v1/orders/", json=body, headers=headers)
    assert resp.status_code == 422


def test_whatsapp_message_formatting():
    """Unit-test the pure WhatsApp formatter without the DB."""
    from types import SimpleNamespace
    from decimal import Decimal

    from app.services.whatsapp import whatsapp

    order = SimpleNamespace(
        id=uuid.uuid4(),
        subtotal=Decimal("5998"),
        delivery_fee=Decimal("0"),
        delivery_address="Kasarani, Nairobi",
        notes=None,
        items=[
            SimpleNamespace(
                name="Canvas Low-Top",
                item_type="product",
                size="42",
                color="black",
                qty=2,
                unit_price=Decimal("2999"),
            )
        ],
    )
    msg = whatsapp.format_order_message(order)
    assert "Canvas Low-Top" in msg
    assert "Delivery: FREE" in msg
    assert "TOTAL: KES 5,998" in msg
    link = whatsapp.build_wa_link("+254700000000", msg)
    assert link.startswith("https://wa.me/254700000000?text=")
