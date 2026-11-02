"""Service listing schemas."""
from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.models.service import ListingStatus


class CategoryOut(BaseModel):
    model_config = {"from_attributes": True}
    id: int
    name: str
    slug: str
    icon: str | None = None
    color: str | None = None
    parent_id: int | None = None


class PackageOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    name: str
    description: str | None = None
    price: Decimal
    is_featured: bool = False
    icon: str | None = None


class PortfolioOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    media_url: str
    media_type: str = "image"
    title: str | None = None


class ServiceListingCreate(BaseModel):
    category_id: int
    title: str
    description: str | None = None
    price_from: Decimal | None = None
    workers: int = 1
    area: str | None = None


class ServiceListingUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price_from: Decimal | None = None
    workers: int | None = None
    area: str | None = None
    status: ListingStatus | None = None


class ServiceListingOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    user_id: UUID
    category_id: int
    title: str
    description: str | None = None
    price_from: Decimal | None = None
    workers: int
    jobs_done: int
    xp: int
    status: ListingStatus
    area: str | None = None


class ServiceListingDetail(ServiceListingOut):
    packages: list[PackageOut] = []
    portfolio: list[PortfolioOut] = []


class BubbleDatum(BaseModel):
    """Aggregate per-category figures that feed the market bubble viz."""

    category_id: int
    slug: str
    name: str
    icon: str | None = None
    color: str | None = None
    listings: int
    workers: int
    jobs_done: int
    xp: int
