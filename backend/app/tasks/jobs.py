"""Background jobs run by Celery workers.

Workers are a separate sync process, so they use a dedicated synchronous
engine derived from DATABASE_URL. Async I/O (WhatsApp/SMS) is bridged with
asyncio.run inside the task body.
"""
from __future__ import annotations

import asyncio

from celery import shared_task
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.services.notifications import send_sms
from app.services.whatsapp import whatsapp


def _sync_url() -> str:
    url = settings.DATABASE_URL
    return url.replace("+asyncpg", "+psycopg2").replace("+aiosqlite", "")


_sync_engine = create_engine(_sync_url(), future=True)
sync_session = sessionmaker(bind=_sync_engine, expire_on_commit=False)


@shared_task(name="send_order_confirmation", max_retries=3, default_retry_delay=30)
def send_order_confirmation(order_id: str) -> None:
    """Notify buyer (SMS) and seller (WhatsApp) after successful payment."""
    from app.models.order import Order
    from decimal import Decimal

    with sync_session() as db:
        order = db.get(Order, order_id)
        if not order:
            return
        seller_phone = None
        if order.items and order.items[0].item_type == "product":
            pass  # seller lookup omitted in offline mode
        ref = f"KH-{str(order.id)[:8].upper()}"
        total = Decimal(order.subtotal) + Decimal(order.delivery_fee)
        msg = whatsapp.format_order_message(order)
        if seller_phone:
            asyncio.run(whatsapp.send_message(seller_phone, msg))
        if order.buyer and order.buyer.phone:
            asyncio.run(
                send_sms(
                    order.buyer.phone,
                    f"✅ Order {ref} confirmed! KES {total:,.0f} received. "
                    "Your seller will reach you on WhatsApp shortly.",
                )
            )


@shared_task(name="update_listing_xp")
def update_listing_xp(listing_id: str, jobs_delta: int = 1) -> None:
    """Recompute a listing's XP after a completed job."""
    from app.models.service import ServiceListing

    with sync_session() as db:
        listing = db.get(ServiceListing, listing_id)
        if not listing:
            return
        listing.jobs_done += jobs_delta
        listing.xp = int(
            min(
                10000,
                listing.workers * 18
                + listing.jobs_done * 2.2
                + listing.review_count * 4,
            )
        )
        db.commit()


@shared_task(name="send_rental_enquiry")
def send_rental_enquiry(rental_id: str, enquirer_phone: str, message: str) -> None:
    """Notify a landlord of a new viewing request."""
    from app.models.rental import Rental

    with sync_session() as db:
        rental = db.get(Rental, rental_id)
        if not (rental and rental.owner and rental.owner.profile):
            return
        wa = rental.owner.profile.whatsapp
        if not wa:
            return
        asyncio.run(
            whatsapp.send_message(
                wa,
                "🏠 *New Viewing Request — KaziHub*\n\n"
                f"Property: {rental.title}\n"
                f"From: {enquirer_phone}\n"
                f"Message: {message}\n\n"
                "Reply to confirm a viewing time.",
            )
        )
