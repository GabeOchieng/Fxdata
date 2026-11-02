"""Orders, order items and payments (M-Pesa)."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.types import GUID, JSONB

if TYPE_CHECKING:
    from app.models.user import User


class OrderType(str, enum.Enum):
    service = "service"
    rental = "rental"
    product = "product"


class OrderStatus(str, enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    in_progress = "in_progress"
    completed = "completed"
    cancelled = "cancelled"
    refunded = "refunded"


class DeliveryType(str, enum.Enum):
    pickup = "pickup"
    cbd = "cbd"
    nairobi = "nairobi"
    outside = "outside"
    upcountry = "upcountry"


class PaymentMethod(str, enum.Enum):
    mpesa = "mpesa"
    card = "card"
    cash = "cash"
    wallet = "wallet"


class PaymentStatus(str, enum.Enum):
    pending = "pending"
    processing = "processing"
    paid = "paid"
    failed = "failed"
    refunded = "refunded"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    buyer_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id"), index=True
    )
    type: Mapped[OrderType] = mapped_column(
        SAEnum(OrderType, name="order_type"), nullable=False
    )
    status: Mapped[OrderStatus] = mapped_column(
        SAEnum(OrderStatus, name="order_status"), default=OrderStatus.pending, index=True
    )
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    delivery_fee: Mapped[float] = mapped_column(Numeric(10, 2), default=0)
    delivery_type: Mapped[DeliveryType | None] = mapped_column(
        SAEnum(DeliveryType, name="delivery_type")
    )
    delivery_address: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    placed_at: Mapped[datetime] = mapped_column(server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column()

    buyer: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(
        back_populates="order", cascade="all, delete-orphan"
    )
    payment: Mapped["Payment | None"] = relationship(
        back_populates="order", uselist=False, cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("orders.id", ondelete="CASCADE")
    )
    item_id: Mapped[uuid.UUID] = mapped_column(GUID(), nullable=False)
    item_type: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str | None] = mapped_column(String(255))
    qty: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    size: Mapped[str | None] = mapped_column(String(20))
    color: Mapped[str | None] = mapped_column(String(50))
    package_id: Mapped[uuid.UUID | None] = mapped_column(GUID())

    order: Mapped["Order"] = relationship(back_populates="items")


class Payment(Base):
    __tablename__ = "payments"
    __table_args__ = (UniqueConstraint("order_id"),)

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("orders.id"))
    method: Mapped[PaymentMethod] = mapped_column(
        SAEnum(PaymentMethod, name="payment_method"), default=PaymentMethod.mpesa
    )
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    mpesa_ref: Mapped[str | None] = mapped_column(String(50))
    mpesa_checkout_id: Mapped[str | None] = mapped_column(String(100))
    status: Mapped[PaymentStatus] = mapped_column(
        SAEnum(PaymentStatus, name="payment_status"), default=PaymentStatus.pending
    )
    paid_at: Mapped[datetime | None] = mapped_column()
    raw_callback: Mapped[dict | None] = mapped_column(JSONB())

    order: Mapped["Order"] = relationship(back_populates="payment")
