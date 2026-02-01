from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db

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
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Guest mode: return mock project
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        projects = mock_db.list_projects()
        return projects[skip : skip + limit] if projects else []

    # Normal mode: query real database
    projects = (
        db.query(models.Project)
        .filter(models.Project.user_id == current_user["uid"])
        .offset(skip)
        .limit(limit)
        .all()
    )
    return projects


@router.post("")
def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
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
    db.commit()
    db.refresh(db_project)
    return db_project


@router.patch("/{project_id}", response_model=schemas.Project)
def update_project(
    project_id: str,
    project_update: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Guest mode: update mock project
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        updated = mock_db.update_project(project_id, {"name": project_update.name})
        if not updated:
            raise HTTPException(status_code=404, detail="Project not found")
        return updated

    # Normal mode: update real database
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id,
            models.Project.user_id == current_user["uid"],
        )
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.name = project_update.name
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Guest mode: reset mock project (can't really delete the only project)
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # In guest mode, we reset the project to default rather than deleting
        mock_db.update_project(project_id, {"name": "Mon Premier Film"})
        return None

    # Normal mode: delete from real database
    project = (
        db.query(models.Project)
        .filter(
            models.Project.id == project_id,
            models.Project.user_id == current_user["uid"],
        )
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return None
