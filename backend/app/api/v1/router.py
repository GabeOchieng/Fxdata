"""Aggregate v1 API router."""
from fastapi import APIRouter

from app.api.v1 import auth, orders, products, rentals, services, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(services.router)
api_router.include_router(rentals.router)
api_router.include_router(products.router)
api_router.include_router(orders.router)
