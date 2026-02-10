"""Project ownership cache for fast authorization checks."""

import time
from typing import Dict, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..models import models

# In-memory cache for project ownership
# Key: "project_id:user_id", Value: {"is_owner": bool, "expires_at": timestamp}
_project_ownership_cache: Dict[str, Dict] = {}
PROJECT_OWNERSHIP_TTL = 300  # 5 minutes


def _get_cache_key(project_id: str, user_id: str) -> str:
    """Generate cache key for project ownership."""
    return f"{project_id}:{user_id}"


def is_project_owner_cached(
    project_id: str, user_id: str, db: Session
) -> Optional[bool]:
    """
    Check if user owns project using cache.

    Returns:
        bool: True if owner, False if not owner
        None: If not in cache (needs DB lookup)
    """
    cache_key = _get_cache_key(project_id, user_id)
    cached = _project_ownership_cache.get(cache_key)

    if cached and cached["expires_at"] > time.time():
        return cached["is_owner"]

    # Remove expired entry
    if cached:
        del _project_ownership_cache[cache_key]

    return None


def cache_project_ownership(project_id: str, user_id: str, is_owner: bool) -> None:
    """Cache project ownership result."""
    cache_key = _get_cache_key(project_id, user_id)
    _project_ownership_cache[cache_key] = {
        "is_owner": is_owner,
        "expires_at": time.time() + PROJECT_OWNERSHIP_TTL,
    }


def invalidate_project_ownership_cache(project_id: str) -> None:
    """Invalidate all ownership cache entries for a project."""
    keys_to_delete = [
        key
        for key in _project_ownership_cache.keys()
        if key.startswith(f"{project_id}:")
    ]
    for key in keys_to_delete:
        del _project_ownership_cache[key]

    if keys_to_delete:
        print(
            f"[PROJECT CACHE] Invalidated {len(keys_to_delete)} entries for project {project_id}"
        )


def invalidate_all_project_cache() -> None:
    """Clear all project ownership cache."""
    count = len(_project_ownership_cache)
    _project_ownership_cache.clear()
    if count > 0:
        print(f"[PROJECT CACHE] Cleared all {count} entries")


def check_project_owner(project_id: str, user_id: str, db: Session) -> bool:
    """
    Check project ownership with caching.

    Args:
        project_id: The project ID to check
        user_id: The user ID to verify ownership
        db: Database session

    Returns:
        bool: True if user owns the project

    Raises:
        HTTPException: 404 if project not found or user doesn't own it
    """
    from fastapi import HTTPException, status

    # Check cache first
    cached_result = is_project_owner_cached(project_id, user_id, db)
    if cached_result is not None:
        if not cached_result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
            )
        return True

    # Cache miss - check database
    project_stmt = select(models.Project).where(
        models.Project.id == project_id,
        models.Project.user_id == user_id,
    )
    project = db.execute(project_stmt).scalar_one_or_none()

    if not project:
        # Cache negative result too (not owner)
        cache_project_ownership(project_id, user_id, False)
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Project not found"
        )

    # Cache positive result
    cache_project_ownership(project_id, user_id, True)
    return True
