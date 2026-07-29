"""Seed reference data (categories) and a little demo content.

Run with:  python -m app.db.seed
Idempotent: existing categories (matched by slug) are left untouched.
"""
from __future__ import annotations

import asyncio
from decimal import Decimal

from sqlalchemy import select

from app.core.database import SessionLocal, init_models
from app.models.category import Category
from app.models.product import Product, ProductVariant
from app.models.rental import Rental, RentalType
from app.models.service import ListingStatus, ServiceListing
from app.models.user import User, UserProfile, UserRole
from app.core.security import get_password_hash

# 21 top-level categories, mirroring the market map's CATS palette.
CATEGORIES: list[dict] = [
    {"slug": "tech", "name": "Tech & Devices", "icon": "💻", "color": "#00d4ff"},
    {"slug": "beauty", "name": "Beauty", "icon": "💅", "color": "#ff3d9a"},
    {"slug": "food", "name": "Food & Catering", "icon": "🍽", "color": "#ff6b2b"},
    {"slug": "home", "name": "Home Services", "icon": "🏠", "color": "#7c5cff"},
    {"slug": "education", "name": "Education", "icon": "📚", "color": "#00ffb3"},
    {"slug": "events", "name": "Events", "icon": "🎉", "color": "#ffd000"},
    {"slug": "transport", "name": "Transport", "icon": "🚗", "color": "#2b8fff"},
    {"slug": "health", "name": "Health & Care", "icon": "❤️", "color": "#ff3d5a"},
    {"slug": "construction", "name": "Construction", "icon": "🔨", "color": "#ff8c00"},
    {"slug": "creative", "name": "Creative & Media", "icon": "🎨", "color": "#c94dff"},
    {"slug": "finance", "name": "Finance & Legal", "icon": "💰", "color": "#00d26a"},
    {"slug": "security", "name": "Security", "icon": "🔒", "color": "#6a8aaa"},
    {"slug": "wellness", "name": "Wellness & Sport", "icon": "🧘", "color": "#ff5fa0"},
    {"slug": "rental", "name": "Rentals & Stays", "icon": "🏡", "color": "#00e5ff"},
    {"slug": "artisan", "name": "Artisan & Jua Kali", "icon": "🪚", "color": "#ff7043"},
    {"slug": "digital", "name": "Digital Hustle", "icon": "📲", "color": "#7c4dff"},
    {"slug": "legal", "name": "Legal & Admin", "icon": "⚖️", "color": "#546e7a"},
    {"slug": "farm", "name": "Agri & Farm", "icon": "🌾", "color": "#66bb6a"},
    {"slug": "kids", "name": "Kids & Family", "icon": "👧", "color": "#ff80ab"},
    {"slug": "culture", "name": "Culture & Talent", "icon": "🎭", "color": "#ffa726"},
    {"slug": "civil", "name": "Civil & Community", "icon": "🏛️", "color": "#78909c"},
]


async def seed_categories(db) -> dict[str, int]:
    existing = {c.slug: c for c in (await db.execute(select(Category))).scalars()}
    for row in CATEGORIES:
        if row["slug"] not in existing:
            cat = Category(**row)
            db.add(cat)
            existing[row["slug"]] = cat
    await db.commit()
    result = await db.execute(select(Category))
    return {c.slug: c.id for c in result.scalars()}


async def seed_demo(db, cat_ids: dict[str, int]) -> None:
    """A demo seller with a couple of listings, a rental and a product."""
    exists = await db.execute(select(User).where(User.phone == "+254700111222"))
    if exists.scalar_one_or_none():
        return

    seller = User(
        phone="+254700111222",
        name="Wanjiku Mwangi",
        role=UserRole.seller,
        is_verified=True,
        password_hash=get_password_hash("demo1234"),
    )
    seller.profile = UserProfile(
        whatsapp="+254700111222",
        area="Kasarani",
        location="Nairobi",
        rating=Decimal("4.8"),
        jobs_done=132,
        xp=4200,
    )
    db.add(seller)
    await db.flush()

    db.add_all(
        [
            ServiceListing(
                user_id=seller.id,
                category_id=cat_ids["beauty"],
                title="Mobile Braiding & Locs",
                description="Home-visit braiding, twists and loc maintenance.",
                price_from=Decimal("800"),
                workers=3,
                jobs_done=132,
                xp=4200,
                status=ListingStatus.active,
                area="Kasarani",
            ),
            ServiceListing(
                user_id=seller.id,
                category_id=cat_ids["home"],
                title="Deep Cleaning Crew",
                description="Move-in / Airbnb turnover deep cleans.",
                price_from=Decimal("2500"),
                workers=5,
                jobs_done=87,
                xp=3100,
                status=ListingStatus.active,
                area="Roysambu",
            ),
        ]
    )

    rental = Rental(
        owner_id=seller.id,
        type=RentalType.bedsitter,
        title="Cozy Bedsitter — Kasarani Sunton",
        description="Self-contained, secure compound, 5 min to the stage.",
        price_monthly=Decimal("9500"),
        deposit=Decimal("9500"),
        area="Kasarani",
        beds=1,
        baths=1,
        matatu_stage="Sunton",
        matatu_mins=5,
    )
    db.add(rental)

    product = Product(
        seller_id=seller.id,
        name="Canvas Low-Top — Nairobi Edition",
        category="sneakers",
        description="Handmade canvas sneakers.",
        price=Decimal("2999"),
        was_price=Decimal("3999"),
        sold_count=64,
    )
    product.variants = [
        ProductVariant(size="40", color="black", stock=12),
        ProductVariant(size="41", color="black", stock=8),
        ProductVariant(size="42", color="white", stock=5),
    ]
    db.add(product)

    await db.commit()


async def main() -> None:
    await init_models()
    async with SessionLocal() as db:
        cat_ids = await seed_categories(db)
        await seed_demo(db, cat_ids)
    print(f"✓ Seeded {len(CATEGORIES)} categories + demo content.")


if __name__ == "__main__":
    asyncio.run(main())
