from database import SessionLocal
from models import UserDB

db = SessionLocal()
users = db.query(UserDB).all()
print(f"Total users: {len(users)}")
for u in users:
    print(f"User: {u.email}, Role: {u.role}, Hash: {u.hashed_password[:10]}...")
