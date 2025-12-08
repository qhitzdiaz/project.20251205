"""
FastAPI version of the Cloud Storage Server (basic file listing and storage).
Preserves existing Flask behavior where applicable.
"""

import os
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv(
    "CLOUD_DATABASE_URL",
    "postgresql://qhitz_user:devpass123@postgres-cloud:5432/cloud_db"
)
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

app = FastAPI(title="Cloud Storage Server", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN] if CORS_ORIGIN != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CloudFile(Base):
    __tablename__ = "cloud_files"
    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    storage_path = Column(String(500), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    mime_type = Column(String(100))
    size = Column(Integer, default=0)


def create_tables():
    Base.metadata.create_all(bind=engine)


class CloudFileOut(BaseModel):
    id: int
    filename: str
    storage_path: str
    uploaded_at: Optional[str]
    mime_type: Optional[str]
    size: int

    class Config:
        from_attributes = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/", summary="Root")
def root():
    return {
        "service": "Cloud Storage Server (FastAPI)",
        "version": "1.0.0",
        "database": "cloud_db",
        "endpoints": {"health": "/api/health", "files": "/api/cloud/files"}
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "cloud-api", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/cloud/files", response_model=List[CloudFileOut])
def list_files(db: Session = Depends(get_db)):
    records = db.query(CloudFile).order_by(CloudFile.uploaded_at.desc()).all()
    return [
        {
            "id": r.id,
            "filename": r.filename,
            "storage_path": r.storage_path,
            "uploaded_at": r.uploaded_at.isoformat() if r.uploaded_at else None,
            "mime_type": r.mime_type,
            "size": r.size,
        }
        for r in records
    ]


@app.get("/api/cloud/files/{file_id}", response_model=CloudFileOut)
def get_file(file_id: int, db: Session = Depends(get_db)):
    record = db.query(CloudFile).filter(CloudFile.id == file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    return {
        "id": record.id,
        "filename": record.filename,
        "storage_path": record.storage_path,
        "uploaded_at": record.uploaded_at.isoformat() if record.uploaded_at else None,
        "mime_type": record.mime_type,
        "size": record.size,
    }


if __name__ == "__main__":
    create_tables()
