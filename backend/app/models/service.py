"""Service marketplace listings, portfolio items and packages."""
from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import (
    Boolean,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin
from app.models.types import GUID

if TYPE_CHECKING:
    from app.models.category import Category
    from app.models.user import User


class ListingStatus(str, enum.Enum):
    active = "active"
    paused = "paused"
    pending = "pending"
    suspended = "suspended"


class ServiceListing(Base, TimestampMixin):
    __tablename__ = "service_listings"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    category_id: Mapped[int] = mapped_column(
        ForeignKey("categories.id"), index=True
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    price_from: Mapped[float | None] = mapped_column(Numeric(10, 2))
    workers: Mapped[int] = mapped_column(Integer, default=1)
    jobs_done: Mapped[int] = mapped_column(Integer, default=0)
    review_count: Mapped[int] = mapped_column(Integer, default=0)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[ListingStatus] = mapped_column(
        SAEnum(ListingStatus, name="listing_status"), default=ListingStatus.pending
    )
    area: Mapped[str | None] = mapped_column(String(100), index=True)

    user: Mapped["User"] = relationship(back_populates="listings")
    category: Mapped["Category"] = relationship(back_populates="listings")
    portfolio: Mapped[list["PortfolioItem"]] = relationship(
        back_populates="listing", cascade="all, delete-orphan"
    )
    packages: Mapped[list["ServicePackage"]] = relationship(
        back_populates="listing", cascade="all, delete-orphan"
    )


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    listing_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("service_listings.id", ondelete="CASCADE")
    )
    media_url: Mapped[str] = mapped_column(Text, nullable=False)
    media_type: Mapped[str] = mapped_column(String(20), default="image")
    title: Mapped[str | None] = mapped_column(String(255))
    description: Mapped[str | None] = mapped_column(Text)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)

    listing: Mapped["ServiceListing"] = relationship(back_populates="portfolio")


class ServicePackage(Base):
    __tablename__ = "service_packages"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    listing_id: Mapped[uuid.UUID] = mapped_column(
        GUID(), ForeignKey("service_listings.id", ondelete="CASCADE")
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    price: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    icon: Mapped[str | None] = mapped_column(String(10))

    listing: Mapped["ServiceListing"] = relationship(back_populates="packages")
