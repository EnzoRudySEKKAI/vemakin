from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db

router = APIRouter(prefix="/notes", tags=["notes"])


def map_note_to_response(note: dict) -> dict:
    """Helper to map snake_case mock data to camelCase schema fields."""
    return {
        "id": note["id"],
        "project_id": note["project_id"],
        "title": note.get("title", "New Note"),
        "content": note.get("content", ""),
        "shotId": note.get("shot_id"),
        "taskId": note.get("task_id"),
        "created_at": note.get("created_at"),
        "updated_at": note.get("updated_at"),
    }


@router.get("", response_model=schemas.PaginatedNoteResponse)
def read_notes(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Get notes with pagination."""
    # Guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        project = mock_db.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        notes = mock_db.list_notes(project_id)
        total = len(notes) if notes else 0
        paginated_notes = notes[skip : skip + limit] if notes else []
        items = [map_note_to_response(n) for n in paginated_notes]
        return {
            "items": items,
            "total": total,
            "page": skip // limit + 1 if limit > 0 else 1,
            "limit": limit,
            "has_more": skip + limit < total,
        }

    # SQLAlchemy 2.0: Verify project ownership
    project_stmt = select(models.Project).where(
        models.Project.id == project_id,
        models.Project.user_id == current_user["uid"],
    )
    if not db.execute(project_stmt).scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    # Optimized count using indexed columns
    count_stmt = (
        select(func.count())
        .select_from(models.Note)
        .where(models.Note.project_id == project_id)
    )
    total = db.execute(count_stmt).scalar()

    # Get notes ordered by most recently updated
    notes_stmt = (
        select(models.Note)
        .where(models.Note.project_id == project_id)
        .order_by(models.Note.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    notes = db.execute(notes_stmt).scalars().all()

    return {
        "items": notes,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "limit": limit,
        "has_more": skip + limit < total,
    }


@router.post("", response_model=schemas.Note)
def create_note(
    note: schemas.NoteCreate,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Create a new note."""
    # Guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        project = mock_db.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        note_data = {
            "id": note.id,
            "project_id": project_id,
            "title": note.title,
            "content": note.content,
            "shot_id": note.shotId,
            "task_id": note.taskId,
        }
        new_note = mock_db.create_note(note_data)
        return map_note_to_response(new_note)

    # SQLAlchemy 2.0: Verify project ownership
    project_stmt = select(models.Project).where(
        models.Project.id == project_id,
        models.Project.user_id == current_user["uid"],
    )
    if not db.execute(project_stmt).scalar_one_or_none():
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
    """Update a note with ownership verification."""
    # Guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        update_data = {
            "title": note_update.title,
            "content": note_update.content,
            "shot_id": note_update.shotId,
            "task_id": note_update.taskId,
        }
        update_data = {k: v for k, v in update_data.items() if v is not None}
        updated_note = mock_db.update_note(note_id, update_data)
        if not updated_note:
            raise HTTPException(status_code=404, detail="Note not found")
        return updated_note

    # SQLAlchemy 2.0: JOIN for ownership verification
    stmt = (
        select(models.Note)
        .join(models.Project)
        .where(
            models.Note.id == note_id,
            models.Project.user_id == current_user["uid"],
        )
    )
    result = db.execute(stmt)
    note = result.scalar_one_or_none()

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
    """Delete a note with ownership verification."""
    # Guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        deleted = mock_db.delete_note(note_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Note not found")
        return None

    # SQLAlchemy 2.0: JOIN for ownership verification
    stmt = (
        select(models.Note)
        .join(models.Project)
        .where(
            models.Note.id == note_id,
            models.Project.user_id == current_user["uid"],
        )
    )
    result = db.execute(stmt)
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    db.delete(note)
    db.commit()
    return None
