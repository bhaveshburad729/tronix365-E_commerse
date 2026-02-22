from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from database import engine, Base, get_db
from models import Product, ProductDB, Order, OrderCreate, OrderDB, OrderItemDB, LoginRequest, ReviewDB, ReviewCreate, ReviewResponse, ProductCreate, ProductUpdate, ContactMessageDB
import requests
import hashlib
import os
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File
import shutil
from email_utils import send_order_confirmation_email

# Ensure 'uploads' directory exists
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Tronix365 API", version="0.1.0")

# CORS Setup
# CORS Setup - Hardcoded for Production Safety
origins = [
    "https://www.tronix365.in",
    "https://tronix365.in",
    "http://localhost:5173",
    "http://localhost:3000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

@app.exception_handler(RequestValidationError)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    body = exc.body
    if not isinstance(body, (dict, list, str, int, float, bool, type(None))):
        body = str(body)
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": body},
    )


@app.get("/")
async def read_root():
    return {"message": "Welcome to Tronix365 API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.get("/products", response_model=List[Product])
async def get_products(
    skip: int = 0,
    limit: int = 20,
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

    products = query.offset(skip).limit(limit).all()
    return products

@app.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.post("/products", response_model=Product, status_code=201)
async def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    new_product = ProductDB(**product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@app.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: int, product: ProductUpdate, db: Session = Depends(get_db)):
    db_product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    product_data = product.dict(exclude_unset=True)
    for key, value in product_data.items():
        setattr(db_product, key, value)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@app.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: int, db: Session = Depends(get_db)):
    db_product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(db_product)
    db.commit()
    return None

@app.post("/products/{product_id}/reviews", response_model=ReviewResponse)
async def create_review(product_id: int, review: ReviewCreate, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify product exists
    product = db.query(ProductDB).filter(ProductDB.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    new_review = ReviewDB(
        product_id=product_id,
        user_id=current_user.id,
        user_email=current_user.email,
        user_name=current_user.full_name or "Anonymous",
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

from email_utils import send_order_confirmation_email

@app.post("/orders", status_code=201)
async def create_order(order: OrderCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Create Order
    new_order = OrderDB(
        customer_email=order.customer_email,
        total_amount=order.total_amount,
        status="confirmed" # Auto-confirm for demo
    )
    
    # Process Items
    for item in order.items:
        # Identify Product
        product = db.query(ProductDB).filter(ProductDB.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=400, detail=f"Product ID {item.product_id} is invalid.")
            
        # Enforce Stock Check Globally
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {product.title}. Only {product.stock} available."
            )
            
        # Determine price (sale price > mrp > 0)
        price = product.sale_price if product.sale_price else (product.price if product.price else 0.0)
        
        # Create Order Item linked to Order
        order_item = OrderItemDB(
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=price
        )
        new_order.items.append(order_item)
        
        # Deduct Stock globally
        product.stock -= item.quantity

    db.add(new_order)
    db.commit()
    db.refresh(new_order)

    # Dispatch Order Confirmation Email in the background
    background_tasks.add_task(send_order_confirmation_email, new_order)
    
    print(f"Order saved and email queued: {new_order.id}")
    return {"message": "Order placed successfully", "order_id": new_order.id, "status": "confirmed"}


@app.get("/orders", response_model=List[Order])
async def get_orders(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    orders = db.query(OrderDB).options(
        joinedload(OrderDB.items).joinedload(OrderItemDB.product)
    ).offset(skip).limit(limit).all()
    return orders

from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from auth import verify_password, get_password_hash, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from datetime import timedelta
from models import UserDB, UserCreate, Token, UserLogin, UserResponse, UserUpdate

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



class ContactMessage(BaseModel):
    name: str
    email: EmailStr
    message: str

from email_utils import send_contact_form_notification
from models import ContactMessageDB

from fastapi import BackgroundTasks

@app.post("/contact")
async def send_contact_email(contact: ContactMessage, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # 1. Save to Database
    try:
        new_msg = ContactMessageDB(
            name=contact.name,
            email=contact.email,
            message=contact.message
        )
        db.add(new_msg)
        db.commit()
    except Exception as e:
        print(f"Error saving contact message to DB: {e}")

    # 2. Try sending the email in the background to prevent UI hanging
    background_tasks.add_task(send_contact_form_notification, contact.name, contact.email, contact.message)

    # 3. Always return success to the UI instantly (since it's in the DB)
    return {"message": "Message sent successfully, queued for delivery"}



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

@app.put("/profile", response_model=UserResponse)
async def update_user_profile(user_update: UserUpdate, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.password is not None:
        from auth import get_password_hash
        current_user.hashed_password = get_password_hash(user_update.password)
    if user_update.profile_picture is not None:
        current_user.profile_picture = user_update.profile_picture
        
    db.commit()
    db.refresh(current_user)
    return current_user
@app.get("/debug-orders")
async def debug_orders(db: Session = Depends(get_db)):
    orders = db.query(OrderDB).order_by(OrderDB.id.desc()).limit(3).all()
    users = db.query(UserDB).order_by(UserDB.id.desc()).limit(3).all()
    return {
        "recent_orders": [{"id": o.id, "email": o.customer_email, "status": o.status} for o in orders],
        "recent_users": [{"id": u.id, "email": u.email} for u in users]
    }

@app.get("/orders/user", response_model=List[Order])
async def get_user_orders(skip: int = 0, limit: int = 20, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch orders based on customer_email matching the logged-in user
    orders = db.query(OrderDB).options(joinedload(OrderDB.items).joinedload(OrderItemDB.product)).filter(OrderDB.customer_email == current_user.email).order_by(OrderDB.id.desc()).offset(skip).limit(limit).all()
    return orders

@app.get("/orders/{order_id}", response_model=Order)
async def get_order_by_id(order_id: int, current_user: UserDB = Depends(get_current_user), db: Session = Depends(get_db)):
    # Fetch specific order
    order = db.query(OrderDB).options(joinedload(OrderDB.items).joinedload(OrderItemDB.product)).filter(OrderDB.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    # Security: Ensure only the order creator (or an admin) can view it
    if order.customer_email != current_user.email and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to view this order")
        
    return order
    
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
        
        # Create OrderItemDB instance
        order_item = OrderItemDB(
            product_id=item.product_id,
            quantity=item.quantity,
            price_at_purchase=product.sale_price if product.sale_price else product.price
        )
        items_for_order.append(order_item)

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

    payu_env = os.getenv("PAYU_ENV", "MOCK").upper()
    if payu_env == "PROD":
        action_url = "https://secure.payu.in/_payment"
    elif payu_env == "TEST":
        action_url = "https://test.payu.in/_payment"
    else:
        action_url = f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/payment/mock-process"

    # Strict formatting to avoid float precision hash mismatch
    amount_str = f"{payment.amount:.2f}"
    
    hash_value = generate_payu_hash(key, txnid, amount_str, payment.productinfo, payment.firstname, payment.email, salt)
    
    return {
        "key": key,
        "txnid": txnid,
        "amount": amount_str,
        "productinfo": payment.productinfo,
        "firstname": payment.firstname,
        "email": payment.email,
        "phone": payment.phone,
        "surl": f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/payment/callback", # Success URL
        "furl": f"{os.getenv('BACKEND_URL', 'http://localhost:8000')}/payment/callback", # Failure URL
        "hash": hash_value,
        "action": action_url
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
    background_tasks: BackgroundTasks,
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
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip('/')
        if "tronix365.in" in frontend_url and "/e-commerse" not in frontend_url:
            frontend_url = f"{frontend_url}/e-commerse"
            
        return RedirectResponse(
            url=f"{frontend_url}/payment/failure?txnid={txnid}&reason=tampered", 
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
                    for item in order.items:
                        product = db.query(ProductDB).filter(ProductDB.id == item.product_id).first()
                        if product:
                            product.stock -= item.quantity
                            if product.stock < 0: product.stock = 0 # Safety check
                db.commit() # Commit both status and stock update
                db.refresh(order)
                
                # Payment succeeds and order is confirmed. Send HTML invoice!
                background_tasks.add_task(send_order_confirmation_email, order)
        else:
            order.status = "failed"
            db.commit()
    
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip('/')
    # If the app is in a subdirectory but FRONTEND_URL is just the root, we append it.
    # For Tronix365 production, it's under /e-commerse
    if "tronix365.in" in frontend_url and "/e-commerse" not in frontend_url:
        frontend_url = f"{frontend_url}/e-commerse"
    
    # Redirect to Frontend
    if status == "success":
        return RedirectResponse(url=f"{frontend_url}/payment/success?txnid={txnid}", status_code=303)
    else:
        return RedirectResponse(url=f"{frontend_url}/payment/failure?txnid={txnid}", status_code=303)

@app.get("/admin/stats")
async def get_admin_stats(db: Session = Depends(get_db)):
    total_orders = db.query(OrderDB).count()
    total_revenue = db.query(func.sum(OrderDB.total_amount)).scalar() or 0.0
    total_products = db.query(ProductDB).count()
    total_users = db.query(UserDB).count()
    
    # Calculate 30-day Revenue Growth
    now = datetime.utcnow()
    thirty_days_ago = now - timedelta(days=30)
    sixty_days_ago = now - timedelta(days=60)
    
    current_revenue = db.query(func.sum(OrderDB.total_amount)).filter(OrderDB.created_at >= thirty_days_ago).scalar() or 0.0
    previous_revenue = db.query(func.sum(OrderDB.total_amount)).filter(OrderDB.created_at >= sixty_days_ago, OrderDB.created_at < thirty_days_ago).scalar() or 0.0
    
    if previous_revenue == 0:
        growth = 100.0 if current_revenue > 0 else 0.0
    else:
        growth = ((current_revenue - previous_revenue) / previous_revenue) * 100.0
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "total_products": total_products,
        "active_users": total_users,
        "growth": round(growth, 1)
    }

@app.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    try:
        # Create a unique filename
        file_extension = file.filename.split(".")[-1]
        unique_filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}_{os.urandom(4).hex()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Return a relative URL instead of absolute 
        # so it automatically adapts to whatever environment (Render/Local)
        # the frontend uses to display it.
        return {"url": f"/uploads/{unique_filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

