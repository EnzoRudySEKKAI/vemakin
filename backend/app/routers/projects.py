from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user

router = APIRouter(
    prefix="/projects",
    tags=["projects"],
    responses={404: {"description": "Not found"}},
)

@router.get("")
def read_projects(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    projects = db.query(models.Project).filter(models.Project.user_id == current_user['uid']).offset(skip).limit(limit).all()
    return projects

@router.post("")
def create_project(
    project: schemas.ProjectCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_project = models.Project(name=project.name, user_id=current_user['uid'])
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

@router.patch("/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: str,
    project_update: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user['uid']).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.name = project_update.name
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str, # UUID as string in URL path
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.user_id == current_user['uid']).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    return None
