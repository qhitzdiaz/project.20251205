"""
FastAPI version of the core backend (auth/media/cloud).
This preserves the existing routes and behavior from the Flask app, including JWT auth.
"""

import os
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import FastAPI, Depends, HTTPException, status, Header
FIREBASE_ENABLED = os.getenv("FIREBASE_ENABLED", "0") == "1"
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")
FIREBASE_AUTH_AUDIENCE = os.getenv("FIREBASE_AUTH_AUDIENCE", FIREBASE_PROJECT_ID)

firebase_admin = None
auth = None
if FIREBASE_ENABLED:
    try:
        import firebase_admin
        from firebase_admin import auth as fb_auth, credentials
        # Initialize Firebase app using ADC or service account if provided
        if not firebase_admin._apps:
            cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
            if cred_path and os.path.exists(cred_path):
                firebase_admin.initialize_app(credentials.Certificate(cred_path))
            else:
                firebase_admin.initialize_app()
        auth = fb_auth
    except Exception as e:
        print(f"[WARN] Firebase initialization failed: {e}")
        FIREBASE_ENABLED = False
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Boolean, or_
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from werkzeug.security import generate_password_hash, check_password_hash

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://qhitz_user:devpass123@postgres-auth:5432/auth_db"
)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ACCESS_TOKEN_EXPIRES_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRES_MINUTES", "60"))
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

app = FastAPI(title="Main API Server", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN] if CORS_ORIGIN != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== MODELS ====================
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime)
    is_active = Column(Boolean, default=True)


def create_tables():
    Base.metadata.create_all(bind=engine)


# ==================== SCHEMAS ====================
class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None  # accept raw string to avoid 422 on non-email identifiers
    identifier: Optional[str] = None  # allow single field carrying either username or email
    password: str


class TokenResponse(BaseModel):
    token: str
    user: dict


class VerifyResponse(BaseModel):
    valid: bool
    user: Optional[dict] = None
    exp: Optional[int] = None


class CreateUserRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    is_active: bool = True


class UpdateUserRequest(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None


# ==================== DB DEPENDENCY ====================
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==================== AUTH HELPERS ====================
def create_token(user_id: int) -> str:
    exp = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRES_MINUTES)
    payload = {"user_id": user_id, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


def _verify_firebase_token(id_token: str):
    if not FIREBASE_ENABLED or auth is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Firebase not enabled")
    try:
        decoded = auth.verify_id_token(id_token)
        return decoded  # contains 'uid', 'email', etc.
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Firebase token")


def get_current_user(db: Session = Depends(get_db), authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is missing")
    token = authorization.split(" ", 1)[1]
    # Try local JWT first; if fails and Firebase is enabled, try Firebase ID token
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db.query(User).filter(User.id == data["user_id"]).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        if FIREBASE_ENABLED:
            decoded = _verify_firebase_token(token)
            # Map Firebase UID/email to local user record by email or username
            firebase_email = decoded.get("email")
            firebase_uid = decoded.get("uid")
            user = None
            if firebase_email:
                user = db.query(User).filter(User.email == firebase_email).first()
            if not user and firebase_uid:
                # Fallback: try username equals uid (if you decide to store it that way)
                user = db.query(User).filter(User.username == firebase_uid).first()
            if not user:
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not linked")
            return user
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def user_to_dict(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "last_login": user.last_login.isoformat() if user.last_login else None,
        "is_active": user.is_active,
    }


# ==================== ROUTES ====================
@app.get("/", summary="Root")
def root():
    return {
        "service": "Main API Server (FastAPI)",
        "version": "1.0.0",
        "database": "auth_db",
        "endpoints": {
          "health": "/api/health",
          "register": "/api/auth/register",
          "login": "/api/auth/login",
          "verify": "/api/auth/verify",
          "profile": "/api/auth/profile"
        }
    }


@app.get("/api/health", summary="Health check")
def health():
    return {"status": "ok", "service": "auth-api", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/auth/register", response_model=TokenResponse, summary="Register user")
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")
    new_user = User(
        username=payload.username,
        email=payload.email,
        password_hash=generate_password_hash(payload.password, method="pbkdf2:sha256")
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    token = create_token(new_user.id)
    return {"token": token, "user": user_to_dict(new_user)}


@app.post("/api/auth/login", response_model=TokenResponse, summary="Login user")
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    identifier = payload.identifier or payload.username or payload.email
    if not identifier:
        raise HTTPException(status_code=400, detail="username or email is required")

    query = db.query(User)
    if "@" in identifier:
        user = query.filter(User.email == identifier).first()
    else:
        user = query.filter(User.username == identifier).first()

    if not user or not check_password_hash(user.password_hash, payload.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user.last_login = datetime.utcnow()
    db.commit()
    token = create_token(user.id)
    return {"token": token, "user": user_to_dict(user)}


@app.get("/api/auth/verify", response_model=VerifyResponse, summary="Verify token")
def verify_token(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        return {"valid": False}
    token = authorization.split(" ", 1)[1]
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user = db.query(User).filter(User.id == data["user_id"]).first()
        if not user:
            return {"valid": False}
        return {"valid": True, "user": user_to_dict(user), "exp": data.get("exp")}
    except jwt.ExpiredSignatureError:
        return {"valid": False, "message": "Token expired"}
    except jwt.InvalidTokenError:
        return {"valid": False, "message": "Invalid token"}


@app.get("/api/auth/profile", summary="Current user profile")
def get_profile(current_user: User = Depends(get_current_user)):
    return user_to_dict(current_user)


@app.post("/api/auth/firebase/verify", response_model=VerifyResponse, summary="Verify Firebase ID token")
def firebase_verify(authorization: str = Header(None), db: Session = Depends(get_db)):
    if not FIREBASE_ENABLED:
        raise HTTPException(status_code=400, detail="Firebase not enabled")
    if not authorization or not authorization.startswith("Bearer "):
        return {"valid": False}
    token = authorization.split(" ", 1)[1]
    try:
        decoded = _verify_firebase_token(token)
        firebase_email = decoded.get("email")
        user = None
        if firebase_email:
            user = db.query(User).filter(User.email == firebase_email).first()
        return {"valid": True, "user": user_to_dict(user) if user else None}
    except HTTPException:
        return {"valid": False}


@app.get("/api/users", summary="List all users")
def list_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.id.asc()).all()
    return [user_to_dict(user) for user in users]


@app.post("/api/users", summary="Create a new user")
def create_user(payload: CreateUserRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    existing = db.query(User).filter(or_(User.username == payload.username, User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        username=payload.username,
        email=payload.email,
        password_hash=generate_password_hash(payload.password, method="pbkdf2:sha256"),
        is_active=payload.is_active,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return user_to_dict(new_user)


@app.put("/api/users/{user_id}", summary="Update an existing user")
def update_user(user_id: int, payload: UpdateUserRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if payload.username and payload.username != user.username:
        conflict = db.query(User).filter(User.username == payload.username, User.id != user_id).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Username already in use")
        user.username = payload.username

    if payload.email and payload.email != user.email:
        conflict = db.query(User).filter(User.email == payload.email, User.id != user_id).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Email already in use")
        user.email = payload.email

    if payload.password:
        user.password_hash = generate_password_hash(payload.password, method="pbkdf2:sha256")

    if payload.is_active is not None:
        user.is_active = payload.is_active

    db.commit()
    db.refresh(user)
    return user_to_dict(user)


if __name__ == "__main__":
    create_tables()
