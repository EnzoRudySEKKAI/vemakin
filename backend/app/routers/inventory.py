from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, cast, String, and_
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import joinedload
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db
from ..cache import cache, get_cache_key
from ..cache.catalog_cache import catalog_cache
import uuid
import time

router = APIRouter(prefix="/inventory", tags=["inventory"])


def to_camel_case(snake_str: str) -> str:
    components = snake_str.split("_")
    return components[0] + "".join(x.title() for x in components[1:])


def enrich_single_equipment(item: models.Equipment) -> dict:
    """Lightweight enrichment for single items using catalog cache (zero DB queries)."""
    display_category = item.category
    display_name = item.name or item.custom_name or "New Equipment"
    specs = {}
    brand_name = None
    model_name = None
    catalog_item_id = None

    # Try to get catalog item ID from various sources
    if item.catalog_item_id:
        catalog_item_id = item.catalog_item_id
    else:
        try:
            catalog_item_id = uuid.UUID(str(item.name))
        except (ValueError, TypeError):
            pass

    catalog_item = None

    # Use catalog cache if available (zero DB queries!)
    if catalog_item_id and catalog_cache.is_loaded():
        try:
            catalog_item = catalog_cache.get_item(catalog_item_id)
        except Exception:
            pass

    # If catalog item not found by ID, try searching by custom_name
    if not catalog_item and item.custom_name and catalog_cache.is_loaded():
        try:
            catalog_item = catalog_cache.find_item_by_name(item.custom_name)
            if catalog_item:
                catalog_item_id = catalog_item.get("id")
        except Exception:
            pass

    # Enrich from catalog item if found
    if catalog_item:
        display_name = catalog_item.get("name", display_name)
        model_name = catalog_item.get("name")

        # Get category name from cache
        category_id = catalog_item.get("category_id")
        if category_id:
            for cat in catalog_cache.get_categories():
                if str(cat.id) == category_id:
                    display_category = cat.name
                    break

        # Get brand name from cache
        brand_id = catalog_item.get("brand_id")
        if brand_id:
            for cat in catalog_cache.get_categories():
                for brand in catalog_cache.get_brands_for_category(cat.id):
                    if str(brand.id) == brand_id:
                        brand_name = brand.name
                        break
                if brand_name:
                    break

        # Get specs from cache
        if catalog_item_id:
            try:
                specs = catalog_cache.get_specs(catalog_item_id)
            except Exception:
                pass

    # Always try to resolve category UUID to name, even if no catalog item found
    if item.category and catalog_cache.is_loaded():
        try:
            cat_uuid = uuid.UUID(item.category)
            for cat in catalog_cache.get_categories():
                if str(cat.id) == str(cat_uuid):
                    display_category = cat.name
                    break
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
        "brandName": brand_name,
        "modelName": model_name,
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


def batch_enrich_equipment_optimized(items: List[models.Equipment]) -> List[dict]:
    """Optimized batch enrichment using pre-warmed catalog cache (zero DB queries)."""
    start_time = time.time()

    if not items:
        return []

    result = []
    cache_loaded = catalog_cache.is_loaded()

    # Build lookup dicts from cache for O(1) access
    categories_dict = {}
    brands_dict = {}

    if cache_loaded:
        # Build categories lookup
        for cat in catalog_cache.get_categories():
            categories_dict[str(cat.id)] = cat

        # Build brands lookup
        for cat in catalog_cache.get_categories():
            for brand in catalog_cache.get_brands_for_category(cat.id):
                brands_dict[str(brand.id)] = brand

    for item in items:
        display_category = item.category
        display_name = item.name or item.custom_name or "New Equipment"
        specs = {}
        brand_name = None
        model_name = None
        catalog_item_id_str = None

        # Try to get catalog item ID from various sources
        if item.catalog_item_id:
            catalog_item_id_str = str(item.catalog_item_id)
        else:
            try:
                name_uuid = uuid.UUID(str(item.name))
                catalog_item_id_str = str(name_uuid)
            except (ValueError, TypeError):
                pass

        catalog_item = None

        # Use catalog cache to enrich (zero DB queries!)
        if catalog_item_id_str and cache_loaded:
            try:
                catalog_item = catalog_cache.get_item(uuid.UUID(catalog_item_id_str))
            except Exception:
                pass

        # If catalog item not found by ID, try searching by custom_name
        if not catalog_item and item.custom_name and cache_loaded:
            try:
                catalog_item = catalog_cache.find_item_by_name(item.custom_name)
                if catalog_item:
                    catalog_item_id_str = catalog_item.get("id")
            except Exception:
                pass

        # Enrich from catalog item if found
        if catalog_item:
            display_name = catalog_item.get("name", display_name)
            model_name = catalog_item.get("name")

            # Get category name from cache
            category_id = catalog_item.get("category_id")
            if category_id and category_id in categories_dict:
                display_category = categories_dict[category_id].name

            # Get brand name from cache
            brand_id = catalog_item.get("brand_id")
            if brand_id and brand_id in brands_dict:
                brand_name = brands_dict[brand_id].name

            # Get specs from cache
            if catalog_item_id_str:
                try:
                    specs = catalog_cache.get_specs(uuid.UUID(catalog_item_id_str))
                except Exception:
                    pass

        # Always try to resolve category UUID to name, even if no catalog item found
        if item.category and cache_loaded:
            try:
                cat_uuid = str(uuid.UUID(item.category))
                if cat_uuid in categories_dict:
                    display_category = categories_dict[cat_uuid].name
            except (ValueError, TypeError):
                pass

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
            "brandName": brand_name,
            "modelName": model_name,
        }

        result.append(item_dict)

    elapsed = time.time() - start_time
    if elapsed > 0.01:  # Only log if it takes more than 10ms
        print(
            f"[INVENTORY] batch_enrich_equipment_optimized: {len(items)} items, {elapsed:.3f}s (cache: {cache_loaded})"
        )

    return result


def invalidate_inventory_cache(user_id: str) -> None:
    """Invalidate inventory cache for a user."""
    cache_key = get_cache_key("inventory", user_id)
    cache.delete(cache_key)
    print(f"[CACHE] Invalidated inventory cache for user {user_id}")


@router.get("")
async def read_inventory(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Get inventory with single JOIN query - fast and cost efficient."""
    start_time = time.time()

    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        inventory = mock_db.list_inventory()
        converted_inventory = [map_equipment_to_response(item) for item in inventory]
        return converted_inventory[skip : skip + limit]

    user_id = current_user["uid"]

    # Single optimized query with JOINs to get all data at once
    # JOINs: user_inventory -> gear_catalog -> brands + categories
    query_start = time.time()
    stmt = (
        select(
            models.Equipment,
            models.GearCatalog.name.label("model_name"),
            models.Brand.name.label("brand_name"),
            models.Category.name.label("category_name"),
        )
        .outerjoin(
            models.GearCatalog,
            models.Equipment.catalog_item_id == models.GearCatalog.id,
        )
        .outerjoin(models.Brand, models.GearCatalog.brand_id == models.Brand.id)
        .outerjoin(
            models.Category, models.GearCatalog.category_id == models.Category.id
        )
        .where(cast(models.Equipment.user_id, String) == user_id)
        .offset(skip)
        .limit(limit)
    )

    result = await db.execute(stmt)
    rows = result.all()
    query_time = time.time() - query_start

    # Transform results - no additional DB queries needed
    result_data = []
    for row in rows:
        equipment = row[0]
        model_name = row[1]
        brand_name = row[2]
        category_name = row[3]

        # Use custom name if available, otherwise model name, otherwise equipment name
        display_name = (
            equipment.custom_name or model_name or equipment.name or "New Equipment"
        )

        # Use category name from join if available, otherwise equipment.category (might be UUID or string)
        display_category = category_name or equipment.category or "Other"

        item_dict = {
            "id": equipment.id,
            "name": display_name,
            "catalogItemId": equipment.catalog_item_id,
            "customName": equipment.custom_name,
            "serialNumber": equipment.serial_number,
            "category": display_category,
            "pricePerDay": equipment.price_per_day,
            "rentalPrice": equipment.rental_price,
            "rentalFrequency": equipment.rental_frequency,
            "quantity": equipment.quantity,
            "isOwned": bool(equipment.is_owned)
            if equipment.is_owned is not None
            else True,
            "status": equipment.status,
            "brandName": brand_name,
            "modelName": model_name,
            # Specs not included in list view - fetched separately for details
        }
        result_data.append(item_dict)

    total_time = time.time() - start_time
    print(
        f"[INVENTORY] Total: {total_time:.3f}s | Query: {query_time:.3f}s | Items: {len(result_data)}"
    )

    return result_data


@router.get("/{equipment_id}")
async def read_equipment_detail(
    equipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Get single equipment with full details including specs."""
    start_time = time.time()

    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        item = mock_db.get_inventory_item(equipment_id)
        if not item:
            raise HTTPException(status_code=404, detail="Equipment not found")
        return map_equipment_to_response(item)

    user_id = current_user["uid"]

    # Single query with JOINs for equipment + brand/model/category
    stmt = (
        select(
            models.Equipment,
            models.GearCatalog.name.label("model_name"),
            models.Brand.name.label("brand_name"),
            models.Category.name.label("category_name"),
        )
        .outerjoin(
            models.GearCatalog,
            models.Equipment.catalog_item_id == models.GearCatalog.id,
        )
        .outerjoin(models.Brand, models.GearCatalog.brand_id == models.Brand.id)
        .outerjoin(
            models.Category, models.GearCatalog.category_id == models.Category.id
        )
        .where(
            and_(
                cast(models.Equipment.id, String) == equipment_id,
                cast(models.Equipment.user_id, String) == user_id,
            )
        )
    )

    result = await db.execute(stmt)
    row = result.first()

    if not row:
        raise HTTPException(status_code=404, detail="Equipment not found")

    equipment = row[0]
    model_name = row[1]
    brand_name = row[2]
    category_name = row[3]

    # Get specs - try cache first, then database
    specs = {}
    catalog_item_id = equipment.catalog_item_id
    if catalog_item_id:
        try:
            catalog_id_str = str(catalog_item_id)

            # First try cache for fast lookup
            if catalog_cache.is_loaded():
                cached_specs = catalog_cache.get_specs(uuid.UUID(catalog_id_str))
                if cached_specs:
                    specs = cached_specs

            # If no specs from cache, query database directly
            if not specs:
                # Determine which specs table to query based on category
                category_slug = None
                if category_name:
                    if catalog_cache.is_loaded():
                        # Find category slug from cache
                        for cat in catalog_cache.get_categories():
                            if cat.name == category_name:
                                category_slug = cat.slug
                                break
                    else:
                        # Query database for category slug
                        cat_result = await db.execute(
                            select(models.Category).where(
                                models.Category.name == category_name
                            )
                        )
                        cat_row = cat_result.scalar_one_or_none()
                        if cat_row:
                            category_slug = cat_row.slug

                if category_slug:
                    specs_model = None
                    if category_slug == "camera":
                        specs_model = models.CameraSpecs
                    elif category_slug == "lens":
                        specs_model = models.LensSpecs
                    elif category_slug == "audio":
                        specs_model = models.AudioSpecs
                    elif category_slug == "light":
                        specs_model = models.LightSpecs
                    elif category_slug == "monitor":
                        specs_model = models.MonitorSpecs
                    elif category_slug == "prop":
                        specs_model = models.PropSpecs
                    elif category_slug == "stabilizer":
                        specs_model = models.StabilizerSpecs
                    elif category_slug == "tripod":
                        specs_model = models.TripodSpecs
                    elif category_slug == "wireless":
                        specs_model = models.WirelessSpecs
                    elif category_slug == "drone":
                        specs_model = models.DroneSpecs
                    elif category_slug == "filter":
                        specs_model = models.FilterSpecs
                    elif category_slug == "grip":
                        specs_model = models.GripSpecs

                    if specs_model:
                        specs_result = await db.execute(
                            select(specs_model).where(
                                cast(specs_model.gear_id, String) == catalog_id_str
                            )
                        )
                        specs_row = specs_result.scalar_one_or_none()
                        if specs_row:
                            # Convert specs to dict, excluding gear_id
                            specs = {
                                col.name: getattr(specs_row, col.name)
                                for col in specs_row.__table__.columns
                                if col.name != "gear_id"
                                and getattr(specs_row, col.name) is not None
                            }
                            # Convert snake_case to camelCase
                            specs = {to_camel_case(k): v for k, v in specs.items()}
        except Exception:
            pass

    display_name = (
        equipment.custom_name or model_name or equipment.name or "New Equipment"
    )
    display_category = category_name or equipment.category or "Other"

    elapsed = time.time() - start_time
    print(f"[INVENTORY DETAIL] Equipment {equipment_id} fetched in {elapsed:.3f}s")

    return {
        "id": equipment.id,
        "name": display_name,
        "catalogItemId": equipment.catalog_item_id,
        "customName": equipment.custom_name,
        "serialNumber": equipment.serial_number,
        "category": display_category,
        "pricePerDay": equipment.price_per_day,
        "rentalPrice": equipment.rental_price,
        "rentalFrequency": equipment.rental_frequency,
        "quantity": equipment.quantity,
        "isOwned": bool(equipment.is_owned) if equipment.is_owned is not None else True,
        "status": equipment.status,
        "brandName": brand_name,
        "modelName": model_name,
        "specs": specs,
    }


@router.post("")
async def create_equipment(
    equipment: schemas.EquipmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Create new equipment with optimized async operations."""
    start_time = time.time()

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

    # Use RETURNING clause for optimized insert
    # Note: user_id is a Firebase UID string, not a UUID
    insert_stmt = (
        insert(models.Equipment)
        .values(
            id=cast(equipment.id, UUID),
            user_id=current_user["uid"],  # Firebase UID - keep as string
            name=equipment.name,
            catalog_item_id=cast(equipment.catalog_item_id, UUID)
            if equipment.catalog_item_id
            else None,
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
        .returning(models.Equipment)
    )

    commit_start = time.time()
    result = await db.execute(insert_stmt)
    await db.commit()
    commit_time = time.time() - commit_start

    db_equipment = result.scalar()

    # Use cache-based enrichment
    result_data = enrich_single_equipment(db_equipment)

    # Invalidate cache after successful creation
    invalidate_inventory_cache(current_user["uid"])

    total_time = time.time() - start_time
    print(f"[INVENTORY POST] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return result_data


@router.patch("/{equipment_id}")
async def update_equipment(
    equipment_id: str,
    equipment_update: schemas.EquipmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Update equipment and invalidate cache."""
    start_time = time.time()

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
    # Cast UUID columns to String for proper comparison with asyncpg
    result = await db.execute(
        select(models.Equipment).where(
            cast(models.Equipment.id, String) == equipment_id,
            cast(models.Equipment.user_id, String) == current_user["uid"],
        )
    )
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

    commit_start = time.time()
    await db.commit()
    commit_time = time.time() - commit_start

    # Use lightweight enrichment for single item
    result_data = enrich_single_equipment(item)

    # Invalidate cache after successful update
    invalidate_inventory_cache(current_user["uid"])

    total_time = time.time() - start_time
    print(f"[INVENTORY PATCH] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return result_data


@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(
    equipment_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Delete equipment and invalidate cache."""
    start_time = time.time()

    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        deleted = mock_db.delete_inventory_item(equipment_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Equipment not found")
        return None

    # SQLAlchemy 2.0
    # Cast UUID columns to String for proper comparison with asyncpg
    result = await db.execute(
        select(models.Equipment).where(
            cast(models.Equipment.id, String) == equipment_id,
            cast(models.Equipment.user_id, String) == current_user["uid"],
        )
    )
    item = result.scalar_one_or_none()

    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    await db.delete(item)

    commit_start = time.time()
    await db.commit()
    commit_time = time.time() - commit_start

    # Invalidate cache after successful deletion
    invalidate_inventory_cache(current_user["uid"])

    total_time = time.time() - start_time
    print(f"[INVENTORY DELETE] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return None
