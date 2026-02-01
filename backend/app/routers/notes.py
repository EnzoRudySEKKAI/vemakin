from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("")
def read_notes(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # Verify project exists (mock project)
        project = mock_db.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        # Return mock notes for the project
        notes = mock_db.list_notes(project_id)
        return notes[skip : skip + limit]

    # Verify project ownership with single query
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

    notes = (
        db.query(models.Note)
        .filter(models.Note.project_id == project_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

    return notes


@router.post("")
def create_note(
    note: schemas.NoteCreate,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # Verify project exists (mock project)
        project = mock_db.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        # Create note in mock database
        note_data = {
            "id": note.id,
            "project_id": project_id,
            "title": note.title,
            "content": note.content,
            "shot_id": note.shotId,
            "task_id": note.taskId,
        }
        return mock_db.create_note(note_data)

    # Verify project ownership
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

    db_note = models.Note(
        id=note.id,
        project_id=project_id,
        title=note.title,
        content=note.content,
        shot_id=note.shotId,
        task_id=note.taskId,
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
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # Update note in mock database
        update_data = {
            "title": note_update.title,
            "content": note_update.content,
            "shot_id": note_update.shotId,
            "task_id": note_update.taskId,
        }
        # Remove None values
        update_data = {k: v for k, v in update_data.items() if v is not None}
        updated_note = mock_db.update_note(note_id, update_data)
        if not updated_note:
            raise HTTPException(status_code=404, detail="Note not found")
        return updated_note

    note = (
        db.query(models.Note)
        .join(models.Project)
        .filter(
            models.Note.id == note_id, models.Project.user_id == current_user["uid"]
        )
        .first()
    )

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
    current_user: dict = Depends(get_current_user_or_guest),
):
    # Check if guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        # Delete note from mock database
        deleted = mock_db.delete_note(note_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Note not found")
        return None

    note = (
        db.query(models.Note)
        .join(models.Project)
        .filter(
            models.Note.id == note_id, models.Project.user_id == current_user["uid"]
        )
        .first()
    )

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return None
