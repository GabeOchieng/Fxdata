"""WhatsApp Business Cloud API — order messages & notifications.

The `format_order_message` / `build_wa_link` helpers are pure and drive the
platform's WhatsApp-native checkout; `send_message` calls the Graph API and is
a no-op when credentials are absent (local dev).
"""
from __future__ import annotations

import urllib.parse
from decimal import Decimal

import httpx

from app.core.config import settings

WA_API = "https://graph.facebook.com/v18.0"


def _money(value: Decimal | float | int) -> str:
    return f"{Decimal(value):,.0f}"


class WhatsAppService:
    async def send_message(self, to: str, text: str) -> dict:
        """Send a plain-text WhatsApp message. No-op without credentials."""
        if not (settings.WA_TOKEN and settings.WA_PHONE_ID):
            return {"skipped": True, "reason": "WhatsApp not configured"}
        async with httpx.AsyncClient(timeout=20) as client:
            resp = await client.post(
                f"{WA_API}/{settings.WA_PHONE_ID}/messages",
                headers={
                    "Authorization": f"Bearer {settings.WA_TOKEN}",
                    "Content-Type": "application/json",
                },
                json={
                    "messaging_product": "whatsapp",
                    "to": to,
                    "type": "text",
                    "text": {"body": text},
                },
            )
            return resp.json()

    def format_order_message(self, order, seller_phone: str | None = None) -> str:
        """Render a complete order as a WhatsApp-ready message."""
        ref = f"KH-{str(order.id)[:8].upper()}"
        lines = ["🛍️ *NEW ORDER — KaziHub*", "─────────────────────"]
        for i, item in enumerate(order.items, 1):
            lines.append(f"{i}. *{item.name or item.item_type.title()}*")
            if item.size:
                lines.append(f"   Size: {item.size}")
            if item.color:
                lines.append(f"   Colour: {item.color}")
            lines.append(f"   Qty: {item.qty} × KES {_money(item.unit_price)}")
        delivery = "FREE" if Decimal(order.delivery_fee) == 0 else f"KES {_money(order.delivery_fee)}"
        total = Decimal(order.subtotal) + Decimal(order.delivery_fee)
        lines += [
            "─────────────────────",
            f"Subtotal: KES {_money(order.subtotal)}",
            f"Delivery: {delivery}",
            f"*TOTAL: KES {_money(total)}*",
        ]
        if order.delivery_address:
            lines.append(f"📍 Deliver to: {order.delivery_address}")
        if order.notes:
            lines.append(f"📝 Notes: {order.notes}")
        lines += [
            "─────────────────────",
            f"Order Ref: {ref}",
            "✅ Please confirm & share M-Pesa details.",
            "Thank you! 🙏",
        ]
        return "\n".join(lines)

    def build_wa_link(self, phone: str, message: str) -> str:
        """wa.me deep-link for one-tap ordering from the frontend."""
        digits = phone.lstrip("+")
        return f"https://wa.me/{digits}?text={urllib.parse.quote(message)}"


whatsapp = WhatsAppService()
