"""
Mock data module for Guest Mode
Provides in-memory storage and fixtures for demo purposes
"""

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
    get_mock_project_data,
    get_mock_inventory,
    get_mock_catalog,
)
from .mock_db import (
    MockDatabase,
    get_mock_db,
    is_guest_user,
)

__all__ = [
    "GUEST_USER_UID",
    "MOCK_PROJECT",
    "MOCK_SHOTS",
    "MOCK_INVENTORY",
    "MOCK_NOTES",
    "MOCK_POSTPROD_TASKS",
    "MOCK_CATALOG_CATEGORIES",
    "MOCK_CATALOG_BRANDS",
    "MOCK_CATALOG_ITEMS",
    "get_mock_project_data",
    "get_mock_inventory",
    "get_mock_catalog",
    "MockDatabase",
    "get_mock_db",
    "is_guest_user",
]
