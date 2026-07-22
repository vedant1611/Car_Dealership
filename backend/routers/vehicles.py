from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import schemas, crud, security
from database import get_db

router = APIRouter(prefix="/api/vehicles", tags=["vehicles"])

@router.post("", response_model=schemas.VehicleResponse)
def create_vehicle(
    vehicle: schemas.VehicleCreate, 
    db: Session = Depends(get_db), 
    current_user: str = Depends(security.get_current_user)
):
    return crud.create_vehicle(db, vehicle)

def get_current_admin(current_user: str = Depends(security.get_current_user), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email=current_user)
    if not user or not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return current_user

@router.get("", response_model=list[schemas.VehicleResponse])
def get_vehicles(
    min_price: float = None,
    max_price: float = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(security.get_current_user)
):
    return crud.get_vehicles(db, min_price=min_price, max_price=max_price)

@router.get("/{vehicle_id}", response_model=schemas.VehicleResponse)
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(security.get_current_user)
):
    db_vehicle = crud.get_vehicle_by_id(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return db_vehicle

@router.put("/{vehicle_id}", response_model=schemas.VehicleResponse)
def update_vehicle(
    vehicle_id: int,
    vehicle_data: schemas.VehicleCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(security.get_current_user)
):
    db_vehicle = crud.get_vehicle_by_id(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return crud.update_vehicle(db, db_vehicle, vehicle_data)

@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(security.get_current_user)
):
    db_vehicle = crud.get_vehicle_by_id(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    crud.delete_vehicle(db, db_vehicle)
    return None

@router.post("/{vehicle_id}/purchase", response_model=schemas.VehicleResponse)
def purchase_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(security.get_current_user)
):
    db_vehicle = crud.get_vehicle_by_id(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    if db_vehicle.quantity <= 0:
        raise HTTPException(status_code=400, detail="Vehicle is out of stock")
    
    db_vehicle.quantity -= 1
    db.commit()
    db.refresh(db_vehicle)
    
    return db_vehicle

@router.post("/{vehicle_id}/restock", response_model=schemas.VehicleResponse)
def restock_vehicle(
    vehicle_id: int,
    restock_data: schemas.RestockUpdate,
    db: Session = Depends(get_db),
    current_admin: str = Depends(get_current_admin)
):
    db_vehicle = crud.get_vehicle_by_id(db, vehicle_id)
    if not db_vehicle:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    
    return crud.restock_vehicle(db, db_vehicle, restock_data.quantity)
