from sqlalchemy.orm import Session
import models
import schemas
import security

# --- User CRUD ---
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = security.get_password_hash(user.password)
    db_user = models.User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Vehicle CRUD ---
def get_vehicles(db: Session):
    return db.query(models.Vehicle).all()

def get_vehicle_by_id(db: Session, vehicle_id: int):
    return db.query(models.Vehicle).filter(models.Vehicle.id == vehicle_id).first()

def create_vehicle(db: Session, vehicle: schemas.VehicleCreate):
    db_vehicle = models.Vehicle(**vehicle.model_dump())
    db.add(db_vehicle)
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def update_vehicle(db: Session, db_vehicle: models.Vehicle, vehicle_data: schemas.VehicleCreate):
    db_vehicle.make = vehicle_data.make
    db_vehicle.model = vehicle_data.model
    db_vehicle.category = vehicle_data.category
    db_vehicle.price = vehicle_data.price
    db_vehicle.quantity = vehicle_data.quantity
    db.commit()
    db.refresh(db_vehicle)
    return db_vehicle

def delete_vehicle(db: Session, db_vehicle: models.Vehicle):
    db.delete(db_vehicle)
    db.commit()
