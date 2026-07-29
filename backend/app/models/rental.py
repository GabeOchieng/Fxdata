"""Rental listings and their amenities."""
from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base
from app.models.types import GUID

if TYPE_CHECKING:
    from app.models.user import User


class RentalType(str, enum.Enum):
    bedsitter = "bedsitter"
    sq = "sq"
    studio = "studio"
    one_br = "1br"
    two_br = "2br"
    three_br = "3br"
    shared = "shared"
    hostel = "hostel"
    short_stay = "short_stay"
    furnished_apt = "furnished_apt"
    office = "office"
    shop = "shop"
    event_space = "event_space"
    land = "land"


class RentalAvailability(str, enum.Enum):
    now = "now"
    days30 = "30days"
    days60 = "60days"


class Rental(Base):
    __tablename__ = "rentals"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    owner_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    type: Mapped[RentalType] = mapped_column(
        SAEnum(RentalType, name="rental_type"), nullable=False, index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    price_monthly: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False, index=True)
    deposit: Mapped[float | None] = mapped_column(Numeric(10, 2))
    area: Mapped[str | None] = mapped_column(String(100), index=True)
    location_lat: Mapped[float | None] = mapped_column(Numeric(9, 6))
    location_lng: Mapped[float | None] = mapped_column(Numeric(9, 6))
    sqft: Mapped[int | None] = mapped_column(Integer)
    floor_num: Mapped[int | None] = mapped_column(Integer)
    beds: Mapped[int] = mapped_column(SmallInteger, default=0)
    baths: Mapped[int] = mapped_column(SmallInteger, default=0)
    availability: Mapped[RentalAvailability] = mapped_column(
        SAEnum(RentalAvailability, name="rental_availability"),
        default=RentalAvailability.now,
    )
    is_furnished: Mapped[bool] = mapped_column(Boolean, default=False)
    is_short_term: Mapped[bool] = mapped_column(Boolean, default=False)
    matatu_stage: Mapped[str | None] = mapped_column(String(100))
    matatu_mins: Mapped[int | None] = mapped_column(Integer)
    views: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())

    owner: Mapped["User"] = relationship(back_populates="rentals")
    amenities: Mapped[list["RentalAmenity"]] = relationship(
        back_populates="rental", cascade="all, delete-orphan"
    )


class RentalAmenity(Base):
    __tablename__ = "rental_amenities"
    __table_args__ = (UniqueConstraint("rental_id", "amenity_key"),)

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    rental_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("rentals.id", ondelete="CASCADE")
    )
    amenity_key: Mapped[str] = mapped_column(String(50), nullable=False)
    value: Mapped[str | None] = mapped_column(String(100))

    rental: Mapped["Rental"] = relationship(back_populates="amenities")
