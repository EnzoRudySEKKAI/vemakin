from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user
import uuid

router = APIRouter(
    prefix="/postprod",
    tags=["postprod"]
)

@router.get("", response_model=List[schemas.PostProdTask])
def read_tasks(
    project_id: str,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Verify project ownership
    project = db.query(models.Project).filter(
        models.Project.id == project_id, 
        models.Project.user_id == current_user['uid']
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    tasks = db.query(models.PostProdTask).filter(models.PostProdTask.project_id == project_id).offset(skip).limit(limit).all()
    return tasks

@router.post("", response_model=schemas.PostProdTask)
def create_task(
    task: schemas.PostProdTaskCreate,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Verify project ownership
    project = db.query(models.Project).filter(
        models.Project.id == project_id, 
        models.Project.user_id == current_user['uid']
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db_task = models.PostProdTask(
        id=task.id,
        project_id=project_id,
        category=task.category,
        title=task.title,
        status=task.status,
        priority=task.priority,
        due_date=task.dueDate,
        description=task.description
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.patch("/{task_id}", response_model=schemas.PostProdTask)
def update_task(
    task_id: str,
    task_update: schemas.PostProdTaskCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    task = db.query(models.PostProdTask).join(models.Project).filter(
        models.PostProdTask.id == task_id,
        models.Project.user_id == current_user['uid']
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.model_dump()
    for key, value in update_data.items():
        if key == 'dueDate':
            setattr(task, 'due_date', value)
        else:
            setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    task = db.query(models.PostProdTask).join(models.Project).filter(
        models.PostProdTask.id == task_id,
        models.Project.user_id == current_user['uid']
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return None
