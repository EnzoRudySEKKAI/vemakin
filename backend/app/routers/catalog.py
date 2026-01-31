from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user
import uuid
from . import catalog_utils

router = APIRouter(
    prefix="/catalog",
    tags=["catalog"]
)

@router.get("/categories", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@router.get("/brands", response_model=List[schemas.Brand])
def get_brands(category_id: Optional[uuid.UUID] = None, db: Session = Depends(get_db)):
    query = db.query(models.Brand)
    if category_id:
        # Join with gear_catalog to find brands that have items in this category
        query = query.join(models.GearCatalog).filter(models.GearCatalog.category_id == category_id).distinct()
    return query.all()

@router.get("/items", response_model=List[schemas.GearCatalog])
def get_items(
    category_id: Optional[uuid.UUID] = None, 
    brand_id: Optional[uuid.UUID] = None, 
    db: Session = Depends(get_db)
):
    query = db.query(models.GearCatalog)
    if category_id:
        query = query.filter(models.GearCatalog.category_id == category_id)
    if brand_id:
        query = query.filter(models.GearCatalog.brand_id == brand_id)
    
    items = query.all()
    
    enriched_items = []
    for item in items:
        # Create dict from ORM object
        item_dict = {
            "id": item.id,
            "brand_id": item.brand_id,
            "category_id": item.category_id,
            "name": item.name,
            "description": item.description,
            "image_url": item.image_url,
            "created_at": item.created_at,
            "specs": catalog_utils.get_item_specs(db, item.id, item.category_id)
        }
        enriched_items.append(item_dict)
        
    return enriched_items

@router.get("/items/{item_id}", response_model=schemas.GearCatalog)
def get_item(item_id: uuid.UUID, db: Session = Depends(get_db)):
    item = db.query(models.GearCatalog).filter(models.GearCatalog.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    return {
        "id": item.id,
        "brand_id": item.brand_id,
        "category_id": item.category_id,
        "name": item.name,
        "description": item.description,
        "image_url": item.image_url,
        "created_at": item.created_at,
        "specs": catalog_utils.get_item_specs(db, item.id, item.category_id)
    }

@router.get("/items/{item_id}/specs")
def get_item_specs(item_id: uuid.UUID, db: Session = Depends(get_db)):
    item = db.query(models.GearCatalog).filter(models.GearCatalog.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    return catalog_utils.get_item_specs(db, item_id, item.category_id)
