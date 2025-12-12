"""Seed test tenant auth users for login.

Run:
    cd backend
    python3 scripts/seed_tenant_users.py

Note: This writes directly to the auth DB via models in backend/app.py.
"""
import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, os.pardir))
if PROJECT_ROOT not in sys.path:
        sys.path.insert(0, PROJECT_ROOT)

from app import SessionLocal, User, Base, engine
from werkzeug.security import generate_password_hash

USERS = [
    {"username": "tenant1", "email": "tenant1@example.com", "password": "123456"},
    {"username": "tenant2", "email": "tenant2@example.com", "password": "123456"},
    {"username": "tenant3", "email": "tenant3@example.com", "password": "123456"},
]


def main():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    created = 0
    try:
        for u in USERS:
            existing = db.query(User).filter((User.username == u["username"]) | (User.email == u["email"]))
            if existing.first():
                continue
            db.add(
                User(
                    username=u["username"],
                    email=u["email"],
                    password_hash=generate_password_hash(u["password"], method="pbkdf2:sha256"),
                )
            )
            created += 1
        db.commit()
        total = db.query(User).count()
        print(f"Created {created} users. Total users: {total}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
