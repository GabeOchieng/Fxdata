"""Order, checkout and M-Pesa payment endpoints."""
from __future__ import annotations

from datetime import datetime, timezone
from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.models.order import (
    DeliveryType,
    Order,
    OrderItem,
    OrderStatus,
    OrderType,
    Payment,
    PaymentStatus,
)
from app.models.user import User, UserRole
from app.schemas.order import (
    OrderCreate,
    OrderCreated,
    OrderOut,
    PaymentInitiate,
    StatusUpdate,
)
from app.services.mpesa import mpesa
from app.services.whatsapp import whatsapp

router = APIRouter(prefix="/orders", tags=["orders"])

# Flat delivery-fee table (KES) by destination band.
DELIVERY_FEES: dict[str, Decimal] = {
    "pickup": Decimal(0),
    "cbd": Decimal(150),
    "nairobi": Decimal(300),
    "outside": Decimal(500),
    "upcountry": Decimal(800),
}

# Platform WhatsApp number used for the checkout deep-link when no seller
# number is attached (e.g. multi-seller carts route via the KaziHub desk).
PLATFORM_WA = "254700000000"


def _delivery_fee(delivery_type: str | None) -> Decimal:
    if delivery_type is None:
        return Decimal(0)
    return DELIVERY_FEES.get(delivery_type, Decimal(0))


async def _load_order(db: AsyncSession, order_id: UUID) -> Order | None:
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.items), selectinload(Order.payment))
    )
    return result.scalar_one_or_none()


@router.post("/", response_model=OrderCreated, status_code=status.HTTP_201_CREATED)
async def create_order(
    payload: OrderCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Create an order from cart items; return a WhatsApp-ready message + link."""
    subtotal = sum((i.unit_price * i.qty for i in payload.items), Decimal(0))
    delivery_fee = _delivery_fee(payload.delivery_type)

    order = Order(
        buyer_id=user.id,
        type=OrderType(payload.type),
        status=OrderStatus.pending,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        delivery_type=DeliveryType(payload.delivery_type) if payload.delivery_type else None,
        delivery_address=payload.delivery_address,
        notes=payload.notes,
    )
    order.items = [
        OrderItem(
            item_id=i.item_id,
            item_type=i.item_type,
            name=i.name,
            qty=i.qty,
            unit_price=i.unit_price,
            size=i.size,
            color=i.color,
            package_id=i.package_id,
        )
        for i in payload.items
    ]
    db.add(order)
    await db.commit()
    await db.refresh(order, attribute_names=["items", "payment"])

    message = whatsapp.format_order_message(order)
    link = whatsapp.build_wa_link(PLATFORM_WA, message)

    base = OrderOut.model_validate(order)
    return OrderCreated(
        **base.model_dump(), whatsapp_message=message, whatsapp_link=link
    )


@router.get("/", response_model=list[OrderOut])
async def my_orders(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    result = await db.execute(
        select(Order)
        .where(Order.buyer_id == user.id)
        .options(selectinload(Order.items), selectinload(Order.payment))
        .order_by(Order.placed_at.desc())
    )
    return result.scalars().all()


@router.get("/{order_id}", response_model=OrderOut)
async def get_order(
    order_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    order = await _load_order(db, order_id)
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    if order.buyer_id != user.id and user.role != UserRole.admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your order")
    return order


@router.post("/{order_id}/pay")
async def pay(
    order_id: UUID,
    payload: PaymentInitiate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Initiate an M-Pesa STK Push for the order total."""
    order = await _load_order(db, order_id)
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    if order.buyer_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your order")

    amount = int(Decimal(order.subtotal) + Decimal(order.delivery_fee))

    payment = order.payment or Payment(order_id=order.id, amount=amount)
    payment.amount = amount
    payment.status = PaymentStatus.processing
    if order.payment is None:
        db.add(payment)

    try:
        result = await mpesa.stk_push(payload.phone_number, amount, str(order.id))
    except Exception as exc:  # noqa: BLE001
        payment.status = PaymentStatus.failed
        await db.commit()
        raise HTTPException(
            status.HTTP_502_BAD_GATEWAY, f"M-Pesa request failed: {exc}"
        ) from exc

    payment.mpesa_checkout_id = result.get("CheckoutRequestID")
    await db.commit()
    return {
        "message": "STK Push sent. Enter your M-Pesa PIN on your phone.",
        "checkout_request_id": result.get("CheckoutRequestID"),
        "amount": amount,
    }


@router.post("/mpesa-callback")
async def mpesa_callback(request: Request, db: AsyncSession = Depends(get_session)):
    """Daraja STK Push callback. Updates payment + order on the result code."""
    body = await request.json()
    parsed = mpesa.parse_callback(body)

    order_id = await mpesa.resolve_pending_order(parsed["checkout_id"])
    if not order_id:
        # Unknown/expired checkout — acknowledge so Safaricom stops retrying.
        return {"ResultCode": 0, "ResultDesc": "Ignored (no pending order)"}

    order = await _load_order(db, UUID(order_id))
    if not order or not order.payment:
        return {"ResultCode": 0, "ResultDesc": "Order/payment not found"}

    if parsed["result_code"] == 0:
        order.payment.status = PaymentStatus.paid
        order.payment.mpesa_ref = parsed["mpesa_ref"]
        order.payment.paid_at = datetime.now(timezone.utc)
        order.payment.raw_callback = body
        order.status = OrderStatus.confirmed
        await db.commit()
        try:
            from app.tasks.jobs import send_order_confirmation

            send_order_confirmation.delay(str(order.id))
        except Exception:
            pass
    else:
        order.payment.status = PaymentStatus.failed
        order.payment.raw_callback = body
        await db.commit()

    return {"ResultCode": 0, "ResultDesc": "Accepted"}


@router.patch("/{order_id}/status", response_model=OrderOut)
async def update_status(
    order_id: UUID,
    payload: StatusUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Seller advances an order through its lifecycle."""
    if user.role not in (UserRole.seller, UserRole.admin):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Seller role required")
    order = await _load_order(db, order_id)
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Order not found")
    order.status = OrderStatus(payload.status)
    if order.status == OrderStatus.completed:
        order.completed_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(order)
    return order
