from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user
import uuid
import time

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


def batch_get_items_specs(db: Session, items: List[models.GearCatalog]) -> dict:
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
        cat_results = (
            db.query(models.Category).filter(models.Category.id.in_(category_ids)).all()
        )
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
            # Convert strings back to UUIDs for query
            uuid_ids = [uuid.UUID(id_str) for id_str in item_ids]
            specs_results = (
                db.query(spec_model).filter(spec_model.gear_id.in_(uuid_ids)).all()
            )
            for spec in specs_results:
                spec_dict = {
                    to_camel_case(c.name): getattr(spec, c.name)
                    for c in spec.__table__.columns
                    if c.name != "gear_id"
                }
                specs_cache[str(spec.gear_id)] = spec_dict

    return specs_cache


@router.get("/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()


@router.get("/brands", response_model=List[schemas.Brand])
def get_brands(category_id: Optional[uuid.UUID] = None, db: Session = Depends(get_db)):
    query = db.query(models.Brand)
    if category_id:
        # Join with gear_catalog to find brands that have items in this category
        query = (
            query.join(models.GearCatalog)
            .filter(models.GearCatalog.category_id == category_id)
            .distinct()
        )
    return query.all()


@router.get("/items", response_model=List[schemas.GearCatalog])
def get_items(
    category_id: Optional[uuid.UUID] = None,
    brand_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db),
):
    start_time = time.time()

    query = db.query(models.GearCatalog)
    if category_id:
        query = query.filter(models.GearCatalog.category_id == category_id)
    if brand_id:
        query = query.filter(models.GearCatalog.brand_id == brand_id)

    items = query.all()
    query_time = time.time() - start_time

    # Batch fetch all specs at once
    enrich_start = time.time()
    specs_cache = batch_get_items_specs(db, items)
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
        print(
            f"[CATALOG] get_items: {len(items)} items, Query: {query_time:.3f}s, Enrich: {enrich_time:.3f}s, Total: {total_time:.3f}s"
        )

    return enriched_items


@router.get("/items/{item_id}", response_model=schemas.GearCatalog)
def get_item(item_id: uuid.UUID, db: Session = Depends(get_db)):
    item = db.query(models.GearCatalog).filter(models.GearCatalog.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Use batch function for single item (for consistency)
    specs_cache = batch_get_items_specs(db, [item])

    return {
        "id": item.id,
        "brand_id": item.brand_id,
        "category_id": item.category_id,
        "name": item.name,
        "description": item.description,
        "image_url": item.image_url,
        "created_at": item.created_at,
        "specs": specs_cache.get(str(item.id), {}),
    }


@router.get("/items/{item_id}/specs")
def get_item_specs(item_id: uuid.UUID, db: Session = Depends(get_db)):
    item = db.query(models.GearCatalog).filter(models.GearCatalog.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    # Use batch function for single item
    specs_cache = batch_get_items_specs(db, [item])
    return specs_cache.get(str(item.id), {})
