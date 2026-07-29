"""Product / footwear catalog schemas."""
from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class VariantIn(BaseModel):
    size: str | None = None
    color: str | None = None
    stock: int = 0


class VariantOut(VariantIn):
    model_config = {"from_attributes": True}
    id: UUID


class ProductCreate(BaseModel):
    name: str
    category: str | None = None
    description: str | None = None
    price: Decimal
    was_price: Decimal | None = None
    variants: list[VariantIn] = []


class VariantStockUpdate(BaseModel):
    stock: int


class ProductOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    seller_id: UUID
    name: str
    category: str | None = None
    description: str | None = None
    price: Decimal
    was_price: Decimal | None = None
    sold_count: int
    is_active: bool


class ProductDetail(ProductOut):
    variants: list[VariantOut] = []
