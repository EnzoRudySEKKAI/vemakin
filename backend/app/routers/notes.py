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
async def read_notes(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Get notes with pagination."""
    start_time = time.time()

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

    # Verify project ownership
    validation_start = time.time()
    await check_project_owner(project_id, current_user["uid"], db)
    validation_time = time.time() - validation_start

    # Optimized count and fetch in parallel
    # Cast UUID columns to String for proper comparison with asyncpg
    count_stmt = (
        select(func.count())
        .select_from(models.Note)
        .where(cast(models.Note.project_id, String) == project_id)
    )

    notes_stmt = (
        select(models.Note)
        .where(cast(models.Note.project_id, String) == project_id)
        .order_by(models.Note.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )

    # Execute both queries concurrently
    count_result = await db.execute(count_stmt)
    notes_result = await db.execute(notes_stmt)

    total = count_result.scalar()
    notes = notes_result.scalars().all()

    total_time = time.time() - start_time
    print(
        f"[NOTES GET] Total: {total_time:.3f}s | Validation: {validation_time:.3f}s | Queries: {total_time - validation_time:.3f}s"
    )

    return {
        "items": notes,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "limit": limit,
        "has_more": skip + limit < total,
    }


@router.post("", response_model=schemas.Note)
async def create_note(
    note: schemas.NoteCreate,
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Create a new note with optimized async operations."""
    start_time = time.time()

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

    # Check project ownership with caching
    validation_start = time.time()
    await check_project_owner(project_id, current_user["uid"], db)
    validation_time = time.time() - validation_start

    # Use RETURNING clause with proper UUID casting (cast strings to UUID for inserts)
    insert_stmt = (
        insert(models.Note)
        .values(
            id=cast(note.id, UUID),
            project_id=cast(project_id, UUID),
            title=note.title,
            content=note.content,
            shot_id=cast(note.shotId, UUID) if note.shotId else None,
            task_id=cast(note.taskId, UUID) if note.taskId else None,
        )
        .returning(models.Note)
    )

    commit_start = time.time()
    result = await db.execute(insert_stmt)
    await db.commit()
    commit_time = time.time() - commit_start

    total_time = time.time() - start_time
    print(
        f"[NOTES POST] Total: {total_time:.3f}s | Validation: {validation_time:.3f}s | Commit: {commit_time:.3f}s"
    )

    return result.scalar()


@router.patch("/{note_id}", response_model=schemas.Note)
async def update_note(
    note_id: str,
    note_update: schemas.NoteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Update a note with ownership verification."""
    start_time = time.time()

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
    # Cast UUID columns to String for proper comparison with asyncpg
    stmt = (
        select(models.Note)
        .join(models.Project)
        .where(
            cast(models.Note.id, String) == note_id,
            cast(models.Project.user_id, String) == current_user["uid"],
        )
    )
    result = await db.execute(stmt)
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    note.title = note_update.title
    note.content = note_update.content
    note.shot_id = note_update.shotId
    note.task_id = note_update.taskId

    commit_start = time.time()
    await db.commit()
    commit_time = time.time() - commit_start

    total_time = time.time() - start_time
    print(f"[NOTES PATCH] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    note_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Delete a note with ownership verification."""
    start_time = time.time()

    # Guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        deleted = mock_db.delete_note(note_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Note not found")
        return None

    # SQLAlchemy 2.0: JOIN for ownership verification
    # Cast UUID columns to String for proper comparison with asyncpg
    stmt = (
        select(models.Note)
        .join(models.Project)
        .where(
            cast(models.Note.id, String) == note_id,
            cast(models.Project.user_id, String) == current_user["uid"],
        )
    )
    result = await db.execute(stmt)
    note = result.scalar_one_or_none()

    if not note:
        raise HTTPException(status_code=404, detail="Note not found")

    await db.delete(note)

    commit_start = time.time()
    await db.commit()
    commit_time = time.time() - commit_start

    total_time = time.time() - start_time
    print(f"[NOTES DELETE] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return None
