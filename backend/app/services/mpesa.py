"""Safaricom Daraja API v2 — Lipa na M-Pesa STK Push."""
from __future__ import annotations

import base64
from datetime import datetime

import httpx

from app.core.cache import cache
from app.core.config import settings


class MpesaService:
    """STK Push client with Redis-cached OAuth token and callback matching."""

    @property
    def base(self) -> str:
        return settings.mpesa_base

    async def get_access_token(self) -> str:
        cached = await cache.get("mpesa:token")
        if cached:
            return cached.decode() if isinstance(cached, bytes) else cached

        creds = base64.b64encode(
            f"{settings.MPESA_CONSUMER_KEY}:{settings.MPESA_CONSUMER_SECRET}".encode()
        ).decode()
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.get(
                f"{self.base}/oauth/v1/generate?grant_type=client_credentials",
                headers={"Authorization": f"Basic {creds}"},
            )
            resp.raise_for_status()
            token = resp.json()["access_token"]
        await cache.setex("mpesa:token", 3300, token)  # 55 min
        return token

    def _password(self, timestamp: str) -> str:
        raw = f"{settings.MPESA_SHORTCODE}{settings.MPESA_PASSKEY}{timestamp}"
        return base64.b64encode(raw.encode()).decode()

    async def stk_push(
        self,
        phone: str,
        amount: int,
        order_id: str,
        description: str = "KaziHub Order",
    ) -> dict:
        """Initiate an STK Push and remember the CheckoutRequestID → order."""
        token = await self.get_access_token()
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        payload = {
            "BusinessShortCode": settings.MPESA_SHORTCODE,
            "Password": self._password(timestamp),
            "Timestamp": timestamp,
            "TransactionType": "CustomerPayBillOnline",
            "Amount": int(amount),
            "PartyA": phone.lstrip("+"),
            "PartyB": settings.MPESA_SHORTCODE,
            "PhoneNumber": phone.lstrip("+"),
            "CallBackURL": f"{settings.BASE_URL}/api/v1/orders/mpesa-callback",
            "AccountReference": f"KH-{order_id[:8].upper()}",
            "TransactionDesc": description,
        }
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self.base}/mpesa/stkpush/v1/processrequest",
                headers={"Authorization": f"Bearer {token}"},
                json=payload,
            )
            result = resp.json()

        checkout_id = result.get("CheckoutRequestID")
        if checkout_id:
            await cache.setex(f"mpesa:pending:{checkout_id}", 300, order_id)
        return result

    @staticmethod
    def parse_callback(payload: dict) -> dict:
        """Extract the salient fields from an STK callback body."""
        stk = payload["Body"]["stkCallback"]
        result = {
            "checkout_id": stk["CheckoutRequestID"],
            "result_code": stk["ResultCode"],
            "mpesa_ref": None,
            "amount": None,
        }
        if stk["ResultCode"] == 0:
            items = stk.get("CallbackMetadata", {}).get("Item", [])
            for item in items:
                if item.get("Name") == "MpesaReceiptNumber":
                    result["mpesa_ref"] = item.get("Value")
                elif item.get("Name") == "Amount":
                    result["amount"] = item.get("Value")
        return result

    async def resolve_pending_order(self, checkout_id: str) -> str | None:
        order_id = await cache.get(f"mpesa:pending:{checkout_id}")
        if order_id is None:
            return None
        await cache.delete(f"mpesa:pending:{checkout_id}")
        return order_id.decode() if isinstance(order_id, bytes) else order_id


mpesa = MpesaService()
