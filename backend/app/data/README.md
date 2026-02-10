# Cache Directory

This directory contains cached data files for the Vemakin backend.

## Files

### catalog_cache.json
- **Purpose**: Persistent cache of catalog data (categories, brands, items, specs)
- **Generated**: Automatically on first startup or when cache is stale (> 24 hours old)
- **Format**: JSON
- **TTL**: 24 hours (auto-refreshed daily at 3:00 AM)
- **Note**: This file is gitignored and should not be committed

## Refresh Schedule

The catalog cache is automatically refreshed:
1. **On startup**: If cache file is missing or stale (> 24 hours)
2. **Daily**: At 3:00 AM via background scheduler
3. **Manual**: Restart the server to force refresh

## Environment Variables

- `CATALOG_CACHE_FILE`: Override the default cache file location
  - Default: `backend/app/data/catalog_cache.json`
