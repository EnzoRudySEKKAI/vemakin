from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, cast, String
from typing import List, Optional
import uuid
import time
import logging

from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db
from ..cache import catalog_cache

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/catalog", tags=["catalog"])

SPECS_MODELS_MAPPING = {
    "audio": models.AudioSpecs,
    "camera": models.CameraSpecs,
    "lens": models.LensSpecs,
    "light": models.LightSpecs,
    "monitor": models.MonitorSpecs,
    "prop": models.PropSpecs,
    "stabilizer": models.StabilizerSpecs,
    "tripod": models.TripodSpecs,
    "wireless": models.WirelessSpecs,
    "drone": models.DroneSpecs,
    "filter": models.FilterSpecs,
    "grip": models.GripSpecs,
}


def to_camel_case(snake_str: str) -> str:
    components = snake_str.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


async def batch_get_items_specs(
    db: AsyncSession, items: List[models.GearCatalog]
) -> dict:
    """Optimized batch specs fetching - fetch all specs in bulk instead of N+1 queries"""
    if not items:
        return {}

    # Collect unique category IDs
    category_ids = set()
    for item in items:
        if item.category_id:
            category_ids.add(item.category_id)

    # Bulk fetch categories
    categories = {}
    if category_ids:
        # Convert UUIDs to strings for the query
        category_id_strs = [str(cat_id) for cat_id in category_ids]
        stmt = select(models.Category).where(
            cast(models.Category.id, String).in_(category_id_strs)
        )
        result = await db.execute(stmt)
        cat_results = result.scalars().all()
        categories = {str(c.id): c for c in cat_results}

    # Group items by category slug for batch fetching
    category_to_item_ids = {}
    for item in items:
        category = categories.get(str(item.category_id))
        if category and category.slug in SPECS_MODELS_MAPPING:
            if category.slug not in category_to_item_ids:
                category_to_item_ids[category.slug] = set()
            category_to_item_ids[category.slug].add(str(item.id))

    # Fetch specs in batch per category
    specs_cache = {}
    for category_slug, item_ids_set in category_to_item_ids.items():
        spec_model = SPECS_MODELS_MAPPING[category_slug]
        item_ids = list(item_ids_set)
        if item_ids:
            # Use string comparison for UUID columns
            stmt = select(spec_model).where(
                cast(spec_model.gear_id, String).in_(item_ids)
            )
            result = await db.execute(stmt)
            specs_results = result.scalars().all()
            for spec in specs_results:
                spec_dict = {
                    to_camel_case(c.name): getattr(spec, c.name)
                    for c in spec.__table__.columns
                    if c.name != "gear_id"
                }
                specs_cache[str(spec.gear_id)] = spec_dict

    return specs_cache


@router.get("/categories", response_model=List[schemas.Category])
async def get_categories(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # Return mock catalog categories
        return mock_db.list_catalog_categories()

    # Use cache if available
    if catalog_cache.is_loaded():
        return catalog_cache.get_categories()

    # Fallback to database query
    result = await db.execute(select(models.Category))
    return result.scalars().all()


@router.get("/brands", response_model=List[schemas.Brand])
async def get_brands(
    category_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # Return mock catalog brands (optionally filtered by category)
        brands = mock_db.list_catalog_brands()
        if category_id:
            # Filter brands that have items in this category
            items = mock_db.list_catalog_items()
            brand_ids_in_category = {
                item.get("brand_id")
                for item in items
                if item.get("category_id") == str(category_id)
            }
            brands = [b for b in brands if str(b.get("id")) in brand_ids_in_category]
        return brands

    # Use cache if available
    if catalog_cache.is_loaded():
        return catalog_cache.get_brands(category_id)

    # Fallback to database query
    stmt = select(models.Brand)
    if category_id:
        # Join with gear_catalog to find brands that have items in this category
        stmt = (
            stmt.join(models.GearCatalog)
            .where(models.GearCatalog.category_id == category_id)
            .distinct()
        )
    result = await db.execute(stmt)
    return result.scalars().all()


@router.get("/items", response_model=List[schemas.GearCatalog])
async def get_items(
    category_id: Optional[uuid.UUID] = None,
    brand_id: Optional[uuid.UUID] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # Return mock catalog items (optionally filtered)
        items = mock_db.list_catalog_items()
        if category_id:
            items = [
                item for item in items if item.get("category_id") == str(category_id)
            ]
        if brand_id:
            items = [item for item in items if item.get("brand_id") == str(brand_id)]
        return items

    # Use cache if available
    if catalog_cache.is_loaded():
        return catalog_cache.get_items(category_id, brand_id)

    # Fallback to database query
    start_time = time.time()

    stmt = select(models.GearCatalog)
    if category_id:
        stmt = stmt.where(models.GearCatalog.category_id == category_id)
    if brand_id:
        stmt = stmt.where(models.GearCatalog.brand_id == brand_id)

    result = await db.execute(stmt)
    items = result.scalars().all()
    query_time = time.time() - start_time

    # Batch fetch all specs at once
    enrich_start = time.time()
    specs_cache = await batch_get_items_specs(db, items)
    enrich_time = time.time() - enrich_start

    # Build response
    enriched_items = []
    for item in items:
        item_dict = {
            "id": item.id,
            "brand_id": item.brand_id,
            "category_id": item.category_id,
            "name": item.name,
            "description": item.description,
            "image_url": item.image_url,
            "created_at": item.created_at,
            "specs": specs_cache.get(str(item.id), {}),
        }
        enriched_items.append(item_dict)

    total_time = time.time() - start_time
    if total_time > 0.5:
        logger.warning(
            f"[CATALOG] get_items (DB fallback): {len(items)} items, "
            f"Query: {query_time:.3f}s, Enrich: {enrich_time:.3f}s, "
            f"Total: {total_time:.3f}s"
        )

    return enriched_items


@router.get("/items/{item_id}", response_model=schemas.GearCatalog)
async def get_item(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # Return mock catalog item by id
        item = mock_db.get_catalog_item(str(item_id))
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item

    # Use cache if available
    if catalog_cache.is_loaded():
        item = catalog_cache.get_item(item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item

    # Fallback to database query
    stmt = select(models.GearCatalog).where(models.GearCatalog.id == item_id)
    result = await db.execute(stmt)
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Use batch function for single item (for consistency)
    specs_cache_result = await batch_get_items_specs(db, [item])

    return {
        "id": item.id,
        "brand_id": item.brand_id,
        "category_id": item.category_id,
        "name": item.name,
        "description": item.description,
        "image_url": item.image_url,
        "created_at": item.created_at,
        "specs": specs_cache_result.get(str(item.id), {}),
    }


@router.get("/items/{item_id}/specs")
async def get_item_specs(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # Return mock catalog item specs
        item = mock_db.get_catalog_item(str(item_id))
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")
        return item.get("specs", {})

    # Use cache if available
    if catalog_cache.is_loaded():
        specs = catalog_cache.get_specs(item_id)
        return specs

    # Fallback to database query
    stmt = select(models.GearCatalog).where(models.GearCatalog.id == item_id)
    result = await db.execute(stmt)
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Use batch function for single item
    specs_cache_result = await batch_get_items_specs(db, [item])
    return specs_cache_result.get(str(item.id), {})


@router.get("/health")
def get_cache_health():
    """Get catalog cache health status and statistics."""
    return catalog_cache.get_stats()
