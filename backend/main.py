from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session
from database import engine, Base, get_db
from models import Product, ProductDB, Order, OrderCreate, OrderDB, LoginRequest, ReviewDB, ReviewCreate, ReviewResponse
import requests
import hashlib
import os
from pydantic import BaseModel, EmailStr
from datetime import datetime

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tronix365 API", version="0.1.0")

# CORS Setup
# CORS Setup
origins_str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins = [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )


@app.get("/")
async def read_root():
    return {"message": "Welcome to Tronix365 API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/products", response_model=List[Product])
async def get_products(
    category: str = None,
    min_price: float = None,
    max_price: float = None,
    sort_by: str = None,
    search: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(ProductDB)

    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (ProductDB.title.ilike(search_term)) | 
            (ProductDB.description.ilike(search_term)) |
            (ProductDB.category.ilike(search_term))
        )

    if category and category != "All":
        query = query.filter(ProductDB.category == category)
    
    if min_price is not None:
        query = query.filter(ProductDB.price >= min_price)
        
    if max_price is not None:
        query = query.filter(ProductDB.price <= max_price)

    if sort_by:
        if sort_by == "price_asc":
            query = query.order_by(ProductDB.price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(ProductDB.price.desc())
        elif sort_by == "name_asc":
            query = query.order_by(ProductDB.title.asc())

    products = query.all()
    return products

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products/{product_id}/reviews", response_model=ReviewResponse)
async def create_review(product_id: int, review: ReviewCreate, db: Session = Depends(get_db)):
    # Verify product exists
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_review = ReviewDB(
        product_id=product_id,
        user_name=review.user_name,
        rating=review.rating,
        comment=review.comment,
        created_at=datetime.utcnow().isoformat()
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

@app.get("/products/{product_id}/reviews", response_model=List[ReviewResponse])
async def get_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(ReviewDB).filter(ReviewDB.product_id == product_id).all()
    return reviews

@app.post("/orders", status_code=201)
async def create_order(order: OrderCreate, db: Session = Depends(get_db)):
    # Convert Pydantic items list to JSON-compatible format (list of dicts)
    items_json = [item.dict() for item in order.items]
    
    new_order = OrderDB(
        customer_email=order.customer_email,
        total_amount=order.total_amount,
        status="confirmed", # Auto-confirm for demo
        items=items_json 
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    print(f"Order saved: {new_order.id}")
    return {"message": "Order placed successfully", "order_id": new_order.id, "status": "confirmed"}

@app.get("/orders", response_model=List[Order])
async def get_orders(db: Session = Depends(get_db)):
    orders = db.query(OrderDB).all()
    return orders

class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str

from email_utils import send_contact_form_notification

@app.post("/contact")
async def send_contact_email(contact: ContactMessage):
    success = send_contact_form_notification(contact.name, contact.email, contact.message)
    
    if success:
        return {"message": "Message sent successfully"}
    else:
        # Fallback for demo or error
        # Check if it was just because of missing key (already handled in utils logging)
        # For UI UX, we might still return success if it's a "soft" failure like demo mode, 
        # but let's return error if it failed to ensure robustness.
        # However, checking current implementation logic:
        # If API key is missing, utils returns False.
        # If request fails, utils returns False.
        raise HTTPException(status_code=500, detail="Failed to send email")

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from auth import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from models import UserDB, UserCreate, Token, UserLogin, UserResponse

# ... (Previous imports stay, verify context)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# Dependency to get current user
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    from jose import JWTError, jwt
    from auth import SECRET_KEY, ALGORITHM
    from models import TokenData
    
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = db.query(UserDB).filter(UserDB.email == token_data.email).first()
    if user is None:
        raise credentials_exception
    return user

@app.post("/signup", response_model=Token)
async def signup(user: UserCreate, db: Session = Depends(get_db)):
    try:
        db_user = db.query(UserDB).filter(UserDB.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        print(f"DEBUG: Password to hash: '{user.password}', Type: {type(user.password)}, Len: {len(user.password)}")
        hashed_password = get_password_hash(user.password)
        new_user = UserDB(
            email=user.email,
            hashed_password=hashed_password,
            full_name=user.full_name,
            role="user" # Default role
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # Auto-login after signup
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": new_user.email, "role": new_user.role}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer", "user_name": new_user.full_name, "role": new_user.role}
    except HTTPException as e:
        raise e
    except Exception as e:
        # msg = f"Signup Error: {str(e)} | Pwd Type: {type(user.password)} | Pwd Len: {len(user.password)}"
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Signup Error: {str(e)}")

@app.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Note: OAuth2PasswordRequestForm expects 'username' and 'password' fields. 
    # We will use 'email' as the username in the frontend form data.
    user = db.query(UserDB).filter(UserDB.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email, "role": user.role}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user_name": user.full_name, "role": user.role}

@app.get("/profile", response_model=UserResponse) 
async def get_user_profile(current_user: UserDB = Depends(get_current_user)):
    return current_user

@app.get("/orders/user", response_model=List[Order])
async def get_user_orders(current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch orders based on customer_email matching the logged-in user
    orders = db.query(OrderDB).filter(OrderDB.customer_email == current_user.email).order_by(OrderDB.id.desc()).all()
    return orders
    
# Trigger reload for env update

# Payment Endpoints
from payu_utils import generate_payu_hash, verify_payu_hash
from fastapi import Form, Request
from fastapi.responses import RedirectResponse

class PaymentItem(BaseModel):
    product_id: int
    quantity: int

class PaymentInitiate(BaseModel):
    amount: float
    firstname: str
    email: EmailStr
    productinfo: str
    items: List[PaymentItem] # List of items
    phone: str
    address_line: str
    city: str
    state: str
    pincode: str

@app.post("/payment/initiate")
async def initiate_payment(payment: PaymentInitiate, db: Session = Depends(get_db)):
    # 1. Validate Stock
    items_for_order = []
    for item in payment.items:
        product = db.query(ProductDB).filter(ProductDB.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        if product.stock < item.quantity:
             raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.title}. Only {product.stock} left.")
        
        items_for_order.append(item.dict())

    key = os.getenv("PAYU_KEY")
    salt = os.getenv("PAYU_SALT")
    txnid = f"TXN{int(payment.amount)}{os.urandom(4).hex()}" # Unique ID
    
    # Create Order in DB (Pending)
    new_order = OrderDB(
        customer_email=payment.email,
        total_amount=payment.amount,
        status="pending",
        items=items_for_order, # Save actual items
        txnid=txnid,
        full_name=payment.firstname,
        phone=payment.phone,
        address_line=payment.address_line,
        city=payment.city,
        state=payment.state,
        pincode=payment.pincode
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    hash_value = generate_payu_hash(key, txnid, str(payment.amount), payment.productinfo, payment.firstname, payment.email, salt)
    
    return {
        "key": key,
        "txnid": txnid,
        "amount": payment.amount,
        "productinfo": payment.productinfo,
        "firstname": payment.firstname,
        "email": payment.email,
        "phone": payment.phone,
        "surl": f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/payment/callback", # Success URL
        "furl": f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/payment/callback", # Failure URL
        "hash": hash_value,
        "action": os.getenv("PAYU_TEST_URL") if os.getenv("PAYU_ENV") != "TEST" else f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/payment/mock-process"
    }

@app.post("/payment/mock-process")
async def mock_payment_process(
    key: str = Form(...),
    txnid: str = Form(...),
    amount: str = Form(...),
    productinfo: str = Form(...),
    firstname: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    surl: str = Form(...),
    furl: str = Form(...),
    hash: str = Form(...)
):
    # Simulate PayU processing time
    import time
    # time.sleep(2) 
    
    # Randomly fail? No, let's default to success for now, or add a magic amount to fail
    status = "success"
    if firstname.lower() == "failure":
        status = "failure"
        
    salt = os.getenv("PAYU_SALT")
    
    # Calculate response hash
    # Sequence: salt|status|||||||||||email|firstname|productinfo|amount|txnid|key
    hash_string = f"{salt}|{status}|||||||||||{email}|{firstname}|{productinfo}|{amount}|{txnid}|{key}"
    response_hash = hashlib.sha512(hash_string.encode('utf-8')).hexdigest()
    
    # Redirect to callback
    # We need to POST to callback, but since this is a browser redirect simulation, 
    # we can't easily do a POST redirect from here without a form.
    # So we will return a self-submitting form, just like PayU does.
    
    html_content = f"""
    <html>
        <head><title>Processing Payment...</title></head>
        <body onload="document.forms[0].submit()">
            <form action="{surl}" method="post">
                <input type="hidden" name="status" value="{status}" />
                <input type="hidden" name="firstname" value="{firstname}" />
                <input type="hidden" name="amount" value="{amount}" />
                <input type="hidden" name="txnid" value="{txnid}" />
                <input type="hidden" name="hash" value="{response_hash}" />
                <input type="hidden" name="productinfo" value="{productinfo}" />
                <input type="hidden" name="email" value="{email}" />
                <input type="hidden" name="key" value="{key}" />
            </form>
        </body>
    </html>
    """
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_content, status_code=200)

@app.post("/payment/callback")
async def payment_callback(
    status: str = Form(...),
    firstname: str = Form(...),
    amount: str = Form(...),
    txnid: str = Form(...),
    hash: str = Form(...),
    productinfo: str = Form(...),
    email: str = Form(...),
    error: str = Form(None),
    db: Session = Depends(get_db)
):
    # Verify Signature
    key = os.getenv("PAYU_KEY")
    salt = os.getenv("PAYU_SALT")
    
    if not verify_payu_hash(salt, status, "", email, firstname, productinfo, amount, txnid, key, hash):
        print(f"Hash verification failed for {txnid}")
        # Mark order as tampered or failed
        order = db.query(OrderDB).filter(OrderDB.txnid == txnid).first()
        if order:
            order.status = "tampered"
            db.commit()
        return RedirectResponse(
            url=f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/payment/failure?txnid={txnid}&reason=tampered", 
            status_code=303
        )

    # Log the status
    print(f"Payment Callback: {status} for {txnid}")
    
    # Update Order Status
    order = db.query(OrderDB).filter(OrderDB.txnid == txnid).first()
    if order:
        if status == "success":
            # Idempotency check: Only deduct stock if not already confirmed
            if order.status != "confirmed":
                order.status = "confirmed"
                # Decrement Stock
                if order.items:
                    for item in order.items: # item is a dict here since it came from JSON column
                        product = db.query(ProductDB).filter(ProductDB.id == item['product_id']).first()
                        if product:
                            product.stock -= item['quantity']
                            if product.stock < 0: product.stock = 0 # Safety check
                db.commit() # Commit both status and stock update
        else:
            order.status = "failed"
            db.commit()
    
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # Redirect to Frontend
    if status == "success":
        return RedirectResponse(url=f"{frontend_url}/payment/success?txnid={txnid}", status_code=303)
    else:
        return RedirectResponse(url=f"{frontend_url}/payment/failure?txnid={txnid}", status_code=303)

