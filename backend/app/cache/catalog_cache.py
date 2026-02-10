"""
Catalog Cache Manager with JSON Persistence

Provides in-memory caching for catalog data to eliminate database queries.
Cache is persisted to JSON file and refreshed every 24 hours.

Usage:
    from ..cache.catalog_cache import catalog_cache

    # In endpoints
    categories = catalog_cache.get_categories()
    brands = catalog_cache.get_brands_for_category(category_id)
    items = catalog_cache.get_items(category_id, brand_id)
    item = catalog_cache.get_item(item_id)
    specs = catalog_cache.get_specs(gear_id)
"""

import json
import os
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from threading import Lock
import uuid
import logging
from sqlalchemy.orm import Session
from sqlalchemy import func

from ..models import models

logger = logging.getLogger(__name__)

# Default cache file location
DEFAULT_CACHE_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "data",
    "catalog_cache.json",
)

# Cache TTL in hours
CACHE_TTL_HOURS = 24


class CatalogCache:
    """
    Thread-safe singleton cache for catalog data with JSON persistence.

    Cache Structure:
    {
        "categories": List[Category],
        "brands_by_category": Dict[category_id, List[Brand]],
        "items_by_id": Dict[item_id, GearCatalog],
        "items_by_category_brand": Dict[(category_id, brand_id), List[Item]],
        "all_items": List[GearCatalog],
        "specs_by_gear_id": Dict[gear_id, dict],
        "last_updated": datetime,
        "is_loaded": bool
    }
    """

    _instance = None
    _lock = Lock()

    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return

        self._data_lock = Lock()
        self._data = {
            "categories": [],
            "brands_by_category": {},
            "items_by_id": {},
            "items_by_category_brand": {},
            "all_items": [],
            "specs_by_gear_id": {},
            "last_updated": None,
            "is_loaded": False,
        }
        self._cache_file = os.environ.get("CATALOG_CACHE_FILE", DEFAULT_CACHE_FILE)
        self._initialized = True

    def _to_camel_case(self, snake_str: str) -> str:
        """Convert snake_case to camelCase."""
        components = snake_str.split("_")
        return components[0] + "".join(x.title() for x in components[1:])

    def _ensure_cache_dir(self):
        """Ensure the cache directory exists."""
        cache_dir = os.path.dirname(self._cache_file)
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir, exist_ok=True)

    def _serialize_datetime(self, dt):
        """Serialize datetime to ISO format string."""
        if dt is None:
            return None
        return dt.isoformat()

    def _deserialize_datetime(self, dt_str):
        """Deserialize ISO format string to datetime."""
        if dt_str is None:
            return None
        return datetime.fromisoformat(dt_str)

    def _category_to_dict(self, category: models.Category) -> dict:
        """Convert Category model to dictionary."""
        return {
            "id": str(category.id),
            "name": category.name,
            "slug": category.slug,
        }

    def _category_from_dict(self, data: dict) -> models.Category:
        """Create Category model from dictionary."""
        category = models.Category()
        category.id = uuid.UUID(data["id"])
        category.name = data["name"]
        category.slug = data["slug"]
        return category

    def _brand_to_dict(self, brand: models.Brand) -> dict:
        """Convert Brand model to dictionary."""
        return {
            "id": str(brand.id),
            "name": brand.name,
        }

    def _brand_from_dict(self, data: dict) -> models.Brand:
        """Create Brand model from dictionary."""
        brand = models.Brand()
        brand.id = uuid.UUID(data["id"])
        brand.name = data["name"]
        return brand

    def _save_to_json(self) -> bool:
        """
        Save current cache data to JSON file.

        Returns:
            True if successful, False otherwise
        """
        try:
            self._ensure_cache_dir()

            with self._data_lock:
                # Convert data to serializable format
                data = {
                    "categories": [
                        self._category_to_dict(c) for c in self._data["categories"]
                    ],
                    "brands_by_category": {
                        cat_id: [self._brand_to_dict(b) for b in brands]
                        for cat_id, brands in self._data["brands_by_category"].items()
                    },
                    "items_by_id": self._data["items_by_id"],
                    "items_by_category_brand": {
                        f"{k[0]}|{k[1]}": v
                        for k, v in self._data["items_by_category_brand"].items()
                    },
                    "all_items": self._data["all_items"],
                    "specs_by_gear_id": self._data["specs_by_gear_id"],
                    "last_updated": self._serialize_datetime(
                        self._data["last_updated"]
                    ),
                    "is_loaded": self._data["is_loaded"],
                    "version": 1,  # For future migrations
                }

            with open(self._cache_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, default=str)

            logger.info(f"[CATALOG CACHE] Saved to {self._cache_file}")
            return True

        except Exception as e:
            logger.error(f"[CATALOG CACHE] Failed to save to JSON: {e}")
            return False

    def load_from_json(self) -> bool:
        """
        Load cache data from JSON file if it exists and is fresh.

        Returns:
            True if loaded successfully, False otherwise
        """
        try:
            if not os.path.exists(self._cache_file):
                logger.info("[CATALOG CACHE] No cache file found")
                return False

            with open(self._cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)

            # Check if cache is fresh (< 24 hours old)
            last_updated = self._deserialize_datetime(data.get("last_updated"))
            if last_updated is None:
                logger.info("[CATALOG CACHE] Cache file has no timestamp")
                return False

            age = datetime.now() - last_updated
            if age > timedelta(hours=CACHE_TTL_HOURS):
                logger.info(
                    f"[CATALOG CACHE] Cache is stale ({age.total_seconds() / 3600:.1f} hours old)"
                )
                return False

            # Deserialize data
            categories = [
                self._category_from_dict(c) for c in data.get("categories", [])
            ]
            brands_by_category = {
                cat_id: [self._brand_from_dict(b) for b in brands]
                for cat_id, brands in data.get("brands_by_category", {}).items()
            }
            items_by_id = data.get("items_by_id", {})
            items_by_category_brand = {
                tuple(k.split("|")): v
                for k, v in data.get("items_by_category_brand", {}).items()
            }
            all_items = data.get("all_items", [])
            specs_by_gear_id = data.get("specs_by_gear_id", {})

            # Atomic update
            with self._data_lock:
                self._data = {
                    "categories": categories,
                    "brands_by_category": brands_by_category,
                    "items_by_id": items_by_id,
                    "items_by_category_brand": items_by_category_brand,
                    "all_items": all_items,
                    "specs_by_gear_id": specs_by_gear_id,
                    "last_updated": last_updated,
                    "is_loaded": True,
                }

            logger.info(
                f"[CATALOG CACHE] Loaded from {self._cache_file} | "
                f"Categories: {len(categories)}, "
                f"Brands: {sum(len(b) for b in brands_by_category.values())}, "
                f"Items: {len(all_items)}, "
                f"Specs: {len(specs_by_gear_id)} | "
                f"Age: {age.total_seconds() / 60:.1f} minutes"
            )
            return True

        except Exception as e:
            logger.error(f"[CATALOG CACHE] Failed to load from JSON: {e}")
            return False

    def warm(self, db: Session, save_to_file: bool = True) -> None:
        """
        Warm up the cache by fetching all catalog data from database.
        This should be called once on app startup.

        Args:
            db: SQLAlchemy database session
            save_to_file: Whether to save cache to JSON file after warming
        """
        logger.info("[CATALOG CACHE] Starting cache warmup...")
        start_time = datetime.now()

        try:
            # Fetch all categories
            categories = db.query(models.Category).all()

            # Fetch all brands with their category associations
            brands_result = (
                db.query(models.Brand, models.GearCatalog.category_id)
                .join(models.GearCatalog)
                .distinct()
                .all()
            )

            # Build brands_by_category mapping
            brands_by_category: Dict[str, List[models.Brand]] = {}
            seen_brands_by_category: Dict[str, set] = {}

            for brand, category_id in brands_result:
                cat_id_str = str(category_id)
                if cat_id_str not in brands_by_category:
                    brands_by_category[cat_id_str] = []
                    seen_brands_by_category[cat_id_str] = set()

                if brand.id not in seen_brands_by_category[cat_id_str]:
                    brands_by_category[cat_id_str].append(brand)
                    seen_brands_by_category[cat_id_str].add(brand.id)

            # Fetch all gear catalog items
            all_items = db.query(models.GearCatalog).all()

            # Build items lookup structures
            items_by_id: Dict[str, dict] = {}
            items_by_category_brand: Dict[tuple, List[dict]] = {}

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

            for item in all_items:
                item_id_str = str(item.id)
                cat_id_str = str(item.category_id) if item.category_id else None
                brand_id_str = str(item.brand_id) if item.brand_id else None

                item_dict = {
                    "id": str(item.id),
                    "brand_id": str(item.brand_id) if item.brand_id else None,
                    "category_id": str(item.category_id) if item.category_id else None,
                    "name": item.name,
                    "description": item.description,
                    "image_url": item.image_url,
                    "created_at": item.created_at.isoformat()
                    if item.created_at
                    else None,
                    "specs": {},  # Will be populated separately
                }

                items_by_id[item_id_str] = item_dict

                # Index by category + brand
                if cat_id_str and brand_id_str:
                    key = (cat_id_str, brand_id_str)
                    if key not in items_by_category_brand:
                        items_by_category_brand[key] = []
                    items_by_category_brand[key].append(item_dict)

            # Fetch all specs in bulk
            specs_by_gear_id: Dict[str, dict] = {}

            # Get all category slugs mapping
            category_slugs = {str(c.id): c.slug for c in categories}

            # Fetch specs for each category type
            failed_specs_tables = []
            for category_slug, spec_model in SPECS_MODELS_MAPPING.items():
                try:
                    specs_results = db.query(spec_model).all()

                    for spec in specs_results:
                        spec_dict = {}
                        for c in spec.__table__.columns:
                            if c.name != "gear_id":
                                try:
                                    spec_dict[self._to_camel_case(c.name)] = getattr(
                                        spec, c.name
                                    )
                                except AttributeError:
                                    # Column exists in model but not in database
                                    spec_dict[self._to_camel_case(c.name)] = None
                        gear_id_str = str(spec.gear_id)
                        specs_by_gear_id[gear_id_str] = spec_dict

                        # Also attach specs to the item
                        if gear_id_str in items_by_id:
                            items_by_id[gear_id_str]["specs"] = spec_dict
                except Exception as e:
                    failed_specs_tables.append(category_slug)
                    logger.warning(
                        f"[CATALOG CACHE] Failed to load specs for {category_slug}: {e}"
                    )
                    continue

            # Build all_items list with enriched specs
            all_items_enriched = list(items_by_id.values())

            # Atomic update
            with self._data_lock:
                self._data = {
                    "categories": categories,
                    "brands_by_category": brands_by_category,
                    "items_by_id": items_by_id,
                    "items_by_category_brand": items_by_category_brand,
                    "all_items": all_items_enriched,
                    "specs_by_gear_id": specs_by_gear_id,
                    "last_updated": datetime.now(),
                    "is_loaded": True,
                }

            duration = (datetime.now() - start_time).total_seconds()
            logger.info(
                f"[CATALOG CACHE] Warmup complete in {duration:.2f}s | "
                f"Categories: {len(categories)}, "
                f"Brands: {sum(len(b) for b in brands_by_category.values())}, "
                f"Items: {len(all_items_enriched)}, "
                f"Specs: {len(specs_by_gear_id)}"
                + (
                    f" | Failed tables: {failed_specs_tables}"
                    if failed_specs_tables
                    else ""
                )
            )

            # Save to JSON file
            if save_to_file:
                self._save_to_json()

        except Exception as e:
            logger.error(f"[CATALOG CACHE] Warmup failed: {e}")
            # Don't re-raise - allow server to start even if cache fails
            # Endpoints will fallback to database queries

    def is_loaded(self) -> bool:
        """Check if cache has been loaded."""
        with self._data_lock:
            return self._data["is_loaded"]

    def get_last_updated(self) -> Optional[datetime]:
        """Get the last time cache was updated."""
        with self._data_lock:
            return self._data["last_updated"]

    def get_categories(self) -> List[models.Category]:
        """Get all categories from cache."""
        with self._data_lock:
            return self._data["categories"].copy()

    def get_brands_for_category(self, category_id: uuid.UUID) -> List[models.Brand]:
        """
        Get all brands that have items in a specific category.

        Args:
            category_id: UUID of the category

        Returns:
            List of Brand objects
        """
        cat_id_str = str(category_id)
        with self._data_lock:
            return self._data["brands_by_category"].get(cat_id_str, []).copy()

    def get_brands(self, category_id: Optional[uuid.UUID] = None) -> List[models.Brand]:
        """
        Get all brands, optionally filtered by category.

        Args:
            category_id: Optional UUID to filter by category

        Returns:
            List of Brand objects
        """
        if category_id:
            return self.get_brands_for_category(category_id)

        # Return all unique brands across all categories
        with self._data_lock:
            seen = set()
            all_brands = []
            for brands in self._data["brands_by_category"].values():
                for brand in brands:
                    if brand.id not in seen:
                        all_brands.append(brand)
                        seen.add(brand.id)
            return all_brands

    def get_items(
        self,
        category_id: Optional[uuid.UUID] = None,
        brand_id: Optional[uuid.UUID] = None,
    ) -> List[dict]:
        """
        Get catalog items, optionally filtered by category and/or brand.

        Args:
            category_id: Optional UUID to filter by category
            brand_id: Optional UUID to filter by brand

        Returns:
            List of item dictionaries with embedded specs
        """
        cat_id_str = str(category_id) if category_id else None
        brand_id_str = str(brand_id) if brand_id else None

        with self._data_lock:
            if cat_id_str and brand_id_str:
                # Specific category + brand
                key = (cat_id_str, brand_id_str)
                return self._data["items_by_category_brand"].get(key, []).copy()
            elif cat_id_str:
                # All items in category (across all brands)
                result = []
                for (c_id, b_id), items in self._data[
                    "items_by_category_brand"
                ].items():
                    if c_id == cat_id_str:
                        result.extend(items)
                return result
            elif brand_id_str:
                # All items from brand (across all categories)
                result = []
                for (c_id, b_id), items in self._data[
                    "items_by_category_brand"
                ].items():
                    if b_id == brand_id_str:
                        result.extend(items)
                return result
            else:
                # All items
                return self._data["all_items"].copy()

    def get_item(self, item_id: uuid.UUID) -> Optional[dict]:
        """
        Get a single catalog item by ID.

        Args:
            item_id: UUID of the item

        Returns:
            Item dictionary with embedded specs, or None if not found
        """
        item_id_str = str(item_id)
        with self._data_lock:
            item = self._data["items_by_id"].get(item_id_str)
            return item.copy() if item else None

    def get_specs(self, gear_id: uuid.UUID) -> dict:
        """
        Get specs for a gear item.

        Args:
            gear_id: UUID of the gear item

        Returns:
            Dictionary of specs, empty dict if not found
        """
        gear_id_str = str(gear_id)
        with self._data_lock:
            specs = self._data["specs_by_gear_id"].get(gear_id_str, {})
            return specs.copy()

    def get_stats(self) -> dict:
        """Get cache statistics for monitoring."""
        with self._data_lock:
            return {
                "is_loaded": self._data["is_loaded"],
                "last_updated": self._data["last_updated"].isoformat()
                if self._data["last_updated"]
                else None,
                "categories_count": len(self._data["categories"]),
                "brands_count": sum(
                    len(b) for b in self._data["brands_by_category"].values()
                ),
                "items_count": len(self._data["all_items"]),
                "specs_count": len(self._data["specs_by_gear_id"]),
                "cache_file": self._cache_file,
                "cache_file_exists": os.path.exists(self._cache_file),
            }


# Global singleton instance
catalog_cache = CatalogCache()
