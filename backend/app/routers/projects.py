from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List
import time
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db
from ..cache import cache, get_cache_key, invalidate_project_ownership_cache

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
    responses={404: {"description": "Not found"}},
)


def invalidate_projects_cache(user_id: str) -> None:
    """Invalidate projects cache for a user."""
    cache_key = get_cache_key("projects", user_id)
    cache.delete(cache_key)
    print(f"[CACHE] Invalidated projects cache for user {user_id}")


@router.get("")
def read_projects(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Get list of projects with pagination and caching."""
    # Guest mode: return mock project
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        projects = mock_db.list_projects()
        return projects[skip : skip + limit] if projects else []

    user_id = current_user["uid"]
    cache_key = get_cache_key("projects", user_id)

    # Try to get from cache first
    cached_result = cache.get(cache_key)
    if cached_result is not None:
        print(f"[CACHE] Hit for projects user {user_id}")
        return cached_result[skip : skip + limit]

    print(f"[CACHE] Miss for projects user {user_id}")

    # Normal mode: query real database with SQLAlchemy 2.0 style
    stmt = (
        select(models.Project)
        .where(models.Project.user_id == user_id)
        .order_by(models.Project.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    result = db.execute(stmt)
    projects = result.scalars().all()

    # Cache the result
    cache.set(cache_key, projects, ttl_seconds=300)

    return projects


@router.post("")
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Create a new project with timing instrumentation."""
    start_time = time.time()

    # Guest mode: update mock project name (only one project in guest mode)
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        existing_project = (
            mock_db.list_projects()[0] if mock_db.list_projects() else None
        )
        if existing_project:
            updated = mock_db.update_project(
                existing_project["id"], {"name": project.name}
            )
            return updated
        return None

    # Normal mode: create in real database
    db_project = models.Project(name=project.name, user_id=current_user["uid"])
    db.add(db_project)

    commit_start = time.time()
    db.commit()
    commit_time = time.time() - commit_start

    # Invalidate cache after successful creation
    invalidate_projects_cache(current_user["uid"])

    total_time = time.time() - start_time
    print(f"[PROJECTS POST] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return db_project


@router.patch("/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: str,
    project_update: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Update a project with timing instrumentation."""
    start_time = time.time()

    # Guest mode: update mock project
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        updated = mock_db.update_project(project_id, {"name": project_update.name})
        if not updated:
            raise HTTPException(status_code=404, detail="Project not found")
        return updated

    # Normal mode: update real database with SQLAlchemy 2.0 style
    stmt = select(models.Project).where(
        models.Project.id == project_id,
        models.Project.user_id == current_user["uid"],
    )
    result = db.execute(stmt)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.name = project_update.name

    commit_start = time.time()
    db.commit()
    commit_time = time.time() - commit_start

    # Invalidate cache after successful update
    invalidate_projects_cache(current_user["uid"])

    total_time = time.time() - start_time
    print(f"[PROJECTS PATCH] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Delete a project and invalidate all caches."""
    start_time = time.time()

    # Guest mode: reset mock project (can't really delete the only project)
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # In guest mode, we reset the project to default rather than deleting
        mock_db.update_project(project_id, {"name": "Mon Premier Film"})
        return None

    # Normal mode: delete from real database with SQLAlchemy 2.0 style
    stmt = select(models.Project).where(
        models.Project.id == project_id,
        models.Project.user_id == current_user["uid"],
    )
    result = db.execute(stmt)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)

    commit_start = time.time()
    db.commit()
    commit_time = time.time() - commit_start

    # Invalidate all related caches
    invalidate_projects_cache(current_user["uid"])
    invalidate_project_ownership_cache(project_id)

    total_time = time.time() - start_time
    print(f"[PROJECTS DELETE] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return None
