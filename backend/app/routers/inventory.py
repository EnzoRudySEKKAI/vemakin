from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import models
from ..schemas import schemas
from ..auth import get_current_user
import uuid

router = APIRouter(
    prefix="/inventory",
    tags=["inventory"]
)

from . import catalog_utils

def enrich_equipment(db: Session, item: models.Equipment):
    # Default display values
    display_category = item.category
    display_name = item.name or (item.custom_name if item.custom_name else "New Equipment")
    
    # Try to get the category name if category is a UUID
    try:
        cat_uuid = uuid.UUID(item.category)
        cat = db.query(models.Category).filter(models.Category.id == cat_uuid).first()
        if cat:
            display_category = cat.name
    except (ValueError, TypeError):
        pass

    # If item.name is a UUID, we REALLY want to replace it with something readable
    try:
        name_as_uuid = uuid.UUID(display_name)
        # If the name is a UUID, it's likely a fallback to the model/category ID
        # Let's try to get the catalog item name if catalog_item_id exists
        if item.catalog_item_id:
            catalog_item = db.query(models.GearCatalog).filter(models.GearCatalog.id == item.catalog_item_id).first()
            if catalog_item:
                display_name = catalog_item.name
        elif display_category:
            # Fallback to category name if it's not a UUID
            try:
                uuid.UUID(display_category)
            except (ValueError, TypeError):
                display_name = display_category
    except (ValueError, TypeError):
        # Name is already a readable string
        pass

    item_dict = {
        "id": item.id, 
        "name": display_name, 
        "catalogItemId": item.catalog_item_id,
        "customName": item.custom_name, 
        "serialNumber": item.serial_number,
        "category": display_category, 
        "pricePerDay": item.price_per_day,
        "rentalPrice": item.rental_price, 
        "rentalFrequency": item.rental_frequency,
        "quantity": item.quantity, 
        "isOwned": bool(item.is_owned) if item.is_owned is not None else True,
        "status": item.status, 
        "specs": {}
    }
    
    if item.catalog_item_id:
        catalog_item = db.query(models.GearCatalog).filter(models.GearCatalog.id == item.catalog_item_id).first()
        if catalog_item:
            item_dict["specs"] = catalog_utils.get_item_specs(db, item.catalog_item_id, catalog_item.category_id)
            
    return item_dict

@router.get("")
def read_inventory(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Fetch equipment belonging to the current user
    inventory = db.query(models.Equipment).filter(models.Equipment.user_id == current_user['uid']).offset(skip).limit(limit).all()
    
    return [enrich_equipment(db, item) for item in inventory]

@router.post("")
def create_equipment(
    equipment: schemas.EquipmentCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Manually map CamelCase from Schema to SnakeCase for Model
    db_equipment = models.Equipment(
        id=equipment.id,
        user_id=current_user['uid'],
        name=equipment.name,
        catalog_item_id=equipment.catalogItemId,
        custom_name=equipment.customName,
        serial_number=equipment.serialNumber,
        category=equipment.category,
        price_per_day=equipment.pricePerDay,
        rental_price=equipment.rentalPrice,
        rental_frequency=equipment.rentalFrequency,
        quantity=equipment.quantity,
        is_owned=equipment.isOwned,
        status=equipment.status
    )
    db.add(db_equipment)
    
    try:
        db.commit()
        db.refresh(db_equipment)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
        
    return enrich_equipment(db, db_equipment)

@router.patch("/{equipment_id}")
def update_equipment(
    equipment_id: str,
    equipment_update: schemas.EquipmentCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    item = db.query(models.Equipment).filter(
        models.Equipment.id == equipment_id, 
        models.Equipment.user_id == current_user['uid']
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")

    item.name = equipment_update.name
    item.catalog_item_id = equipment_update.catalogItemId
    item.custom_name = equipment_update.customName
    item.serial_number = equipment_update.serialNumber
    item.category = equipment_update.category
    item.price_per_day = equipment_update.pricePerDay
    item.rental_price = equipment_update.rentalPrice
    item.rental_frequency = equipment_update.rentalFrequency
    item.quantity = equipment_update.quantity
    item.is_owned = equipment_update.isOwned
    item.status = equipment_update.status

    db.commit()
    db.refresh(item)
    return enrich_equipment(db, item)

@router.delete("/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_equipment(
    equipment_id: str,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    item = db.query(models.Equipment).filter(
        models.Equipment.id == equipment_id, 
        models.Equipment.user_id == current_user['uid']
    ).first()
    
    if not item:
        raise HTTPException(status_code=404, detail="Equipment not found")
        
    db.delete(item)
    db.commit()
    return None
