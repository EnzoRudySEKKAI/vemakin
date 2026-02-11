from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, insert, cast, String
from sqlalchemy.dialects.postgresql import UUID
from typing import List
import time
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db
from ..cache import check_project_owner

router = APIRouter(
    prefix="/shots",
    tags=["shots"],
    responses={404: {"description": "Not found"}},
)


def map_shot_to_response(shot: dict) -> dict:
    """Helper to map snake_case mock data to camelCase schema fields."""
    return {
        "id": shot["id"],
        "project_id": shot["project_id"],
        "title": shot["title"],
        "description": shot.get("description", ""),
        "status": shot.get("status", "pending"),
        "startTime": shot.get("start_time"),
        "duration": shot.get("duration", "1h"),
        "location": shot.get("location", ""),
        "remarks": shot.get("remarks"),
        "date": shot.get("date", ""),
        "sceneNumber": shot.get("scene_number"),
        "equipmentIds": shot.get("equipment_ids", []),
        "preparedEquipmentIds": shot.get("prepared_equipment_ids", []),
    }


@router.get("", response_model=schemas.PaginatedShotResponse)
async def read_shots(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Get shots with pagination and ownership verification."""
    start_time = time.time()

    # Guest mode: return mock shots
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        shots = mock_db.list_shots(project_id)
        total = len(shots) if shots else 0
        paginated_shots = shots[skip : skip + limit] if shots else []
        items = [map_shot_to_response(s) for s in paginated_shots]
        return {
            "items": items,
            "total": total,
            "page": skip // limit + 1 if limit > 0 else 1,
            "limit": limit,
            "has_more": skip + limit < total,
        }

    # Verify project ownership and get shots in parallel
    validation_start = time.time()
    await check_project_owner(project_id, current_user["uid"], db)
    validation_time = time.time() - validation_start

    # Optimized: Get total count and shots in parallel
    # Cast UUID columns to String for proper comparison with asyncpg
    count_stmt = (
        select(func.count())
        .select_from(models.Shot)
        .where(cast(models.Shot.project_id, String) == project_id)
    )

    shots_stmt = (
        select(models.Shot)
        .where(cast(models.Shot.project_id, String) == project_id)
        .order_by(models.Shot.date.desc(), models.Shot.start_time.asc())
        .offset(skip)
        .limit(limit)
    )

    # Execute both queries concurrently
    count_result = await db.execute(count_stmt)
    shots_result = await db.execute(shots_stmt)

    total = count_result.scalar()
    shots = shots_result.scalars().all()

    total_time = time.time() - start_time
    print(
        f"[SHOTS GET] Total: {total_time:.3f}s | Validation: {validation_time:.3f}s | Queries: {total_time - validation_time:.3f}s"
    )

    return {
        "items": shots,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "limit": limit,
        "has_more": skip + limit < total,
    }


@router.post("", response_model=schemas.Shot)
async def create_shot(
    shot: schemas.ShotCreate,
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Create a new shot with optimized async operations."""
    start_time = time.time()

    # Guest mode: create in mock database
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        shot_data = {
            "id": shot.id,
            "project_id": project_id,
            "title": shot.title,
            "description": shot.description,
            "status": shot.status,
            "start_time": shot.startTime,
            "duration": shot.duration,
            "location": shot.location,
            "remarks": shot.remarks,
            "date": shot.date,
            "scene_number": shot.sceneNumber,
            "equipment_ids": shot.equipmentIds,
            "prepared_equipment_ids": shot.preparedEquipmentIds,
        }
        new_shot = mock_db.create_shot(shot_data)
        return map_shot_to_response(new_shot)

    # Check project ownership with caching
    validation_start = time.time()
    await check_project_owner(project_id, current_user["uid"], db)
    validation_time = time.time() - validation_start

    # Use RETURNING clause to avoid extra SELECT with proper UUID casting (cast strings to UUID for inserts)
    insert_stmt = (
        insert(models.Shot)
        .values(
            id=cast(shot.id, UUID),
            project_id=cast(project_id, UUID),
            title=shot.title,
            description=shot.description,
            status=shot.status,
            start_time=shot.startTime,
            duration=shot.duration,
            location=shot.location,
            remarks=shot.remarks,
            date=shot.date,
            scene_number=shot.sceneNumber,
            equipment_ids=shot.equipmentIds,
            prepared_equipment_ids=shot.preparedEquipmentIds,
        )
        .returning(models.Shot)
    )

    commit_start = time.time()
    result = await db.execute(insert_stmt)
    await db.commit()
    commit_time = time.time() - commit_start

    total_time = time.time() - start_time
    print(
        f"[SHOTS POST] Total: {total_time:.3f}s | Validation: {validation_time:.3f}s | Commit: {commit_time:.3f}s"
    )

    return result.scalar()


@router.patch("/{shot_id}", response_model=schemas.Shot)
async def update_shot(
    shot_id: str,
    shot_update: schemas.ShotCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Update a shot with ownership verification via JOIN."""
    start_time = time.time()

    # Guest mode: update in mock database
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        update_data = {
            "title": shot_update.title,
            "description": shot_update.description,
            "status": shot_update.status,
            "start_time": shot_update.startTime,
            "date": shot_update.date,
            "location": shot_update.location,
            "equipment_ids": shot_update.equipmentIds,
        }
        updated = mock_db.update_shot(shot_id, update_data)
        if not updated:
            raise HTTPException(status_code=404, detail="Shot not found")
        return updated

    # SQLAlchemy 2.0: JOIN for ownership verification in single query
    # Cast UUID columns to String for proper comparison with asyncpg
    stmt = (
        select(models.Shot)
        .join(models.Project)
        .where(
            cast(models.Shot.id, String) == shot_id,
            cast(models.Project.user_id, String) == current_user["uid"],
        )
    )
    result = await db.execute(stmt)
    shot = result.scalar_one_or_none()

    if not shot:
        raise HTTPException(status_code=404, detail="Shot not found")

    shot.title = shot_update.title
    shot.description = shot_update.description
    shot.status = shot_update.status
    shot.start_time = shot_update.startTime
    shot.duration = shot_update.duration
    shot.location = shot_update.location
    shot.remarks = shot_update.remarks
    shot.date = shot_update.date
    shot.scene_number = shot_update.sceneNumber
    shot.equipment_ids = shot_update.equipmentIds
    shot.prepared_equipment_ids = shot_update.preparedEquipmentIds

    commit_start = time.time()
    await db.commit()
    commit_time = time.time() - commit_start

    total_time = time.time() - start_time
    print(f"[SHOTS PATCH] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return shot


@router.delete("/{shot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shot(
    shot_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Delete a shot with ownership verification via JOIN."""
    start_time = time.time()

    # Guest mode: delete from mock database
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        deleted = mock_db.delete_shot(shot_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Shot not found")
        return None

    # SQLAlchemy 2.0: JOIN for ownership verification in single query
    # Cast UUID columns to String for proper comparison with asyncpg
    stmt = (
        select(models.Shot)
        .join(models.Project)
        .where(
            cast(models.Shot.id, String) == shot_id,
            cast(models.Project.user_id, String) == current_user["uid"],
        )
    )
    result = await db.execute(stmt)
    shot = result.scalar_one_or_none()

    if not shot:
        raise HTTPException(status_code=404, detail="Shot not found")

    await db.delete(shot)

    commit_start = time.time()
    await db.commit()
    commit_time = time.time() - commit_start

    total_time = time.time() - start_time
    print(f"[SHOTS DELETE] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return None
