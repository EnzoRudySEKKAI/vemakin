from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db

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
def read_tasks(
    project_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Get tasks with pagination."""
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

    # SQLAlchemy 2.0: Verify project ownership
    project_stmt = select(models.Project).where(
        models.Project.id == project_id,
        models.Project.user_id == current_user["uid"],
    )
    if not db.execute(project_stmt).scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    # Optimized count
    count_stmt = (
        select(func.count())
        .select_from(models.PostProdTask)
        .where(models.PostProdTask.project_id == project_id)
    )
    total = db.execute(count_stmt).scalar()

    # Get tasks ordered by status and priority (using indexed columns)
    tasks_stmt = (
        select(models.PostProdTask)
        .where(models.PostProdTask.project_id == project_id)
        .order_by(
            models.PostProdTask.status.asc(),
            models.PostProdTask.priority.asc(),
            models.PostProdTask.due_date.asc(),
        )
        .offset(skip)
        .limit(limit)
    )
    tasks = db.execute(tasks_stmt).scalars().all()

    return {
        "items": tasks,
        "total": total,
        "page": skip // limit + 1 if limit > 0 else 1,
        "limit": limit,
        "has_more": skip + limit < total,
    }


@router.post("", response_model=schemas.PostProdTask)
def create_task(
    task: schemas.PostProdTaskCreate,
    project_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Create a new task."""
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

    # SQLAlchemy 2.0: Verify project ownership
    project_stmt = select(models.Project).where(
        models.Project.id == project_id,
        models.Project.user_id == current_user["uid"],
    )
    if not db.execute(project_stmt).scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")

    db_task = models.PostProdTask(
        id=task.id,
        project_id=project_id,
        category=task.category,
        title=task.title,
        status=task.status,
        priority=task.priority,
        due_date=task.dueDate,
        description=task.description,
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
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Update a task with ownership verification."""
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
    stmt = (
        select(models.PostProdTask)
        .join(models.Project)
        .where(
            models.PostProdTask.id == task_id,
            models.Project.user_id == current_user["uid"],
        )
    )
    result = db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    update_data = task_update.model_dump()
    for key, value in update_data.items():
        if key == "dueDate":
            setattr(task, "due_date", value)
        else:
            setattr(task, key, value)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """Delete a task with ownership verification."""
    # Guest mode
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        deleted = mock_db.delete_task(task_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Task not found")
        return None

    # SQLAlchemy 2.0: JOIN for ownership verification
    stmt = (
        select(models.PostProdTask)
        .join(models.Project)
        .where(
            models.PostProdTask.id == task_id,
            models.Project.user_id == current_user["uid"],
        )
    )
    result = db.execute(stmt)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return None
