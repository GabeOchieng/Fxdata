"""Rental listing schemas."""
from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel

from app.models.rental import RentalAvailability, RentalType


class AmenityIn(BaseModel):
    amenity_key: str
    value: str | None = None


class AmenityOut(AmenityIn):
    model_config = {"from_attributes": True}


class RentalCreate(BaseModel):
    type: RentalType
    title: str
    description: str | None = None
    price_monthly: Decimal
    deposit: Decimal | None = None
    area: str | None = None
    sqft: int | None = None
    floor_num: int | None = None
    beds: int = 0
    baths: int = 0
    availability: RentalAvailability = RentalAvailability.now
    is_furnished: bool = False
    is_short_term: bool = False
    matatu_stage: str | None = None
    matatu_mins: int | None = None
    amenities: list[AmenityIn] = []


class RentalUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    price_monthly: Decimal | None = None
    availability: RentalAvailability | None = None
    is_active: bool | None = None


class RentalOut(BaseModel):
    model_config = {"from_attributes": True}
    id: UUID
    owner_id: UUID
    type: RentalType
    title: str
    description: str | None = None
    price_monthly: Decimal
    deposit: Decimal | None = None
    area: str | None = None
    beds: int
    baths: int
    sqft: int | None = None
    availability: RentalAvailability
    is_furnished: bool
    is_short_term: bool
    matatu_stage: str | None = None
    matatu_mins: int | None = None
    views: int


class RentalDetail(RentalOut):
    amenities: list[AmenityOut] = []


class EnquiryRequest(BaseModel):
    message: str
    phone: str | None = None


class AreaStat(BaseModel):
    area: str
    listings: int
    min_price: Decimal | None = None
