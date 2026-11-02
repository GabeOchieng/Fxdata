"""Product / footwear catalog endpoints."""
from __future__ import annotations

from decimal import Decimal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.database import get_session
from app.core.dependencies import get_current_user, require_role
from app.models.product import Product, ProductVariant
from app.models.user import User, UserRole
from app.schemas.common import Page
from app.schemas.product import (
    ProductCreate,
    ProductDetail,
    ProductOut,
    VariantOut,
    VariantStockUpdate,
)

router = APIRouter(prefix="/products", tags=["products"])


@router.get("/", response_model=Page[ProductOut])
async def list_products(
    db: AsyncSession = Depends(get_session),
    category: str | None = None,
    min_price: Decimal | None = None,
    max_price: Decimal | None = None,
    sort: str = Query("popular", pattern="^(popular|price_asc|price_desc|newest)$"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    stmt = select(Product).where(Product.is_active.is_(True))
    if category:
        stmt = stmt.where(Product.category == category)
    if min_price is not None:
        stmt = stmt.where(Product.price >= min_price)
    if max_price is not None:
        stmt = stmt.where(Product.price <= max_price)

    order = {
        "popular": Product.sold_count.desc(),
        "price_asc": Product.price.asc(),
        "price_desc": Product.price.desc(),
        "newest": Product.created_at.desc(),
    }[sort]

    total = await db.scalar(select(func.count()).select_from(stmt.subquery()))
    stmt = stmt.order_by(order).offset((page - 1) * size).limit(size)
    rows = (await db.execute(stmt)).scalars().all()
    return Page[ProductOut](items=rows, total=total or 0, page=page, size=size)


@router.get("/{product_id}", response_model=ProductDetail)
async def get_product(product_id: UUID, db: AsyncSession = Depends(get_session)):
    result = await db.execute(
        select(Product)
        .where(Product.id == product_id)
        .options(selectinload(Product.variants))
    )
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    return product


@router.post("/", response_model=ProductDetail, status_code=status.HTTP_201_CREATED)
async def create_product(
    payload: ProductCreate,
    user: User = Depends(require_role(UserRole.seller)),
    db: AsyncSession = Depends(get_session),
):
    product = Product(
        seller_id=user.id,
        **payload.model_dump(exclude={"variants"}),
    )
    product.variants = [
        ProductVariant(size=v.size, color=v.color, stock=v.stock)
        for v in payload.variants
    ]
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.put("/{product_id}/variants/{variant_id}", response_model=VariantOut)
async def update_variant_stock(
    product_id: UUID,
    variant_id: UUID,
    payload: VariantStockUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_session),
):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Product not found")
    if product.seller_id != user.id and user.role != UserRole.admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Not your product")
    variant = await db.get(ProductVariant, variant_id)
    if not variant or variant.product_id != product_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Variant not found")
    variant.stock = payload.stock
    await db.commit()
    await db.refresh(variant)
    return variant
