from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base
from pydantic import BaseModel, field_validator
from typing import List, Optional, Dict, Any
from datetime import datetime# SQLAlchemy Models (Database Tables)
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
    two_factor_secret = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)

class OrderItemDB(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer)
    price_at_purchase = Column(Float) # Lock price at time of order

    order = relationship("OrderDB", back_populates="items")
    product = relationship("ProductDB")

class OrderDB(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    customer_email = Column(String, index=True)
    total_amount = Column(Float)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationship to OrderItemDB
    items = relationship("OrderItemDB", back_populates="order", cascade="all, delete-orphan")
    
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
    image: Optional[str] = None
    specs: Optional[Dict[str, str]] = None
    skv: Optional[str] = None
    mrp: Optional[float] = None
    sale_price: Optional[float] = None
    features: Optional[List[str]] = None
    stock: int = 0

    @field_validator('specs', mode='before')
    @classmethod
    def parse_specs(cls, v):
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except:
                pass
        return v

    @field_validator('features', mode='before')
    @classmethod
    def parse_features(cls, v):
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except:
                pass
        return v

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    image: Optional[str] = None
    specs: Optional[Dict[str, str]] = None
    skv: Optional[str] = None
    mrp: Optional[float] = None
    sale_price: Optional[float] = None
    features: Optional[List[str]] = None
    stock: Optional[int] = None

class Product(ProductBase):
    id: int
    class Config:
        from_attributes = True

class OrderItem(BaseModel):
    product_id: int
    quantity: int
    price_at_purchase: Optional[float] = None
    product: Optional[Product] = None
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    items: List[OrderItem]
    total_amount: float
    customer_email: str
    status: str = "pending"

class Order(OrderCreate):
    id: int
    full_name: Optional[str] = None
    txnid: Optional[str] = None
    created_at: Optional[datetime] = None
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

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    profile_picture: Optional[str] = None

class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    profile_picture: Optional[str] = None
    
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
    user_id = Column(Integer, ForeignKey("users.id"))
    user_email = Column(String)
    user_name = Column(String)
    rating = Column(Integer)
    comment = Column(String)
    created_at = Column(String) # Store as ISO string for simplicity

class ReviewCreate(BaseModel):
    rating: int
    comment: str

class ReviewResponse(BaseModel):
    id: int
    rating: int
    comment: str
    user_name: str
    user_email: str
    created_at: str
    class Config:
        from_attributes = True

class ContactMessageDB(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    message = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
