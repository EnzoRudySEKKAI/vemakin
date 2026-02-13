from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from ..models import models
import uuid

SPECS_MODELS_MAPPING = {
    "audio": models.AudioSpecs,
    "camera": models.CameraSpecs,
    "lens": models.LensSpecs,
    "light": models.LightSpecs,
    "monitor": models.MonitorSpecs,
    "prop": models.PropSpecs,
    "stabilizer": models.StabilizerSpecs,
    "tripod": models.TripodSpecs,
    "wireless": models.WirelessSpecs,
    "drone": models.DroneSpecs,
    "filter": models.FilterSpecs,
    "grip": models.GripSpecs,
}


async def get_item_specs(db: AsyncSession, item_id: uuid.UUID, category_id: uuid.UUID):
    # Find category slug
    stmt = select(models.Category).where(models.Category.id == category_id)
    result = await db.execute(stmt)
    category = result.scalars().first()
    if not category or category.slug not in SPECS_MODELS_MAPPING:
        return {}

    spec_model = SPECS_MODELS_MAPPING[category.slug]
    stmt = select(spec_model).where(spec_model.gear_id == item_id)
    result = await db.execute(stmt)
    spec_result = result.scalars().first()

    if not spec_result:
        return {}

    def to_camel_case(snake_str):
        components = snake_str.split("_")
        return components[0] + "".join(x.title() for x in components[1:])

    # Convert ORM object to dict (excluding internal SQLAlchemy state and gear_id)
    return {
        to_camel_case(c.name): getattr(spec_result, c.name)
        for c in spec_result.__table__.columns
        if c.name != "gear_id"
    }
