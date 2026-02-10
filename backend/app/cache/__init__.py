"""
Cache module for in-memory data caching.

This module provides caching mechanisms to reduce database queries
for frequently accessed, rarely changing data like the catalog.

Currently supports:
- CatalogCache: In-memory cache for catalog data (categories, brands, items, specs)
  Refreshed every 24 hours via background scheduler.
- SimpleCache: Generic in-memory cache for API responses with TTL support
- ProjectCache: Fast project ownership checks with caching

Future:
- Redis integration for distributed caching
"""

from .catalog_cache import catalog_cache, CatalogCache
from .response_cache import SimpleCache, cache, get_cache_key
from .project_cache import (
    check_project_owner,
    invalidate_project_ownership_cache,
    invalidate_all_project_cache,
)

__all__ = [
    "catalog_cache",
    "CatalogCache",
    "SimpleCache",
    "cache",
    "get_cache_key",
    "check_project_owner",
    "invalidate_project_ownership_cache",
    "invalidate_all_project_cache",
]
