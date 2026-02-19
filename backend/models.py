from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel
from typing import List, Optional, Dict

# SQLAlchemy Models (Database Tables)
class ProductDB(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(String)
    price = Column(Float)
    category = Column(String)
    image = Column(String)
    specs = Column(JSON) # Store specs as JSON
    skv = Column(String, unique=True, nullable=True) # Seller Known Value
    mrp = Column(Float, nullable=True) # Maximum Retail Price
    sale_price = Column(Float, nullable=True) # Discounted Price
    features = Column(JSON, nullable=True) # Bullet points
    stock = Column(Integer, default=0) # Real Stock Quantity

class UserDB(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="user") # 'admin' or 'user'
    is_active = Column(Boolean, default=True)
    is_2fa_enabled = Column(Boolean, default=False)
    # For a real app, you'd store the 2FA secret here securely
    two_factor_secret = Column(String, nullable=True)

class OrderDB(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_email = Column(String, index=True)
    total_amount = Column(Float)
    status = Column(String, default="pending")
    items = Column(JSON) # Store items as JSON for simplicity
    
    # Payment & Shipping Details
    txnid = Column(String, unique=True, index=True, nullable=True)
    full_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address_line = Column(String, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    pincode = Column(String, nullable=True)

# Pydantic Schemas (API Request/Response)
class ProductBase(BaseModel):
    title: str
    description: str
    price: float
    category: str
    image: str
    specs: Optional[Dict[str, str]] = None
    skv: Optional[str] = None
    mrp: Optional[float] = None
    sale_price: Optional[float] = None
    features: Optional[List[str]] = None
    stock: int = 0

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

class OrderItem(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float
    customer_email: str
    status: str = "pending"

class Order(OrderCreate):
    id: int
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class UserBase(BaseModel):
    email: str
    full_name: str | None = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    
    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_name: str
    role: str

class TokenData(BaseModel):
    email: str | None = None


    email: str | None = None

class ReviewDB(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    user_name = Column(String)
    rating = Column(Integer)
    comment = Column(String)
    created_at = Column(String) # Store as ISO string for simplicity

class ReviewCreate(BaseModel):
    user_name: str
    rating: int
    comment: str

class ReviewResponse(ReviewCreate):
    id: int
    created_at: str
    class Config:
        from_attributes = True
