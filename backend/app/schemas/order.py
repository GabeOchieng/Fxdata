"""Order, checkout and payment schemas."""
from __future__ import annotations

from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, field_validator, model_validator

from app.schemas.common import normalize_ke_phone


class OrderItemCreate(BaseModel):
    item_id: UUID
    item_type: Literal["service", "rental", "product"]
    name: str | None = None
    qty: int = 1
    unit_price: Decimal
    size: str | None = None
    color: str | None = None
    package_id: UUID | None = None

    @field_validator("qty")
    @classmethod
    def qty_positive(cls, v: int) -> int:
        if v < 1:
            raise ValueError("Quantity must be at least 1")
        return v


class OrderCreate(BaseModel):
    type: Literal["service", "rental", "product"]
    items: list[OrderItemCreate]
    delivery_type: Literal["pickup", "cbd", "nairobi", "outside", "upcountry"] | None = None
    delivery_address: str | None = None
    notes: str | None = None

    @field_validator("items")
    @classmethod
    def items_not_empty(cls, v: list[OrderItemCreate]) -> list[OrderItemCreate]:
        if not v:
            raise ValueError("An order needs at least one item")
        return v

    @model_validator(mode="after")
    def delivery_address_required(self) -> "OrderCreate":
        if self.delivery_type in ("nairobi", "outside", "upcountry"):
            if not self.delivery_address:
                raise ValueError("delivery_address required for this delivery type")
        return self


class OrderItemOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    item_id: UUID
    item_type: str
    name: str | None = None
    qty: int
    unit_price: Decimal
    size: str | None = None
    color: str | None = None


class PaymentOut(BaseModel):
    model_config = {"from_attributes": True}
    method: str
    amount: Decimal
    status: str
    mpesa_ref: str | None = None


class OrderOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    type: str
    status: str
    subtotal: Decimal
    delivery_fee: Decimal
    delivery_type: str | None = None
    delivery_address: str | None = None
    items: list[OrderItemOut] = []
    payment: PaymentOut | None = None


class OrderCreated(OrderOut):
    """Order response enriched with a WhatsApp deep-link + message."""

    whatsapp_message: str
    whatsapp_link: str | None = None


class PaymentInitiate(BaseModel):
    phone_number: str  # +254 format

    @field_validator("phone_number")
    @classmethod
    def validate_ke_phone(cls, v: str) -> str:
        return normalize_ke_phone(v)


class StatusUpdate(BaseModel):
    status: Literal[
        "pending", "confirmed", "in_progress", "completed", "cancelled", "refunded"
    ]


class MpesaCallback(BaseModel):
    """Incoming M-Pesa STK Push callback envelope."""

    Body: dict
