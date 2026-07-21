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

def test_create_vehicle_authenticated():
    # Login to get the access token
    login_response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "loginpassword"}
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    # Use the token to attempt creating a vehicle
    headers = {"Authorization": f"Bearer {token}"}
    vehicle_payload = {
        "make": "Toyota",
        "model": "Camry",
        "category": "Sedan",
        "price": 25000.0,
        "quantity": 5
    }
    response = client.post("/api/vehicles", json=vehicle_payload, headers=headers)
    
    # We expect this to fail initially since the endpoint doesn't exist
    assert response.status_code == 200
    data = response.json()
    assert data["make"] == "Toyota"
    assert "id" in data

def test_get_vehicles_authenticated():
    # Login to get the access token
    login_response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "loginpassword"}
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a vehicle first
    vehicle_payload = {
        "make": "Honda",
        "model": "Civic",
        "category": "Sedan",
        "price": 22000.0,
        "quantity": 3
    }
    post_response = client.post("/api/vehicles", json=vehicle_payload, headers=headers)
    assert post_response.status_code == 200
    created_vehicle = post_response.json()

    # Attempt to fetch all vehicles
    get_response = client.get("/api/vehicles", headers=headers)
    
    # We expect this to fail initially since the GET endpoint doesn't exist
    assert get_response.status_code == 200
    vehicles = get_response.json()
    assert isinstance(vehicles, list)
    assert any(v["id"] == created_vehicle["id"] for v in vehicles)

