from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, over
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db

router = APIRouter(
    prefix="/shots",
    tags=["shots"],
    responses={404: {"description": "Not found"}},
)


@router.get("", response_model=schemas.PaginatedShotResponse)
def read_shots(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Get shots with pagination and ownership verification."""
    # Guest mode: return mock shots
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        shots = mock_db.list_shots(project_id)
        total = len(shots) if shots else 0
        paginated_shots = shots[skip : skip + limit] if shots else []
        return {
            "items": paginated_shots,
            "total": total,
            "page": skip // limit + 1 if limit > 0 else 1,
            "limit": limit,
            "has_more": skip + limit < total,
        }

    # SQLAlchemy 2.0: Verify project ownership with single query
    project_stmt = select(models.Project).where(
        models.Project.id == project_id,
        models.Project.user_id == current_user["uid"],
    )
    project_result = db.execute(project_stmt)
    if not project_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    # Optimized: Get total count and shots in efficient queries
    # Using indexed columns for fast counting
    count_stmt = (
        select(func.count())
        .select_from(models.Shot)
        .where(models.Shot.project_id == project_id)
    )
    total = db.execute(count_stmt).scalar()

    # Get shots with ordering for consistent results
    shots_stmt = (
        select(models.Shot)
        .where(models.Shot.project_id == project_id)
        .order_by(models.Shot.date.desc(), models.Shot.start_time.asc())
        .offset(skip)
        .limit(limit)
    )
    shots_result = db.execute(shots_stmt)
    shots = shots_result.scalars().all()

    return {
        "items": shots,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "limit": limit,
        "has_more": skip + limit < total,
    }


@router.post("", response_model=schemas.Shot)
def create_shot(
    shot: schemas.ShotCreate,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Create a new shot."""
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
            "date": shot.date,
            "location": shot.location,
            "equipment_ids": shot.equipmentIds,
        }
        new_shot = mock_db.create_shot(shot_data)
        return new_shot

    # SQLAlchemy 2.0: Verify project ownership
    project_stmt = select(models.Project).where(
        models.Project.id == project_id,
        models.Project.user_id == current_user["uid"],
    )
    project_result = db.execute(project_stmt)
    if not project_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    db_shot = models.Shot(
        id=shot.id,
        project_id=project_id,
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
    db.add(db_shot)
    db.commit()
    db.refresh(db_shot)
    return db_shot


@router.patch("/{shot_id}", response_model=schemas.Shot)
def update_shot(
    shot_id: str,
    shot_update: schemas.ShotCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Update a shot with ownership verification via JOIN."""
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
    stmt = (
        select(models.Shot)
        .join(models.Project)
        .where(
            models.Shot.id == shot_id,
            models.Project.user_id == current_user["uid"],
        )
    )
    result = db.execute(stmt)
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

    db.commit()
    db.refresh(shot)
    return shot


@router.delete("/{shot_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shot(
    shot_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Delete a shot with ownership verification via JOIN."""
    # Guest mode: delete from mock database
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        deleted = mock_db.delete_shot(shot_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Shot not found")
        return None

    # SQLAlchemy 2.0: JOIN for ownership verification in single query
    stmt = (
        select(models.Shot)
        .join(models.Project)
        .where(
            models.Shot.id == shot_id,
            models.Project.user_id == current_user["uid"],
        )
    )
    result = db.execute(stmt)
    shot = result.scalar_one_or_none()

    if not shot:
        raise HTTPException(status_code=404, detail="Shot not found")

    db.delete(shot)
    db.commit()
    return None
