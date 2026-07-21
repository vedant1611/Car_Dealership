import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
from models import User

# Use an in-memory SQLite database for fast and isolated testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def test_create_user_in_db():
    # Setup test database schema
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    try:
        # Arrange
        new_user = User(email="test@example.com", hashed_password="hashed_secret")
        
        # Act
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Assert user was created successfully with an ID
        assert new_user.id is not None
        assert new_user.email == "test@example.com"
        
        # INTENTIONAL FAILURE FOR TDD:
        # Asserting a field 'is_active' that we haven't implemented yet in models.py
        assert hasattr(new_user, "is_active") and new_user.is_active is True, "User should have an is_active field defaulting to True"
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
