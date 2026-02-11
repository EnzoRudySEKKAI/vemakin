from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, insert, cast, String
from sqlalchemy.dialects.postgresql import UUID
from typing import List
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

    # Use catalog cache if available (zero DB queries!)
    if catalog_item_id and catalog_cache.is_loaded():
        try:
            catalog_item = catalog_cache.get_item(catalog_item_id)
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
                specs = catalog_cache.get_specs(catalog_item_id)
        except Exception:
            pass

    elif item.category and catalog_cache.is_loaded():
        # Try to resolve category UUID to name
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

        # Use catalog cache to enrich (zero DB queries!)
        if catalog_item_id_str and cache_loaded:
            try:
                catalog_item = catalog_cache.get_item(uuid.UUID(catalog_item_id_str))
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
                    specs = catalog_cache.get_specs(uuid.UUID(catalog_item_id_str))
            except Exception:
                pass

        elif item.category and cache_loaded:
            # Try to resolve category UUID to name
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
    """Get inventory with caching and catalog cache enrichment."""
    start_time = time.time()

    # Check if guest mode - skip caching for guests
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        inventory = mock_db.list_inventory()
        converted_inventory = [map_equipment_to_response(item) for item in inventory]
        return converted_inventory[skip : skip + limit]

    user_id = current_user["uid"]
    cache_key = get_cache_key("inventory", user_id)

    # Try to get from cache first
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        print(f"[CACHE] Hit for inventory user {user_id}")
        return cached_result[skip : skip + limit]

    print(f"[CACHE] Miss for inventory user {user_id}")

    # Single DB query: Fetch equipment belonging to the current user
    # Cast UUID columns to String for proper comparison with asyncpg
    query_start = time.time()
    stmt = (
        select(models.Equipment)
        .where(cast(models.Equipment.user_id, String) == user_id)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    inventory = result.scalars().all()
    query_time = time.time() - query_start

    # Enrich using catalog cache (zero DB queries!)
    enrich_start = time.time()
    result_data = batch_enrich_equipment_optimized(inventory)
    enrich_time = time.time() - enrich_start

    # Cache the result
    cache.set(cache_key, result_data, ttl_seconds=300)

    total_time = time.time() - start_time
    print(
        f"[INVENTORY] Total: {total_time:.3f}s | Query: {query_time:.3f}s | Enrich: {enrich_time:.3f}s | Items: {len(inventory)}"
    )

    return result_data


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

    # Use RETURNING clause for optimized insert with proper UUID casting (cast strings to UUID for inserts)
    insert_stmt = (
        insert(models.Equipment)
        .values(
            id=cast(equipment.id, UUID),
            user_id=cast(current_user["uid"], UUID),
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
