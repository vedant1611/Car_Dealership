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

@router.get("", response_model=list[schemas.VehicleResponse])
def get_vehicles(
    db: Session = Depends(get_db),
    current_user: str = Depends(security.get_current_user)
):
    return crud.get_vehicles(db)

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
