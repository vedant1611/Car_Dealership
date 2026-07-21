from fastapi import FastAPI
from database import engine
import models
from routers import auth, vehicles

# Initialize the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(vehicles.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
