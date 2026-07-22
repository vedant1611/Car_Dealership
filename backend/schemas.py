from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True

class VehicleCreate(BaseModel):
    make: str
    model: str
    category: str
    price: float
    quantity: int = 1

class RestockUpdate(BaseModel):
    quantity: int = Field(gt=0, description="Quantity must be strictly greater than 0")

class VehicleResponse(BaseModel):
    id: int
    make: str
    model: str
    category: str
    price: float
    quantity: int

    class Config:
        from_attributes = True
