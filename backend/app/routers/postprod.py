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

router = APIRouter(prefix="/postprod", tags=["postprod"])


def map_task_to_response(task: dict) -> dict:
    """Helper to map snake_case mock data to camelCase schema fields."""
    return {
        "id": task["id"],
        "project_id": task["project_id"],
        "category": task.get("category", "Editing"),
        "title": task.get("title", "New Task"),
        "status": task.get("status", "todo"),
        "priority": task.get("priority", "medium"),
        "dueDate": task.get("due_date"),
        "description": task.get("description"),
        "created_at": task.get("created_at"),
        "updated_at": task.get("updated_at"),
    }


@router.get("", response_model=schemas.PaginatedTaskResponse)
async def read_tasks(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Get tasks with pagination."""
    start_time = time.time()

    # Guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        project = mock_db.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        tasks = mock_db.list_tasks(project_id)
        total = len(tasks) if tasks else 0
        paginated_tasks = tasks[skip : skip + limit] if tasks else []
        items = [map_task_to_response(t) for t in paginated_tasks]
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
        .select_from(models.PostProdTask)
        .where(cast(models.PostProdTask.project_id, String) == project_id)
    )

    tasks_stmt = (
        select(models.PostProdTask)
        .where(cast(models.PostProdTask.project_id, String) == project_id)
        .order_by(
            models.PostProdTask.status.asc(),
            models.PostProdTask.priority.asc(),
            models.PostProdTask.due_date.asc(),
        )
        .offset(skip)
        .limit(limit)
    )

    # Execute both queries concurrently
    count_result = await db.execute(count_stmt)
    tasks_result = await db.execute(tasks_stmt)

    total = count_result.scalar()
    tasks = tasks_result.scalars().all()

    total_time = time.time() - start_time
    print(
        f"[POSTPROD GET] Total: {total_time:.3f}s | Validation: {validation_time:.3f}s | Queries: {total_time - validation_time:.3f}s"
    )

    return {
        "items": tasks,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "limit": limit,
        "has_more": skip + limit < total,
    }


@router.post("", response_model=schemas.PostProdTask)
async def create_task(
    task: schemas.PostProdTaskCreate,
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Create a new task with optimized async operations."""
    start_time = time.time()

    # Guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        project = mock_db.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        task_data = {
            "id": task.id,
            "project_id": project_id,
            "category": task.category,
            "title": task.title,
            "status": task.status,
            "priority": task.priority,
            "due_date": task.dueDate,
            "description": task.description,
        }
        new_task = mock_db.create_task(task_data)
        return map_task_to_response(new_task)

    # Check project ownership with caching
    validation_start = time.time()
    await check_project_owner(project_id, current_user["uid"], db)
    validation_time = time.time() - validation_start

    # Use RETURNING clause with proper UUID casting (cast strings to UUID for inserts)
    insert_stmt = (
        insert(models.PostProdTask)
        .values(
            id=cast(task.id, UUID),
            project_id=cast(project_id, UUID),
            category=task.category,
            title=task.title,
            status=task.status,
            priority=task.priority,
            due_date=task.dueDate,
            description=task.description,
        )
        .returning(models.PostProdTask)
    )

    commit_start = time.time()
    result = await db.execute(insert_stmt)
    await db.commit()
    commit_time = time.time() - commit_start

    total_time = time.time() - start_time
    print(
        f"[POSTPROD POST] Total: {total_time:.3f}s | Validation: {validation_time:.3f}s | Commit: {commit_time:.3f}s"
    )

    return result.scalar()


@router.patch("/{task_id}", response_model=schemas.PostProdTask)
async def update_task(
    task_id: str,
    task_update: schemas.PostProdTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Update a task with ownership verification."""
    start_time = time.time()

    # Guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        update_data = task_update.model_dump()
        if "dueDate" in update_data:
            update_data["due_date"] = update_data.pop("dueDate")
        update_data = {k: v for k, v in update_data.items() if v is not None}
        updated_task = mock_db.update_task(task_id, update_data)
        if not updated_task:
            raise HTTPException(status_code=404, detail="Task not found")
        return updated_task

    # SQLAlchemy 2.0: JOIN for ownership verification
    # Cast UUID columns to String for proper comparison with asyncpg
    stmt = (
        select(models.PostProdTask)
        .join(models.Project)
        .where(
            cast(models.PostProdTask.id, String) == task_id,
            cast(models.Project.user_id, String) == current_user["uid"],
        )
    )
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.model_dump()
    for key, value in update_data.items():
        if key == "dueDate":
            setattr(task, "due_date", value)
        else:
            setattr(task, key, value)

    commit_start = time.time()
    await db.commit()
    commit_time = time.time() - commit_start

    total_time = time.time() - start_time
    print(f"[POSTPROD PATCH] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Delete a task with ownership verification."""
    start_time = time.time()

    # Guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        deleted = mock_db.delete_task(task_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Task not found")
        return None

    # SQLAlchemy 2.0: JOIN for ownership verification
    # Cast UUID columns to String for proper comparison with asyncpg
    stmt = (
        select(models.PostProdTask)
        .join(models.Project)
        .where(
            cast(models.PostProdTask.id, String) == task_id,
            cast(models.Project.user_id, String) == current_user["uid"],
        )
    )
    result = await db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)

    commit_start = time.time()
    await db.commit()
    commit_time = time.time() - commit_start

    total_time = time.time() - start_time
    print(f"[POSTPROD DELETE] Total: {total_time:.3f}s | Commit: {commit_time:.3f}s")

    return None
