from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, vehicles

# Initialize the database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# Configure CORS to allow requests from your Vercel frontend and local development
origins = [
    "https://car-dealership-nine-peach.vercel.app",
    "http://localhost:5173",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(vehicles.router)

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
