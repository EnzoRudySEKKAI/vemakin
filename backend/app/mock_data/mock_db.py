"""
Mock database layer for Guest Mode
Provides in-memory CRUD operations that persist during the session
"""

import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from copy import deepcopy
from .fixtures import (
    GUEST_USER_UID,
    MOCK_PROJECT,
    MOCK_SHOTS,
    MOCK_INVENTORY,
    MOCK_NOTES,
    MOCK_POSTPROD_TASKS,
    MOCK_CATALOG_CATEGORIES,
    MOCK_CATALOG_BRANDS,
    MOCK_CATALOG_ITEMS,
)


class MockDatabase:
    """
    In-memory database for guest mode.
    All changes persist during the session but are lost on server restart.
    """

    def __init__(self):
        # Deep copy fixtures to avoid modifying originals
        self.project = deepcopy(MOCK_PROJECT)
        self.shots: List[Dict[str, Any]] = deepcopy(MOCK_SHOTS)
        self.inventory: List[Dict[str, Any]] = deepcopy(MOCK_INVENTORY)
        self.notes: List[Dict[str, Any]] = deepcopy(MOCK_NOTES)
        self.tasks: List[Dict[str, Any]] = deepcopy(MOCK_POSTPROD_TASKS)
        self.catalog_categories = deepcopy(MOCK_CATALOG_CATEGORIES)
        self.catalog_brands = deepcopy(MOCK_CATALOG_BRANDS)
        self.catalog_items = deepcopy(MOCK_CATALOG_ITEMS)

    # =========================================================================
    # PROJECT OPERATIONS
    # =========================================================================

    def get_project(self, project_id: str) -> Optional[Dict[str, Any]]:
        if self.project["id"] == project_id:
            return deepcopy(self.project)
        return None

    def list_projects(self) -> List[Dict[str, Any]]:
        return [deepcopy(self.project)]

    def update_project(
        self, project_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        if self.project["id"] == project_id:
            self.project.update(data)
            self.project["updated_at"] = datetime.now().isoformat()
            return deepcopy(self.project)
        return None

    # =========================================================================
    # SHOTS OPERATIONS
    # =========================================================================

    def list_shots(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        shots = deepcopy(self.shots)
        if project_id:
            shots = [s for s in shots if s["project_id"] == project_id]
        return shots

    def get_shot(self, shot_id: str) -> Optional[Dict[str, Any]]:
        for shot in self.shots:
            if shot["id"] == shot_id:
                return deepcopy(shot)
        return None

    def create_shot(self, data: Dict[str, Any]) -> Dict[str, Any]:
        shot = {
            "id": data.get("id") or str(uuid.uuid4()),
            "project_id": data.get("project_id", self.project["id"]),
            "user_id": GUEST_USER_UID,
            "title": data.get("title", "Nouveau plan"),
            "description": data.get("description", ""),
            "date": data.get("date", datetime.now().strftime("%Y-%m-%d")),
            "start_time": data.get("start_time"),
            "duration": data.get("duration", "1h"),
            "status": data.get("status", "pending"),
            "location": data.get("location", ""),
            "remarks": data.get("remarks", ""),
            "scene_number": data.get("scene_number", ""),
            "equipment_ids": data.get("equipment_ids", []),
            "prepared_equipment_ids": data.get("prepared_equipment_ids", []),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        self.shots.append(shot)
        return deepcopy(shot)

    def update_shot(
        self, shot_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        for shot in self.shots:
            if shot["id"] == shot_id:
                shot.update(data)
                shot["updated_at"] = datetime.now().isoformat()
                return deepcopy(shot)
        return None

    def delete_shot(self, shot_id: str) -> bool:
        for i, shot in enumerate(self.shots):
            if shot["id"] == shot_id:
                del self.shots[i]
                return True
        return False

    # =========================================================================
    # INVENTORY OPERATIONS
    # =========================================================================

    def list_inventory(self) -> List[Dict[str, Any]]:
        return deepcopy(self.inventory)

    def get_inventory_item(self, item_id: str) -> Optional[Dict[str, Any]]:
        for item in self.inventory:
            if item["id"] == item_id:
                return deepcopy(item)
        return None

    def create_inventory_item(self, data: Dict[str, Any]) -> Dict[str, Any]:
        item = {
            "id": data.get("id") or str(uuid.uuid4()),
            "user_id": GUEST_USER_UID,
            "name": data.get("name", "Nouvel équipement"),
            "category": data.get("category", "Accessories"),
            "brand": data.get("brand", ""),
            "model": data.get("model", ""),
            "serial_number": data.get("serial_number", ""),
            "purchase_date": data.get("purchase_date"),
            "purchase_price": data.get("purchase_price", 0),
            "currency": data.get("currency", "EUR"),
            "price_per_day": data.get("price_per_day", 0),
            "rental_price": data.get("rental_price"),
            "rental_frequency": data.get("rental_frequency"),
            "quantity": data.get("quantity", 1),
            "is_owned": data.get("is_owned", True),
            "status": data.get("status", "available"),
            "notes": data.get("notes", ""),
            "catalog_item_id": data.get("catalog_item_id"),
            "custom_name": data.get("custom_name"),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        self.inventory.append(item)
        return deepcopy(item)

    def update_inventory_item(
        self, item_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        for item in self.inventory:
            if item["id"] == item_id:
                item.update(data)
                item["updated_at"] = datetime.now().isoformat()
                return deepcopy(item)
        return None

    def delete_inventory_item(self, item_id: str) -> bool:
        for i, item in enumerate(self.inventory):
            if item["id"] == item_id:
                del self.inventory[i]
                return True
        return False

    # =========================================================================
    # NOTES OPERATIONS
    # =========================================================================

    def list_notes(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        notes = deepcopy(self.notes)
        if project_id:
            notes = [n for n in notes if n["project_id"] == project_id]
        return notes

    def get_note(self, note_id: str) -> Optional[Dict[str, Any]]:
        for note in self.notes:
            if note["id"] == note_id:
                return deepcopy(note)
        return None

    def create_note(self, data: Dict[str, Any]) -> Dict[str, Any]:
        note = {
            "id": data.get("id", str(uuid.uuid4())),
            "project_id": data.get("project_id", self.project["id"]),
            "user_id": GUEST_USER_UID,
            "title": data.get("title", "Nouvelle note"),
            "content": data.get("content", ""),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        self.notes.append(note)
        return deepcopy(note)

    def update_note(
        self, note_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        for note in self.notes:
            if note["id"] == note_id:
                note.update(data)
                note["updated_at"] = datetime.now().isoformat()
                return deepcopy(note)
        return None

    def delete_note(self, note_id: str) -> bool:
        for i, note in enumerate(self.notes):
            if note["id"] == note_id:
                del self.notes[i]
                return True
        return False

    # =========================================================================
    # POST-PROD TASKS OPERATIONS
    # =========================================================================

    def list_tasks(self, project_id: Optional[str] = None) -> List[Dict[str, Any]]:
        tasks = deepcopy(self.tasks)
        if project_id:
            tasks = [t for t in tasks if t["project_id"] == project_id]
        return tasks

    def get_task(self, task_id: str) -> Optional[Dict[str, Any]]:
        for task in self.tasks:
            if task["id"] == task_id:
                return deepcopy(task)
        return None

    def create_task(self, data: Dict[str, Any]) -> Dict[str, Any]:
        task = {
            "id": data.get("id", str(uuid.uuid4())),
            "project_id": data.get("project_id", self.project["id"]),
            "user_id": GUEST_USER_UID,
            "title": data.get("title", "Nouvelle tâche"),
            "description": data.get("description", ""),
            "category": data.get("category", "Editing"),
            "status": data.get("status", "todo"),
            "priority": data.get("priority", "medium"),
            "due_date": data.get("due_date"),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
        }
        self.tasks.append(task)
        return deepcopy(task)

    def update_task(
        self, task_id: str, data: Dict[str, Any]
    ) -> Optional[Dict[str, Any]]:
        for task in self.tasks:
            if task["id"] == task_id:
                task.update(data)
                task["updated_at"] = datetime.now().isoformat()
                return deepcopy(task)
        return None

    def delete_task(self, task_id: str) -> bool:
        for i, task in enumerate(self.tasks):
            if task["id"] == task_id:
                del self.tasks[i]
                return True
        return False

    # =========================================================================
    # CATALOG OPERATIONS (Read-only)
    # =========================================================================

    def list_catalog_categories(self) -> List[Dict[str, Any]]:
        return deepcopy(self.catalog_categories)

    def list_catalog_brands(self) -> List[Dict[str, Any]]:
        return deepcopy(self.catalog_brands)

    def list_catalog_items(self) -> List[Dict[str, Any]]:
        return deepcopy(self.catalog_items)

    def get_catalog_item(self, item_id: str) -> Optional[Dict[str, Any]]:
        for item in self.catalog_items:
            if item["id"] == item_id:
                return deepcopy(item)
        return None


# Singleton instance - shared across requests during the session
_mock_db_instance: Optional[MockDatabase] = None


def get_mock_db() -> MockDatabase:
    """Returns the singleton mock database instance"""
    global _mock_db_instance
    if _mock_db_instance is None:
        _mock_db_instance = MockDatabase()
    return _mock_db_instance


def reset_mock_db():
    """Resets the mock database to initial state - useful for testing"""
    global _mock_db_instance
    _mock_db_instance = MockDatabase()


def is_guest_user(user_uid: str) -> bool:
    """Check if the user is the guest user"""
    return user_uid == GUEST_USER_UID
