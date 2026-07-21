from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db, engine, Base
import models
import schemas
import security

# Create tables in the DB
Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/api/health")
def read_health():
    return {"status": "ok"}

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password and save new user
    hashed_password = security.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password)
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


