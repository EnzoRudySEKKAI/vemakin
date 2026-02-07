from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
    Text,
    JSON,
    Float,
    Index,
    desc,
)
from sqlalchemy.orm import relationship
from .base import Base
from datetime import datetime
from sqlalchemy.dialects.postgresql import UUID
import uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String(128), primary_key=True, index=True)  # Firebase UID
    email = Column(String, unique=True, index=True)
    name = Column(String)

    projects = relationship("Project", back_populates="owner")
    inventory = relationship("Equipment", back_populates="owner")


class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False, index=True)
    user_id = Column(String(128), ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    owner = relationship("User", back_populates="projects")
    shots = relationship("Shot", back_populates="project", cascade="all, delete-orphan")
    notes = relationship("Note", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship(
        "PostProdTask", back_populates="project", cascade="all, delete-orphan"
    )

    __table_args__ = (Index("ix_projects_user_created", "user_id", desc("created_at")),)


class Shot(Base):
    __tablename__ = "shots"

    id = Column(
        String, primary_key=True, index=True
    )  # ID from frontend is string hash usually
    project_id = Column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True
    )

    title = Column(String, nullable=False)
    description = Column(Text, default="")
    status = Column(
        String, nullable=False, default="pending", index=True
    )  # 'pending', 'done'
    start_time = Column(String, nullable=True)  # '08:00'
    duration = Column(String, default="1h")  # '2h'
    location = Column(String, default="")
    remarks = Column(Text, default="")
    date = Column(String, nullable=True, index=True)
    scene_number = Column(String, nullable=True)

    # Store lists as simple JSON for simplicity in MVP
    equipment_ids = Column(JSON, default=list)  # List of strings
    prepared_equipment_ids = Column(JSON, default=list)

    project = relationship("Project", back_populates="shots")
    # Relation to notes if needed, or link via ID

    __table_args__ = (
        Index("ix_notes_project_updated", "project_id", desc("updated_at")),
    )


class Equipment(Base):
    __tablename__ = "user_inventory"  # Matching the existing table name hint

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String(128), ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    catalog_item_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), nullable=True, index=True
    )
    custom_name = Column(String, nullable=True)
    category = Column(String, nullable=False, default="Other", index=True)
    serial_number = Column(String, nullable=True)
    price_per_day = Column(Float, default=0.0)
    rental_price = Column(Float, nullable=True)
    rental_frequency = Column(String, nullable=True)
    quantity = Column(Integer, default=1)
    is_owned = Column(Boolean, default=True)
    status = Column(
        String, default="operational", index=True
    )  # 'operational', 'maintenance'

    owner = relationship("User", back_populates="inventory")

    __table_args__ = (
        Index("ix_equipment_user_status_category", "user_id", "status", "category"),
    )


class Note(Base):
    __tablename__ = "notes"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True
    )

    title = Column(String, nullable=False)
    content = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
        index=True,
    )

    shot_id = Column(String, nullable=True, index=True)  # Optional link to shot
    task_id = Column(String, nullable=True, index=True)  # Optional link to task

    project = relationship("Project", back_populates="notes")

    __table_args__ = (
        Index("ix_notes_project_updated", "project_id", desc("updated_at")),
    )


class PostProdTask(Base):
    __tablename__ = "post_prod_tasks"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(
        UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False, index=True
    )

    category = Column(String, default="Editing")
    title = Column(String, nullable=False)
    status = Column(
        String, default="todo", index=True
    )  # 'todo', 'progress', 'review', 'done'
    priority = Column(
        String, default="medium", index=True
    )  # 'low', 'medium', 'high', 'critical'
    due_date = Column(String, nullable=True, index=True)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    project = relationship("Project", back_populates="tasks")

    __table_args__ = (
        Index(
            "ix_tasks_project_status_priority",
            "project_id",
            "status",
            "priority",
            "due_date",
        ),
    )


# --- Catalog ---


class Brand(Base):
    __tablename__ = "brands"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)


class Category(Base):
    __tablename__ = "categories"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, nullable=False)


class GearCatalog(Base):
    __tablename__ = "gear_catalog"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    brand_id = Column(
        UUID(as_uuid=True), ForeignKey("brands.id"), nullable=False, index=True
    )
    category_id = Column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False, index=True
    )
    name = Column(String, nullable=False, index=True)
    description = Column(Text)
    image_url = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    __table_args__ = (
        Index("ix_gear_catalog_category_brand", "category_id", "brand_id"),
    )

    # Individual spec relationships
    camera_specs = relationship(
        "CameraSpecs",
        uselist=False,
        back_populates="gear",
        cascade="all, delete-orphan",
    )
    lens_specs = relationship(
        "LensSpecs", uselist=False, back_populates="gear", cascade="all, delete-orphan"
    )
    audio_specs = relationship(
        "AudioSpecs", uselist=False, back_populates="gear", cascade="all, delete-orphan"
    )
    light_specs = relationship(
        "LightSpecs", uselist=False, back_populates="gear", cascade="all, delete-orphan"
    )
    monitor_specs = relationship(
        "MonitorSpecs",
        uselist=False,
        back_populates="gear",
        cascade="all, delete-orphan",
    )
    prop_specs = relationship(
        "PropSpecs", uselist=False, back_populates="gear", cascade="all, delete-orphan"
    )
    stabilizer_specs = relationship(
        "StabilizerSpecs",
        uselist=False,
        back_populates="gear",
        cascade="all, delete-orphan",
    )
    tripod_specs = relationship(
        "TripodSpecs",
        uselist=False,
        back_populates="gear",
        cascade="all, delete-orphan",
    )
    wireless_specs = relationship(
        "WirelessSpecs",
        uselist=False,
        back_populates="gear",
        cascade="all, delete-orphan",
    )
    drone_specs = relationship(
        "DroneSpecs", uselist=False, back_populates="gear", cascade="all, delete-orphan"
    )
    filter_specs = relationship(
        "FilterSpecs",
        uselist=False,
        back_populates="gear",
        cascade="all, delete-orphan",
    )
    grip_specs = relationship(
        "GripSpecs", uselist=False, back_populates="gear", cascade="all, delete-orphan"
    )


# --- Specialized Specs ---


class CameraSpecs(Base):
    __tablename__ = "specs_cameras"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    sensor = Column(String)
    resolution = Column(String)
    mount = Column(String)
    dynamic_range = Column(String)
    native_iso = Column(String)
    media = Column(String)
    frame_rate = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="camera_specs")


class LensSpecs(Base):
    __tablename__ = "specs_lenses"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    focal_length = Column(String)
    aperture = Column(String)
    mount = Column(String)
    coverage = Column(String)
    focus_type = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="lens_specs")


class AudioSpecs(Base):
    __tablename__ = "specs_audio"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    type = Column(String)
    pattern = Column(String)
    freq_response = Column(String)
    sensitivity = Column(String)
    max_spl = Column(String)
    power = Column(String)
    connector = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="audio_specs")


class LightSpecs(Base):
    __tablename__ = "specs_lights"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    type = Column(String)
    power_draw = Column(String)
    color_temp = Column(String)
    cri = Column(String)
    mount = Column(String)
    control = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="light_specs")


class MonitorSpecs(Base):
    __tablename__ = "specs_monitoring"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    screen = Column(String)
    resolution = Column(String)
    brightness = Column(String)
    inputs = Column(String)
    power = Column(String)
    features = Column(String)
    dimensions = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="monitor_specs")


class PropSpecs(Base):
    __tablename__ = "specs_props"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    type = Column(String)
    era = Column(String)
    material = Column(String)
    condition = Column(String)
    quantity = Column(String)
    dimensions = Column(String)
    power = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="prop_specs")


class StabilizerSpecs(Base):
    __tablename__ = "specs_stabilizers"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    type = Column(String)
    max_payload = Column(String)
    axes = Column(String)
    battery_life = Column(String)
    connectivity = Column(String)
    dimensions = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="stabilizer_specs")


class TripodSpecs(Base):
    __tablename__ = "specs_tripods"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    head_type = Column(String)
    max_payload = Column(String)
    bowl_size = Column(String)
    height_range = Column(String)
    material = Column(String)
    counterbalance = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="tripod_specs")


class WirelessSpecs(Base):
    __tablename__ = "specs_wireless"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    range = Column(String)
    delay = Column(String)
    resolution = Column(String)
    inputs = Column(String)
    freq = Column(String)
    power = Column(String)
    multicast = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="wireless_specs")


class DroneSpecs(Base):
    __tablename__ = "specs_drones"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    type = Column(String)
    camera = Column(String)
    res = Column(String)
    flight_time = Column(String)
    transmission = Column(String)
    sensors = Column(String)
    speed = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="drone_specs")


class FilterSpecs(Base):
    __tablename__ = "specs_filters"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    type = Column(String)
    density = Column(String)
    size = Column(String)
    stops = Column(String)
    effect = Column(String)
    strength = Column(String)
    mount = Column(String)
    material = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="filter_specs")


class GripSpecs(Base):
    __tablename__ = "specs_grip"
    gear_id = Column(
        UUID(as_uuid=True), ForeignKey("gear_catalog.id"), primary_key=True
    )
    type = Column(String)
    max_load = Column(String)
    max_height = Column(String)
    min_height = Column(String)
    footprint = Column(String)
    material = Column(String)
    mount = Column(String)
    weight = Column(String)
    gear = relationship("GearCatalog", back_populates="grip_specs")
