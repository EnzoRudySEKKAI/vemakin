from pydantic import BaseModel, Field, AliasChoices
from typing import List, Optional, Any, Dict, Union
from datetime import datetime
import uuid


# --- User ---
class UserBase(BaseModel):
    email: str
    name: Optional[str] = None


class UserCreate(UserBase):
    id: str  # UID from Firebase


class User(UserBase):
    id: str

    class Config:
        from_attributes = True


# --- Equipment ---
class EquipmentBase(BaseModel):
    id: Optional[Union[str, uuid.UUID]] = None
    name: str
    catalog_item_id: Optional[Union[str, uuid.UUID]] = None
    custom_name: Optional[str] = None
    serial_number: Optional[str] = None
    category: str
    price_per_day: float
    rental_price: Optional[float] = None
    rental_frequency: Optional[str] = None
    quantity: int
    is_owned: bool
    status: str
    brand_name: Optional[str] = None
    model_name: Optional[str] = None


class EquipmentCreate(EquipmentBase):
    pass


class Equipment(EquipmentBase):
    class Config:
        from_attributes = True


# --- Shot ---
class ShotBase(BaseModel):
    id: Optional[Union[str, uuid.UUID]] = None
    title: str
    description: str
    status: str
    startTime: Optional[str] = None
    duration: str
    location: str
    remarks: Optional[str] = None
    date: str
    sceneNumber: Optional[str] = None
    equipmentIds: List[Union[str, uuid.UUID]] = []
    preparedEquipmentIds: List[Union[str, uuid.UUID]] = []


class ShotCreate(ShotBase):
    pass


class Shot(ShotBase):
    project_id: Union[str, uuid.UUID]

    class Config:
        from_attributes = True


# --- PostProdTask ---
class PostProdTaskBase(BaseModel):
    id: Optional[Union[str, uuid.UUID]] = None
    category: str
    title: str
    status: str
    priority: str
    dueDate: Optional[str] = None
    description: Optional[str] = None


class PostProdTaskCreate(PostProdTaskBase):
    pass


class PostProdTask(PostProdTaskBase):
    project_id: Union[str, uuid.UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Project ---
class ProjectBase(BaseModel):
    name: str


class ProjectCreate(ProjectBase):
    pass


class Project(ProjectBase):
    id: Union[str, uuid.UUID]
    user_id: str
    created_at: datetime
    shots: List[Shot] = []
    # notes: List[Note] = []
    # tasks: List[PostProdTask] = []

    class Config:
        from_attributes = True


# --- Note ---
class NoteBase(BaseModel):
    id: Optional[Union[str, uuid.UUID]] = None
    title: str
    content: str
    shotId: Optional[Union[str, uuid.UUID]] = Field(None, validation_alias=AliasChoices("shot_id", "shotId"), serialization_alias="shotId")
    taskId: Optional[Union[str, uuid.UUID]] = Field(None, validation_alias=AliasChoices("task_id", "taskId"), serialization_alias="taskId")


class NoteCreate(NoteBase):
    pass


class Note(NoteBase):
    project_id: Union[str, uuid.UUID]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Catalog ---


class BrandBase(BaseModel):
    name: str


class Brand(BrandBase):
    id: Union[str, uuid.UUID]

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str
    slug: str


class Category(CategoryBase):
    id: Union[str, uuid.UUID]

    class Config:
        from_attributes = True


class GearCatalogBase(BaseModel):
    brand_id: Union[str, uuid.UUID]
    category_id: Union[str, uuid.UUID]
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    specs: Dict[str, Any] = {}


class GearCatalog(GearCatalogBase):
    id: Union[str, uuid.UUID]
    created_at: datetime

    class Config:
        from_attributes = True


# --- Pagination ---


class PaginatedShotResponse(BaseModel):
    items: List[Shot]
    total: int
    page: int
    limit: int
    has_more: bool

    class Config:
        from_attributes = True


class PaginatedNoteResponse(BaseModel):
    items: List[Note]
    total: int
    page: int
    limit: int
    has_more: bool

    class Config:
        from_attributes = True


class PaginatedTaskResponse(BaseModel):
    items: List[PostProdTask]
    total: int
    page: int
    limit: int
    has_more: bool

    class Config:
        from_attributes = True
