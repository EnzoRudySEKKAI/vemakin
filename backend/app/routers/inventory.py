from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user
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
            category = (
                db.query(models.Category).filter(models.Category.id == cat_uuid).first()
            )
            if category:
                display_category = category.name
        except (ValueError, TypeError):
            pass

    # Try to get catalog item name if name is a UUID
    try:
        name_as_uuid = uuid.UUID(display_name)
        if item.catalog_item_id:
            catalog_item = (
                db.query(models.GearCatalog)
                .filter(models.GearCatalog.id == item.catalog_item_id)
                .first()
            )
            if catalog_item:
                display_name = catalog_item.name
                # Get specs for this item
                category = (
                    db.query(models.Category)
                    .filter(models.Category.id == catalog_item.category_id)
                    .first()
                )
                if category and category.slug in SPECS_MODELS_MAPPING:
                    spec_model = SPECS_MODELS_MAPPING[category.slug]
                    spec_result = (
                        db.query(spec_model)
                        .filter(spec_model.gear_id == item.catalog_item_id)
                        .first()
                    )
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
    except (ValueError, TypeError):
        pass

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
    }


def batch_enrich_equipment(db: Session, items: List[models.Equipment]) -> List[dict]:
    """Optimized batch enrichment - fetch all related data in bulk instead of N+1 queries"""
    if not items:
        return []

    start_time = time.time()

    # Collect all category IDs and catalog item IDs
    category_ids = set()
    catalog_item_ids = set()

    for item in items:
        if item.category:
            try:
                category_ids.add(uuid.UUID(item.category))
            except (ValueError, TypeError):
                pass
        if item.catalog_item_id:
            catalog_item_ids.add(item.catalog_item_id)

    # Bulk fetch categories (single query)
    categories = {}
    if category_ids:
        cat_results = (
            db.query(models.Category).filter(models.Category.id.in_(category_ids)).all()
        )
        categories = {str(c.id): c for c in cat_results}

    # Bulk fetch catalog items (single query)
    catalog_items = {}
    if catalog_item_ids:
        cat_item_results = (
            db.query(models.GearCatalog)
            .filter(models.GearCatalog.id.in_(catalog_item_ids))
            .all()
        )
        catalog_items = {str(c.id): c for c in cat_item_results}

    # OPTIMIZED: Group gear_ids by category slug BEFORE fetching specs
    # This avoids the nested loop O(n * c) complexity
    category_to_gear_ids = {}

    for item in items:
        catalog_item_id_str = (
            str(item.catalog_item_id) if item.catalog_item_id else None
        )
        if catalog_item_id_str and catalog_item_id_str in catalog_items:
            catalog_item = catalog_items[catalog_item_id_str]
            category = categories.get(str(catalog_item.category_id))
            if category and category.slug in SPECS_MODELS_MAPPING:
                if category.slug not in category_to_gear_ids:
                    category_to_gear_ids[category.slug] = set()
                category_to_gear_ids[category.slug].add(item.catalog_item_id)

    # Fetch specs ONCE per category (no nested loops)
    specs_cache = {}
    for category_slug, gear_ids_set in category_to_gear_ids.items():
        spec_model = SPECS_MODELS_MAPPING[category_slug]
        gear_ids = list(gear_ids_set)
        if gear_ids:
            specs_results = (
                db.query(spec_model).filter(spec_model.gear_id.in_(gear_ids)).all()
            )
            specs_cache[category_slug] = {str(s.gear_id): s for s in specs_results}

    # Process all items using cached data (no additional queries)
    result = []
    for item in items:
        # Default display values
        display_category = item.category
        display_name = item.name or (
            item.custom_name if item.custom_name else "New Equipment"
        )

        # Try to get the category name if category is a UUID
        if item.category and item.category in categories:
            display_category = categories[item.category].name

        # If item.name is a UUID, try to replace it with catalog item name
        try:
            name_as_uuid = uuid.UUID(display_name)
            catalog_item_id_str = (
                str(item.catalog_item_id) if item.catalog_item_id else None
            )
            if catalog_item_id_str and catalog_item_id_str in catalog_items:
                display_name = catalog_items[catalog_item_id_str].name
            elif display_category:
                try:
                    uuid.UUID(display_category)
                except (ValueError, TypeError):
                    display_name = display_category
        except (ValueError, TypeError):
            pass

        # Build specs from cache
        specs = {}
        catalog_item_id_str = (
            str(item.catalog_item_id) if item.catalog_item_id else None
        )
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
        }
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
    current_user: dict = Depends(get_current_user),
):
    total_start = time.time()

    # Fetch equipment belonging to the current user
    query_start = time.time()
    inventory = (
        db.query(models.Equipment)
        .filter(models.Equipment.user_id == current_user["uid"])
        .offset(skip)
        .limit(limit)
        .all()
    )
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
    current_user: dict = Depends(get_current_user),
):
    start_time = time.time()

    # Manually map CamelCase from Schema to SnakeCase for Model
    db_equipment = models.Equipment(
        id=equipment.id,
        user_id=current_user["uid"],
        name=equipment.name,
        catalog_item_id=equipment.catalogItemId,
        custom_name=equipment.customName,
        serial_number=equipment.serialNumber,
        category=equipment.category,
        price_per_day=equipment.pricePerDay,
        rental_price=equipment.rentalPrice,
        rental_frequency=equipment.rentalFrequency,
        quantity=equipment.quantity,
        is_owned=equipment.isOwned,
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
    current_user: dict = Depends(get_current_user),
):
    item = (
        db.query(models.Equipment)
        .filter(
            models.Equipment.id == equipment_id,
            models.Equipment.user_id == current_user["uid"],
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    item.name = equipment_update.name
    item.catalog_item_id = equipment_update.catalogItemId
    item.custom_name = equipment_update.customName
    item.serial_number = equipment_update.serialNumber
    item.category = equipment_update.category
    item.price_per_day = equipment_update.pricePerDay
    item.rental_price = equipment_update.rentalPrice
    item.rental_frequency = equipment_update.rentalFrequency
    item.quantity = equipment_update.quantity
    item.is_owned = equipment_update.isOwned
    item.status = equipment_update.status

    db.commit()
    db.refresh(item)

    # Use lightweight enrichment for single item
    return enrich_single_equipment(db, item)


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    item = (
        db.query(models.Equipment)
        .filter(
            models.Equipment.id == equipment_id,
            models.Equipment.user_id == current_user["uid"],
        )
        .first()
    )

    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    db.delete(item)
    db.commit()
    return None
