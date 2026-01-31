from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
# We need Note schemas, adding them locally or update schemas.py first? 
# I will check schemas.py to ensure Note schemas exist, if not I will add them.
# Assuming standard CRUD for now.
from ..schemas import schemas
from ..auth import get_current_user
import uuid

router = APIRouter(
    prefix="/notes",
    tags=["notes"]
)

@router.get("")
def read_notes(
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

    notes = db.query(models.Note).filter(models.Note.project_id == project_id).offset(skip).limit(limit).all()
    return notes

@router.post("")
def create_note(
    note: schemas.NoteCreate, # Schema needs to be created
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

    db_note = models.Note(
        id=note.id,
        project_id=project_id,
        title=note.title,
        content=note.content,
        shot_id=note.shotId, # camelCase to snake_case
        task_id=note.taskId  # camelCase to snake_case
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@router.patch("/{note_id}", response_model=schemas.Note)
def update_note(
    note_id: str,
    note_update: schemas.NoteCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    note = db.query(models.Note).join(models.Project).filter(
        models.Note.id == note_id,
        models.Project.user_id == current_user['uid']
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.title = note_update.title
    note.content = note_update.content
    note.shot_id = note_update.shotId
    note.task_id = note_update.taskId

    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # We need to find the note and verify project ownership (via project_id)
    # or just check if the project associated with the note belongs to the user.
    note = db.query(models.Note).join(models.Project).filter(
        models.Note.id == note_id,
        models.Project.user_id == current_user['uid']
    ).first()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return None
