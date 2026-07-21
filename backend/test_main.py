from fastapi.testclient import TestClient
from main import app
from database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Use isolated in-memory SQLite DB for endpoint tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

import models # Import models so Base.metadata knows about them
Base.metadata.create_all(bind=engine)

# Dependency override function
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_read_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_register_user():
    response = client.post(
        "/api/auth/register",
        json={"email": "newuser@example.com", "password": "securepassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "newuser@example.com"
    assert "id" in data
    assert data["is_active"] is True

def test_register_duplicate_user():
    # Register the same user again should fail
    response = client.post(
        "/api/auth/register",
        json={"email": "newuser@example.com", "password": "securepassword2"}
    )
    assert response.status_code == 400
    assert response.json() == {"detail": "Email already registered"}

def test_login_user():
    # Ensure the user is registered first
    client.post(
        "/api/auth/register",
        json={"email": "login@example.com", "password": "loginpassword"}
    )
    
    # Attempt to login
    response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "loginpassword"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

