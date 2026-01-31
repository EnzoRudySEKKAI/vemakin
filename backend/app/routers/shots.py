from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user

router = APIRouter(
    prefix="/shots",
    tags=["shots"],
    responses={404: {"description": "Not found"}},
)

@router.get("")
def read_shots(
    project_id: str, # UUID string
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Verify project belongs to user
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user['uid']).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    shots = db.query(models.Shot).filter(models.Shot.project_id == project_id).offset(skip).limit(limit).all()
    return shots

@router.post("")
def create_shot(
    shot: schemas.ShotCreate, 
    project_id: str, # UUID string
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Verify project belongs to user
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user['uid']).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    shot_data = shot.model_dump() # dict() is deprecated in v2 but model_dump is standard, or just dict()
    # Pydantic v1 vs v2. FastAPI likely uses v2 now? Or v1. 
    # If pydantic is v2, use model_dump(). Safe bet is to access attributes directly or use dict() if v1.
    # Assuming standard dict or attribute access.
    
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
        prepared_equipment_ids=shot.preparedEquipmentIds
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
    current_user: dict = Depends(get_current_user)
):
    shot = db.query(models.Shot).join(models.Project).filter(
        models.Shot.id == shot_id,
        models.Project.user_id == current_user['uid']
    ).first()

    if not shot:
        raise HTTPException(status_code=404, detail="Shot not found")

    # Update fields mapping camelCase to snake_case
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
    current_user: dict = Depends(get_current_user)
):
    shot = db.query(models.Shot).join(models.Project).filter(
        models.Shot.id == shot_id,
        models.Project.user_id == current_user['uid']
    ).first()

    if not shot:
        raise HTTPException(status_code=404, detail="Shot not found")

    db.delete(shot)
    db.commit()
    return None
