"""SMS (Africa's Talking) and email (SendGrid) helpers + OTP delivery.

All senders degrade to a logged no-op when credentials are missing so the
platform runs end-to-end in local dev without external accounts.
"""
from __future__ import annotations

import logging

import httpx

from app.core.config import settings

logger = logging.getLogger("kazihub.notifications")

AT_SMS_URL = "https://api.africastalking.com/version1/messaging"


async def send_sms(phone: str, message: str) -> dict:
    """Send an SMS via Africa's Talking. No-op without an API key."""
    if not settings.AT_API_KEY:
        logger.info("SMS (mock) → %s: %s", phone, message)
        return {"skipped": True}
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            AT_SMS_URL,
            headers={
                "apiKey": settings.AT_API_KEY,
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            },
            data={
                "username": settings.AT_USERNAME,
                "to": phone,
                "message": message,
            },
        )
        return resp.json()


async def send_otp_sms(phone: str, otp: str) -> dict:
    return await send_sms(
        phone,
        f"Your KaziHub verification code is {otp}. "
        "It expires in 10 minutes. Do not share it.",
    )


async def send_email(to: str, subject: str, body: str) -> dict:
    if not settings.SENDGRID_API_KEY:
        logger.info("EMAIL (mock) → %s | %s", to, subject)
        return {"skipped": True}
    async with httpx.AsyncClient(timeout=20) as client:
        resp = await client.post(
            "https://api.sendgrid.com/v3/mail/send",
            headers={"Authorization": f"Bearer {settings.SENDGRID_API_KEY}"},
            json={
                "personalizations": [{"to": [{"email": to}]}],
                "from": {"email": "noreply@kazihub.co.ke"},
                "subject": subject,
                "content": [{"type": "text/plain", "value": body}],
            },
        )
        return {"status": resp.status_code}
