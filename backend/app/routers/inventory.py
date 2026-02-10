from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db
import uuid
import time

router = APIRouter(prefix="/inventory", tags=["inventory"])

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


def enrich_single_equipment(db: Session, item: models.Equipment) -> dict:
    """Lightweight enrichment for single items - avoids batch overhead"""
    # Default display values
    display_category = item.category
    display_name = item.name or (
        item.custom_name if item.custom_name else "New Equipment"
    )
    specs = {}

    # Try to get category name if it's a UUID
    if item.category:
        try:
            cat_uuid = uuid.UUID(item.category)
            # SQLAlchemy 2.0
            category_stmt = select(models.Category).where(
                models.Category.id == cat_uuid
            )
            category = db.execute(category_stmt).scalar_one_or_none()
            if category:
                display_category = category.name
        except (ValueError, TypeError):
            pass

    catalog_item_id = item.catalog_item_id
    if not catalog_item_id:
        try:
            catalog_item_id = uuid.UUID(str(item.name))
        except (ValueError, TypeError):
            catalog_item_id = None

    if catalog_item_id:
        # SQLAlchemy 2.0
        catalog_stmt = select(models.GearCatalog).where(
            models.GearCatalog.id == catalog_item_id
        )
        catalog_item = db.execute(catalog_stmt).scalar_one_or_none()
        if catalog_item:
            display_name = catalog_item.name
            # Get specs for this item
            cat_stmt = select(models.Category).where(
                models.Category.id == catalog_item.category_id
            )
            category = db.execute(cat_stmt).scalar_one_or_none()
            if category and category.slug in SPECS_MODELS_MAPPING:
                spec_model = SPECS_MODELS_MAPPING[category.slug]
                spec_stmt = select(spec_model).where(
                    spec_model.gear_id == catalog_item_id
                )
                spec_result = db.execute(spec_stmt).scalar_one_or_none()
                if spec_result:
                    specs = {
                        to_camel_case(c.name): getattr(spec_result, c.name)
                        for c in spec_result.__table__.columns
                        if c.name != "gear_id"
                    }
    elif display_category:
        try:
            uuid.UUID(display_category)
        except (ValueError, TypeError):
            display_name = display_category

    brand_name = None
    if catalog_item and catalog_item.brand_id:
        brand_stmt = select(models.Brand).where(models.Brand.id == catalog_item.brand_id)
        brand = db.execute(brand_stmt).scalar_one_or_none()
        if brand:
            brand_name = brand.name

    return {
        "id": item.id,
        "name": display_name,
        "catalogItemId": item.catalog_item_id,
        "customName": item.custom_name,
        "serialNumber": item.serial_number,
        "category": display_category,
        "pricePerDay": item.price_per_day,
        "rentalPrice": item.rental_price,
        "rentalFrequency": item.rental_frequency,
        "quantity": item.quantity,
        "isOwned": bool(item.is_owned) if item.is_owned is not None else True,
        "status": item.status,
        "specs": specs,
        "brandName": brand_name,
        "modelName": display_name if catalog_item_id else None,
    }


def map_equipment_to_response(item: dict) -> dict:
    """Helper to map snake_case mock data to camelCase schema fields."""
    return {
        "id": item["id"],
        "name": item.get("name", "New Equipment"),
        "catalogItemId": item.get("catalog_item_id"),
        "customName": item.get("custom_name"),
        "serialNumber": item.get("serial_number"),
        "category": item.get("category", "Accessories"),
        "pricePerDay": item.get("price_per_day", 0),
        "rentalPrice": item.get("rental_price"),
        "rentalFrequency": item.get("rental_frequency"),
        "quantity": item.get("quantity", 1),
        "isOwned": item.get("is_owned", True),
        "status": item.get("status", "available"),
        "brandName": item.get("brand"),
        "modelName": item.get("model"),
    }


def batch_enrich_equipment(db: Session, items: List[models.Equipment]) -> List[dict]:
    """Batch enrichment to avoid N+1 queries - uses optimized bulk loading"""
    start_time = time.time()

    if not items:
        return []

    result = []

    # Collect all category IDs and catalog item IDs
    category_ids = set()
    catalog_item_ids = set()
    for item in items:
        if item.category:
            try:
                cat_uuid = uuid.UUID(item.category)
                category_ids.add(cat_uuid)
            except (ValueError, TypeError):
                pass

        if item.catalog_item_id:
            catalog_item_ids.add(item.catalog_item_id)
        else:
            try:
                name_uuid = uuid.UUID(str(item.name))
                catalog_item_ids.add(name_uuid)
            except (ValueError, TypeError):
                pass

    # Batch fetch all categories in single query (SQLAlchemy 2.0)
    categories = {}
    if category_ids:
        cat_stmt = select(models.Category).where(models.Category.id.in_(category_ids))
        cat_results = db.execute(cat_stmt).scalars().all()
        categories = {str(c.id): c for c in cat_results}

    # Batch fetch all catalog items in single query (SQLAlchemy 2.0)
    catalog_items = {}
    if catalog_item_ids:
        catalog_stmt = select(models.GearCatalog).where(
            models.GearCatalog.id.in_(catalog_item_ids)
        )
        catalog_results = db.execute(catalog_stmt).scalars().all()
        catalog_items = {str(c.id): c for c in catalog_results}

    # Batch fetch all brands
    brands = {}
    brand_ids = {c.brand_id for c in catalog_items.values() if c.brand_id}
    if brand_ids:
        brand_stmt = select(models.Brand).where(models.Brand.id.in_(brand_ids))
        brand_results = db.execute(brand_stmt).scalars().all()
        brands = {str(b.id): b for b in brand_results}

    # Group items by category for efficient specs fetching
    category_to_gear_ids = {}
    for item in items:
        catalog_item_id_str = (
            str(item.catalog_item_id) if item.catalog_item_id else None
        )
        if not catalog_item_id_str:
            try:
                catalog_item_id_str = str(uuid.UUID(str(item.name)))
            except (ValueError, TypeError):
                catalog_item_id_str = None

        if catalog_item_id_str and catalog_item_id_str in catalog_items:
            catalog_item = catalog_items[catalog_item_id_str]
            category = categories.get(str(catalog_item.category_id))
            if category and category.slug in SPECS_MODELS_MAPPING:
                if category.slug not in category_to_gear_ids:
                    category_to_gear_ids[category.slug] = set()
                try:
                    gear_id_uuid = uuid.UUID(catalog_item_id_str)
                    category_to_gear_ids[category.slug].add(gear_id_uuid)
                except (ValueError, TypeError):
                    pass

    # Batch fetch all specs by category (one query per category, not per item)
    specs_cache = {}
    for category_slug, gear_ids_set in category_to_gear_ids.items():
        spec_model = SPECS_MODELS_MAPPING[category_slug]
        gear_ids = list(gear_ids_set)
        if gear_ids:
            specs_stmt = select(spec_model).where(spec_model.gear_id.in_(gear_ids))
            specs_results = db.execute(specs_stmt).scalars().all()
            if category_slug not in specs_cache:
                specs_cache[category_slug] = {}
            for spec in specs_results:
                specs_cache[category_slug][str(spec.gear_id)] = spec

    # Build result list with cached data
    for item in items:
        display_category = item.category
        if display_category in categories:
            display_category = categories[display_category].name

        display_name = item.name or (
            item.custom_name if item.custom_name else "New Equipment"
        )
        catalog_item_id_str = (
            str(item.catalog_item_id) if item.catalog_item_id else None
        )
        if not catalog_item_id_str:
            try:
                catalog_item_id_str = str(uuid.UUID(str(item.name)))
            except (ValueError, TypeError):
                catalog_item_id_str = None

        if catalog_item_id_str and catalog_item_id_str in catalog_items:
            display_name = catalog_items[catalog_item_id_str].name
        elif display_category:
            try:
                uuid.UUID(display_category)
            except (ValueError, TypeError):
                display_name = display_category

        # Build specs from cache
        specs = {}
        catalog_item_id_str = (
            str(item.catalog_item_id) if item.catalog_item_id else None
        )
        if not catalog_item_id_str:
            try:
                catalog_item_id_str = str(uuid.UUID(str(item.name)))
            except (ValueError, TypeError):
                catalog_item_id_str = None
        if catalog_item_id_str and catalog_item_id_str in catalog_items:
            catalog_item = catalog_items[catalog_item_id_str]
            category = categories.get(str(catalog_item.category_id))
            if category and category.slug in specs_cache:
                spec_result = specs_cache[category.slug].get(catalog_item_id_str)
                if spec_result:
                    specs = {
                        to_camel_case(c.name): getattr(spec_result, c.name)
                        for c in spec_result.__table__.columns
                        if c.name != "gear_id"
                    }

        item_dict = {
            "id": item.id,
            "name": display_name,
            "catalogItemId": item.catalog_item_id,
            "customName": item.custom_name,
            "serialNumber": item.serial_number,
            "category": display_category,
            "pricePerDay": item.price_per_day,
            "rentalPrice": item.rental_price,
            "rentalFrequency": item.rental_frequency,
            "quantity": item.quantity,
            "isOwned": bool(item.is_owned) if item.is_owned is not None else True,
            "status": item.status,
            "specs": specs,
            "brandName": None,
            "modelName": None,
        }

        if catalog_item_id_str and catalog_item_id_str in catalog_items:
            cat_item = catalog_items[catalog_item_id_str]
            item_dict["modelName"] = cat_item.name
            if str(cat_item.brand_id) in brands:
                item_dict["brandName"] = brands[str(cat_item.brand_id)].name

        result.append(item_dict)

    elapsed = time.time() - start_time
    if elapsed > 0.1:  # Only log if it takes more than 100ms
        print(
            f"[INVENTORY] batch_enrich_equipment: {len(items)} items, {len(category_to_gear_ids)} categories, {elapsed:.3f}s"
        )

    return result


@router.get("")
def read_inventory(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Get inventory with batch enrichment."""
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        inventory = mock_db.list_inventory()
        converted_inventory = [map_equipment_to_response(item) for item in inventory]
        return converted_inventory[skip : skip + limit]

    total_start = time.time()

    # SQLAlchemy 2.0: Fetch equipment belonging to the current user
    query_start = time.time()
    stmt = (
        select(models.Equipment)
        .where(models.Equipment.user_id == current_user["uid"])
        .offset(skip)
        .limit(limit)
    )
    inventory = db.execute(stmt).scalars().all()
    query_time = time.time() - query_start

    # Use batch enrichment instead of N+1 queries
    enrich_start = time.time()
    result = batch_enrich_equipment(db, inventory)
    enrich_time = time.time() - enrich_start

    total_time = time.time() - total_start
    print(
        f"[INVENTORY] Total: {total_time:.3f}s | Query: {query_time:.3f}s | Enrich: {enrich_time:.3f}s | Items: {len(inventory)}"
    )

    return result


@router.post("")
def create_equipment(
    equipment: schemas.EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Create new equipment."""
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        item_data = {
            "id": equipment.id,
            "name": equipment.name,
            "category": equipment.category,
            "price_per_day": equipment.price_per_day,
            "rental_price": equipment.rental_price,
            "rental_frequency": equipment.rental_frequency,
            "quantity": equipment.quantity,
            "is_owned": equipment.is_owned,
            "serial_number": equipment.serial_number,
            "status": equipment.status or "available",
            "catalog_item_id": equipment.catalog_item_id,
            "custom_name": equipment.custom_name,
            "brand": equipment.brand_name,
            "model": equipment.model_name,
        }
        new_item = mock_db.create_inventory_item(item_data)
        return map_equipment_to_response(new_item)

    start_time = time.time()

    # Manually map CamelCase from Schema to SnakeCase for Model
    catalog_item_id = equipment.catalog_item_id
    db_equipment = models.Equipment(
        id=equipment.id,
        user_id=current_user["uid"],
        name=equipment.name,
        catalog_item_id=catalog_item_id,
        custom_name=equipment.custom_name,
        serial_number=equipment.serial_number,
        category=equipment.category,
        price_per_day=equipment.price_per_day,
        rental_price=equipment.rental_price,
        rental_frequency=equipment.rental_frequency,
        quantity=equipment.quantity,
        is_owned=equipment.is_owned,
        status=equipment.status,
    )
    db.add(db_equipment)

    commit_start = time.time()
    try:
        db.commit()
        db.refresh(db_equipment)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    commit_time = time.time() - commit_start

    # Use lightweight enrichment for single item (faster than batch)
    enrich_start = time.time()
    result = enrich_single_equipment(db, db_equipment)
    enrich_time = time.time() - enrich_start

    total_time = time.time() - start_time
    print(
        f"[INVENTORY POST] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s | Enrich: {enrich_time:.3f}s"
    )

    return result


@router.patch("/{equipment_id}")
def update_equipment(
    equipment_id: str,
    equipment_update: schemas.EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Update equipment."""
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        update_data = {
            "name": equipment_update.name,
            "category": equipment_update.category,
            "serial_number": equipment_update.serial_number,
            "status": equipment_update.status,
        }
        update_data = {k: v for k, v in update_data.items() if v is not None}
        updated_item = mock_db.update_inventory_item(equipment_id, update_data)
        if not updated_item:
            raise HTTPException(status_code=404, detail="Equipment not found")
        return updated_item

    # SQLAlchemy 2.0
    stmt = select(models.Equipment).where(
        models.Equipment.id == equipment_id,
        models.Equipment.user_id == current_user["uid"],
    )
    result = db.execute(stmt)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    item.name = equipment_update.name
    item.catalog_item_id = equipment_update.catalog_item_id
    item.custom_name = equipment_update.custom_name
    item.serial_number = equipment_update.serial_number
    item.category = equipment_update.category
    item.price_per_day = equipment_update.price_per_day
    item.rental_price = equipment_update.rental_price
    item.rental_frequency = equipment_update.rental_frequency
    item.quantity = equipment_update.quantity
    item.is_owned = equipment_update.is_owned
    item.status = equipment_update.status

    db.commit()
    db.refresh(item)

    # Use lightweight enrichment for single item
    return enrich_single_equipment(db, item)


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Delete equipment."""
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        deleted = mock_db.delete_inventory_item(equipment_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Equipment not found")
        return None

    # SQLAlchemy 2.0
    stmt = select(models.Equipment).where(
        models.Equipment.id == equipment_id,
        models.Equipment.user_id == current_user["uid"],
    )
    result = db.execute(stmt)
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    db.delete(item)
    db.commit()
    return None
