#!/usr/bin/env python3
"""
Script to create a test user in the authentication database
Usage: python create_test_user.py
"""

from app import app, db, User
from werkzeug.security import generate_password_hash

def create_test_user():
    """Create a test user with username 'qhitz' and password 'teng'"""
    with app.app_context():
        # Check if user already exists
        existing_user = User.query.filter_by(username='qhitz').first()
        if existing_user:
            print(f"User 'qhitz' already exists (ID: {existing_user.id})")
            return

        # Create new user
        hashed_password = generate_password_hash('teng')
        new_user = User(
            username='qhitz',
            email='qhitz@test.com',
            password_hash=hashed_password
        )

        try:
            db.session.add(new_user)
            db.session.commit()
            print(f"✅ Test user created successfully!")
            print(f"   Username: qhitz")
            print(f"   Email: qhitz@test.com")
            print(f"   Password: teng")
            print(f"   User ID: {new_user.id}")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error creating user: {e}")

if __name__ == '__main__':
    create_test_user()
