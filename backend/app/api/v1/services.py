"""Service marketplace endpoints: listings, categories, bubble aggregates."""
from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.dependencies import get_current_user, require_role
from app.models.category import Category
from app.models.service import ListingStatus, ServiceListing
from app.models.user import User, UserRole
from app.schemas.common import Page
from app.schemas.service import (
    BubbleDatum,
    CategoryOut,
    ServiceListingCreate,
    ServiceListingDetail,
    ServiceListingOut,
    ServiceListingUpdate,
)

router = APIRouter(prefix="/services", tags=["services"])


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories(db: AsyncSession = Depends(get_session)):
    result = await db.execute(select(Category).order_by(Category.name))
    return result.scalars().all()


@router.get("/bubble-data", response_model=list[BubbleDatum])
async def bubble_data(db: AsyncSession = Depends(get_session)):
    """Aggregate XP / workers / jobs per category for the market bubble viz."""
    stmt = (
        select(
            Category.id,
            Category.slug,
            Category.name,
            Category.icon,
            Category.color,
            func.count(ServiceListing.id),
            func.coalesce(func.sum(ServiceListing.workers), 0),
            func.coalesce(func.sum(ServiceListing.jobs_done), 0),
            func.coalesce(func.sum(ServiceListing.xp), 0),
        )
        .select_from(Category)
        .outerjoin(
            ServiceListing,
            (ServiceListing.category_id == Category.id)
            & (ServiceListing.status == ListingStatus.active),
        )
        .group_by(Category.id)
        .order_by(Category.name)
    )
    rows = (await db.execute(stmt)).all()
    return [
        BubbleDatum(
            category_id=r[0],
            slug=r[1],
            name=r[2],
            icon=r[3],
            color=r[4],
            listings=r[5],
            workers=int(r[6]),
            jobs_done=int(r[7]),
            xp=int(r[8]),
        )
        for r in rows
    ]


@router.get("/", response_model=Page[ServiceListingOut])
async def list_services(
    db: AsyncSession = Depends(get_session),
    category: int | None = None,
    area: str | None = None,
    min_xp: int | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    stmt = select(ServiceListing).where(ServiceListing.status == ListingStatus.active)
    if category is not None:
        stmt = stmt.where(ServiceListing.category_id == category)
    if area:
        stmt = stmt.where(ServiceListing.area == area)
    if min_xp is not None:
        stmt = stmt.where(ServiceListing.xp >= min_xp)
    if search:
        stmt = stmt.where(ServiceListing.title.ilike(f"%{search}%"))

    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    stmt = stmt.order_by(ServiceListing.xp.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return Page[ServiceListingOut](items=rows, total=total or 0, page=page, size=size)


@router.get("/{listing_id}", response_model=ServiceListingDetail)
async def get_service(listing_id: UUID, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(ServiceListing)
        .where(ServiceListing.id == listing_id)
        .options(
            selectinload(ServiceListing.packages),
            selectinload(ServiceListing.portfolio),
        )
    )
    listing = result.scalar_one_or_none()
    if not listing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    return listing


@router.post("/", response_model=ServiceListingOut, status_code=status.HTTP_201_CREATED)
async def create_service(
    payload: ServiceListingCreate,
    user: User = Depends(require_role(UserRole.seller)),
    db: AsyncSession = Depends(get_session),
):
    listing = ServiceListing(
        user_id=user.id,
        status=ListingStatus.pending,
        **payload.model_dump(),
    )
    db.add(listing)
    await db.commit()
    await db.refresh(listing)
    return listing


@router.put("/{listing_id}", response_model=ServiceListingOut)
async def update_service(
    listing_id: UUID,
    payload: ServiceListingUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    listing = await db.get(ServiceListing, listing_id)
    if not listing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    if listing.user_id != user.id and user.role != UserRole.admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your listing")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(listing, field, value)
    await db.commit()
    await db.refresh(listing)
    return listing


@router.delete("/{listing_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_service(
    listing_id: UUID,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    listing = await db.get(ServiceListing, listing_id)
    if not listing:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Listing not found")
    if listing.user_id != user.id and user.role != UserRole.admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your listing")
    await db.delete(listing)
    await db.commit()
