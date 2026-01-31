from sqlalchemy.orm import Session
from sqlalchemy import text
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
    "grip": models.GripSpecs
}

def get_item_specs(db: Session, item_id: uuid.UUID, category_id: uuid.UUID):
    # Find category slug
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if not category or category.slug not in SPECS_MODELS_MAPPING:
        return {}
    
    spec_model = SPECS_MODELS_MAPPING[category.slug]
    result = db.query(spec_model).filter(spec_model.gear_id == item_id).first()
    
    if not result:
        return {}
        
    def to_camel_case(snake_str):
        components = snake_str.split('_')
        return components[0] + ''.join(x.title() for x in components[1:])

    # Convert ORM object to dict (excluding internal SQLAlchemy state and gear_id)
    return {to_camel_case(c.name): getattr(result, c.name) for c in result.__table__.columns if c.name != 'gear_id'}
