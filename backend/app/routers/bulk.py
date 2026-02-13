from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, cast, String
from sqlalchemy.dialects.postgresql import UUID
import asyncio
import time
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user_or_guest
from ..mock_data import get_mock_db
from ..cache import cache, get_cache_key

router = APIRouter(
    prefix="/bulk",
    tags=["bulk"],
    responses={404: {"description": "Not found"}},
)


def map_shot_to_response(shot: dict) -> dict:
    return {
        "id": shot["id"],
        "projectId": shot["project_id"],
        "title": shot["title"],
        "description": shot.get("description", ""),
        "status": shot.get("status", "pending"),
        "startTime": shot.get("start_time"),
        "duration": shot.get("duration", "1h"),
        "location": shot.get("location", ""),
        "remarks": shot.get("remarks"),
        "date": shot.get("date", ""),
        "sceneNumber": shot.get("scene_number"),
        "equipmentIds": shot.get("equipment_ids", []),
        "preparedEquipmentIds": shot.get("prepared_equipment_ids", []),
    }


def map_note_to_response(note: dict) -> dict:
    return {
        "id": note["id"],
        "title": note["title"],
        "content": note.get("content", ""),
        "projectId": note["project_id"],
        "shotId": note.get("shot_id"),
        "taskId": note.get("task_id"),
        "updatedAt": note.get("updated_at"),
    }


def map_task_to_response(task: dict) -> dict:
    return {
        "id": task["id"],
        "category": task.get("category"),
        "title": task["title"],
        "status": task.get("status", "pending"),
        "priority": task.get("priority", "medium"),
        "dueDate": task.get("due_date"),
        "description": task.get("description", ""),
        "projectId": task["project_id"],
    }


async def get_inventory_with_specs(db: AsyncSession, current_user: dict):
    """Fetch inventory with basic data (enrichment done on frontend)."""

    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        return mock_db.list_inventory()

    user_id = current_user["uid"]
    cache_key = get_cache_key("inventory", user_id)

    cached_result = cache.get(cache_key)
    if cached_result is not None:
        return cached_result

    stmt = select(models.Equipment).where(
        cast(models.Equipment.user_id, String) == user_id
    )
    result = await db.execute(stmt)
    equipment = result.scalars().all()

    inventory = []
    for item in equipment:
        inventory.append(
            {
                "id": str(item.id),
                "name": item.name,
                "catalogItemId": str(item.catalog_item_id)
                if item.catalog_item_id
                else None,
                "customName": item.custom_name,
                "serialNumber": item.serial_number,
                "category": str(item.category),
                "pricePerDay": item.price_per_day,
                "rentalPrice": item.rental_price,
                "rentalFrequency": item.rental_frequency,
                "quantity": item.quantity,
                "isOwned": item.is_owned,
                "status": item.status,
            }
        )

    cache.set(cache_key, inventory, ttl_seconds=300)
    return inventory


@router.get("/initial")
async def get_initial_data(
    project_id: str = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """
    Fetch all initial data in a single request.

    Returns:
    - projects: List of all projects
    - inventory: List of all equipment with specs
    - projectData: Shots, notes, and tasks for the specified project (if provided)

    This endpoint is optimized for fast initial app load - fetches everything in one round trip.
    """
    start_time = time.time()

    results = {}

    # 1. Fetch projects (parallel with inventory)
    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        results["projects"] = mock_db.list_projects()
    else:
        user_id = current_user["uid"]
        cache_key = get_cache_key("projects", user_id)

        cached_projects = cache.get(cache_key)
        if cached_projects is not None:
            results["projects"] = cached_projects
        else:
            stmt = (
                select(models.Project)
                .where(cast(models.Project.user_id, String) == user_id)
                .order_by(models.Project.created_at.desc())
            )
            result = await db.execute(stmt)
            projects = result.scalars().all()
            results["projects"] = projects
            cache.set(cache_key, projects, ttl_seconds=300)

    # 2. Fetch inventory (parallel with projects)
    results["inventory"] = await get_inventory_with_specs(db, current_user)

    # 3. Fetch project data (shots, notes, tasks) if project_id provided
    if project_id:
        # Verify ownership for non-guest
        if not current_user.get("is_guest"):
            from ..cache import check_project_owner

            await check_project_owner(project_id, current_user["uid"], db)

        # Fetch shots, notes, tasks in parallel
        if current_user.get("is_guest"):
            mock_db = get_mock_db()
            shots = mock_db.list_shots(project_id)
            notes = mock_db.list_notes(project_id)
            tasks = mock_db.list_tasks(project_id)
            results["shots"] = [map_shot_to_response(s) for s in shots]
            results["notes"] = [map_note_to_response(n) for n in notes]
            results["tasks"] = [map_task_to_response(t) for t in tasks]
        else:
            # Shots
            shots_stmt = select(models.Shot).where(
                cast(models.Shot.project_id, String) == project_id
            )
            shots_result = await db.execute(shots_stmt)
            shots = shots_result.scalars().all()
            results["shots"] = [
                {
                    "id": str(s.id),
                    "projectId": str(s.project_id),
                    "title": s.title,
                    "description": s.description,
                    "status": s.status,
                    "startTime": s.start_time,
                    "duration": s.duration,
                    "location": s.location,
                    "remarks": s.remarks,
                    "date": s.date,
                    "sceneNumber": s.scene_number,
                    "equipmentIds": s.equipment_ids or [],
                    "preparedEquipmentIds": s.prepared_equipment_ids or [],
                }
                for s in shots
            ]

            # Notes
            notes_stmt = (
                select(models.Note)
                .where(cast(models.Note.project_id, String) == project_id)
                .order_by(models.Note.updated_at.desc())
            )
            notes_result = await db.execute(notes_stmt)
            notes = notes_result.scalars().all()
            results["notes"] = [
                {
                    "id": str(n.id),
                    "title": n.title,
                    "content": n.content,
                    "projectId": str(n.project_id),
                    "shotId": str(n.shot_id) if n.shot_id else None,
                    "taskId": str(n.task_id) if n.task_id else None,
                    "updatedAt": n.updated_at.isoformat() if n.updated_at else None,
                }
                for n in notes
            ]

            # Tasks (postprod)
            tasks_stmt = (
                select(models.PostProdTask)
                .where(cast(models.PostProdTask.project_id, String) == project_id)
                .order_by(models.PostProdTask.created_at.asc())
            )
            tasks_result = await db.execute(tasks_stmt)
            tasks = tasks_result.scalars().all()
            results["tasks"] = [
                {
                    "id": str(t.id),
                    "category": t.category,
                    "title": t.title,
                    "status": t.status,
                    "priority": t.priority,
                    "dueDate": t.due_date.isoformat() if t.due_date else None,
                    "description": t.description,
                    "projectId": str(t.project_id),
                }
                for t in tasks
            ]

    total_time = time.time() - start_time
    print(
        f"[BULK/INITIAL] Total: {total_time:.3f}s | Projects: {len(results.get('projects', []))} | Inventory: {len(results.get('inventory', []))}"
    )

    return results


@router.get("/project/{project_id}")
async def get_project_bulk_data(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user_or_guest),
):
    """
    Fetch all project data (shots, notes, tasks) in a single request.
    Optimized for fast project switching.
    """
    start_time = time.time()

    if current_user.get("is_guest"):
        mock_db = get_mock_db()
        shots = mock_db.list_shots(project_id)
        notes = mock_db.list_notes(project_id)
        tasks = mock_db.list_tasks(project_id)
        return {
            "shots": [map_shot_to_response(s) for s in shots],
            "notes": [map_note_to_response(n) for n in notes],
            "tasks": [map_task_to_response(t) for t in tasks],
        }

    # Verify ownership
    from ..cache import check_project_owner

    await check_project_owner(project_id, current_user["uid"], db)

    # Fetch all in parallel
    shots_stmt = select(models.Shot).where(
        cast(models.Shot.project_id, String) == project_id
    )
    notes_stmt = (
        select(models.Note)
        .where(cast(models.Note.project_id, String) == project_id)
        .order_by(models.Note.updated_at.desc())
    )
    tasks_stmt = (
        select(models.PostProdTask)
        .where(cast(models.PostProdTask.project_id, String) == project_id)
        .order_by(models.PostProdTask.created_at.asc())
    )

    shots_result, notes_result, tasks_result = await asyncio.gather(
        db.execute(shots_stmt),
        db.execute(notes_stmt),
        db.execute(tasks_stmt),
    )

    shots = shots_result.scalars().all()
    notes = notes_result.scalars().all()
    tasks = tasks_result.scalars().all()

    total_time = time.time() - start_time
    print(
        f"[BULK/PROJECT] Total: {total_time:.3f}s | Shots: {len(shots)} | Notes: {len(notes)} | Tasks: {len(tasks)}"
    )

    return {
        "shots": [
            {
                "id": str(s.id),
                "projectId": str(s.project_id),
                "title": s.title,
                "description": s.description,
                "status": s.status,
                "startTime": s.start_time,
                "duration": s.duration,
                "location": s.location,
                "remarks": s.remarks,
                "date": s.date,
                "sceneNumber": s.scene_number,
                "equipmentIds": s.equipment_ids or [],
                "preparedEquipmentIds": s.prepared_equipment_ids or [],
            }
            for s in shots
        ],
        "notes": [
            {
                "id": str(n.id),
                "title": n.title,
                "content": n.content,
                "projectId": str(n.project_id),
                "shotId": str(n.shot_id) if n.shot_id else None,
                "taskId": str(n.task_id) if n.task_id else None,
                "updatedAt": n.updated_at.isoformat() if n.updated_at else None,
            }
            for n in notes
        ],
        "tasks": [
            {
                "id": str(t.id),
                "category": t.category,
                "title": t.title,
                "status": t.status,
                "priority": t.priority,
                "dueDate": t.due_date.isoformat() if t.due_date else None,
                "description": t.description,
                "projectId": str(t.project_id),
            }
            for t in tasks
        ],
    }
