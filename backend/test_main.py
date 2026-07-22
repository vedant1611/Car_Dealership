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

def test_update_vehicle_authenticated():
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
        "make": "Ford",
        "model": "Mustang",
        "category": "Coupe",
        "price": 35000.0,
        "quantity": 2
    }
    post_response = client.post("/api/vehicles", json=vehicle_payload, headers=headers)
    assert post_response.status_code == 200
    created_vehicle = post_response.json()
    vehicle_id = created_vehicle["id"]

    # Attempt to update the vehicle's price and quantity
    update_payload = {
        "make": "Ford",
        "model": "Mustang",
        "category": "Coupe",
        "price": 34000.0,
        "quantity": 4
    }
    put_response = client.put(f"/api/vehicles/{vehicle_id}", json=update_payload, headers=headers)
    
    # We expect this to fail initially since the PUT endpoint doesn't exist
    assert put_response.status_code == 200
    updated_vehicle = put_response.json()
    assert updated_vehicle["price"] == 34000.0
    assert updated_vehicle["quantity"] == 4

def test_delete_vehicle_authenticated():
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
        "make": "Chevrolet",
        "model": "Camaro",
        "category": "Coupe",
        "price": 36000.0,
        "quantity": 1
    }
    post_response = client.post("/api/vehicles", json=vehicle_payload, headers=headers)
    assert post_response.status_code == 200
    vehicle_id = post_response.json()["id"]

    # Attempt to delete the vehicle
    delete_response = client.delete(f"/api/vehicles/{vehicle_id}", headers=headers)
    
    # We expect this to fail initially since the DELETE endpoint doesn't exist
    assert delete_response.status_code in (200, 204)
    
    # Assert that fetching the specific vehicle returns a 404
    get_response = client.get(f"/api/vehicles/{vehicle_id}", headers=headers)
    assert get_response.status_code == 404

def test_restock_vehicle_admin():
    # Login as admin
    client.post(
        "/api/auth/register",
        json={"email": "admin@admin.com", "password": "adminpassword"}
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "admin@admin.com", "password": "adminpassword"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create a vehicle
    vehicle_payload = {
        "make": "Tesla",
        "model": "Model S",
        "category": "Sedan",
        "price": 80000.0,
        "quantity": 1
    }
    post_response = client.post("/api/vehicles", json=vehicle_payload, headers=headers)
    vehicle_id = post_response.json()["id"]

    # Restock the vehicle
    restock_payload = {"quantity": 5}
    restock_response = client.post(f"/api/vehicles/{vehicle_id}/restock", json=restock_payload, headers=headers)
    assert restock_response.status_code == 200
    assert restock_response.json()["quantity"] == 6

def test_restock_vehicle_non_admin():
    # Login as regular user
    client.post(
        "/api/auth/register",
        json={"email": "user@example.com", "password": "userpassword"}
    )
    login_response = client.post(
        "/api/auth/login",
        json={"email": "user@example.com", "password": "userpassword"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to restock an arbitrary vehicle id (e.g. 1)
    restock_payload = {"quantity": 5}
    restock_response = client.post(f"/api/vehicles/1/restock", json=restock_payload, headers=headers)
    
    # Should be forbidden (403) or not authorized since it's admin only
    assert restock_response.status_code in (401, 403)

def test_search_vehicles_with_price_range():
    # Login
    login_response = client.post(
        "/api/auth/login",
        json={"email": "login@example.com", "password": "loginpassword"}
    )
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Search with min and max price
    search_response = client.get("/api/vehicles?min_price=20000&max_price=30000", headers=headers)
    assert search_response.status_code == 200
    vehicles = search_response.json()
    for v in vehicles:
        assert 20000 <= v["price"] <= 30000

