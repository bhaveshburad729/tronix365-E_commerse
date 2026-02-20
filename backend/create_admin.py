from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models import UserDB
from auth import get_password_hash

def create_admin():
    db = SessionLocal()
    try:
        # Check for existing admin
        admin = db.query(UserDB).filter(UserDB.role == "admin").first()
        if admin:
            print(f"Admin already exists: {admin.email}")
            return

        print("No admin found. Creating one...")
        email = "admin@tronix365.com"
        password = "adminpassword123"
        hashed_password = get_password_hash(password)
        
        new_admin = UserDB(
            email=email,
            hashed_password=hashed_password,
            full_name="System Admin",
            role="admin",
            is_active=True
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        print(f"Admin created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")
        
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
