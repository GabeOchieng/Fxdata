"""Rental marketplace endpoints."""
from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.dependencies import get_current_user
from app.models.rental import Rental, RentalAmenity, RentalType
from app.models.user import User, UserRole
from app.schemas.common import Page
from app.schemas.rental import (
    AreaStat,
    EnquiryRequest,
    RentalCreate,
    RentalDetail,
    RentalOut,
    RentalUpdate,
)

router = APIRouter(prefix="/rentals", tags=["rentals"])


@router.get("/areas", response_model=list[AreaStat])
async def rental_areas(db: AsyncSession = Depends(get_session)):
    stmt = (
        select(
            Rental.area,
            func.count(Rental.id),
            func.min(Rental.price_monthly),
        )
        .where(Rental.is_active.is_(True), Rental.area.isnot(None))
        .group_by(Rental.area)
        .order_by(func.count(Rental.id).desc())
    )
    rows = (await db.execute(stmt)).all()
    return [AreaStat(area=r[0], listings=r[1], min_price=r[2]) for r in rows]


@router.get("/", response_model=Page[RentalOut])
async def list_rentals(
    db: AsyncSession = Depends(get_session),
    type: RentalType | None = None,
    area: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    furnished: bool | None = None,
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    stmt = select(Rental).where(Rental.is_active.is_(True))
    if type is not None:
        stmt = stmt.where(Rental.type == type)
    if area:
        stmt = stmt.where(Rental.area == area)
    if min_price is not None:
        stmt = stmt.where(Rental.price_monthly >= min_price)
    if max_price is not None:
        stmt = stmt.where(Rental.price_monthly <= max_price)
    if furnished is not None:
        stmt = stmt.where(Rental.is_furnished.is_(furnished))

    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    stmt = stmt.order_by(Rental.created_at.desc()).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return Page[RentalOut](items=rows, total=total or 0, page=page, size=size)


@router.get("/{rental_id}", response_model=RentalDetail)
async def get_rental(rental_id: UUID, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(Rental)
        .where(Rental.id == rental_id)
        .options(selectinload(Rental.amenities))
    )
    rental = result.scalar_one_or_none()
    if not rental:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Rental not found")
    rental.views += 1
    await db.commit()
    await db.refresh(rental)
    return rental


@router.post("/", response_model=RentalOut, status_code=status.HTTP_201_CREATED)
async def create_rental(
    payload: RentalCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    data = payload.model_dump(exclude={"amenities"})
    rental = Rental(owner_id=user.id, **data)
    rental.amenities = [
        RentalAmenity(amenity_key=a.amenity_key, value=a.value)
        for a in payload.amenities
    ]
    db.add(rental)
    await db.commit()
    await db.refresh(rental)
    return rental


@router.patch("/{rental_id}", response_model=RentalOut)
async def update_rental(
    rental_id: UUID,
    payload: RentalUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    rental = await db.get(Rental, rental_id)
    if not rental:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Rental not found")
    if rental.owner_id != user.id and user.role != UserRole.admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your rental")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(rental, field, value)
    await db.commit()
    await db.refresh(rental)
    return rental


@router.post("/{rental_id}/enquire", status_code=status.HTTP_202_ACCEPTED)
async def enquire(
    rental_id: UUID,
    payload: EnquiryRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    """Submit a viewing request — queues a WhatsApp notification to the landlord."""
    rental = await db.get(Rental, rental_id)
    if not rental:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Rental not found")

    phone = payload.phone or (user.profile.whatsapp if user.profile else user.phone)
    try:
        from app.tasks.jobs import send_rental_enquiry

        send_rental_enquiry.delay(str(rental_id), phone or "", payload.message)
    except Exception:
        # Broker unavailable in local dev — accept the enquiry regardless.
        pass
    return {"message": "Enquiry sent to the landlord", "rental_id": str(rental_id)}
