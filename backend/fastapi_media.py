"""
FastAPI version of the Media Server (file uploads, listing, download, radio endpoints).
Preserves the existing Flask behavior and schema.
"""

import os
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    DateTime,
    Boolean,
    Text,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session

DATABASE_URL = os.getenv(
    "MEDIA_DATABASE_URL",
    "postgresql://qhitz_user:devpass123@postgres-media:5432/media_db"
)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
UPLOAD_FOLDER = "/app/uploads"
MAX_FILE_SIZE = 100 * 1024 * 1024
CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()

app = FastAPI(title="Media Server", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[CORS_ORIGIN] if CORS_ORIGIN != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

ALLOWED_EXTENSIONS = {
    "images": {"png", "jpg", "jpeg", "gif", "webp", "svg"},
    "videos": {"mp4", "avi", "mov", "wmv", "flv", "webm"},
    "documents": {"pdf", "doc", "docx", "txt", "xls", "xlsx", "ppt", "pptx"},
    "audio": {"mp3", "wav", "ogg", "flac"},
}

RADIO_STATIONS = [
    {"id": "mm-magic89", "name": "Magic 89.9", "city": "Metro Manila", "country": "Philippines", "stream_url": "https://listen.radioking.com/radio/298894/stream/344844"},
    {"id": "mm-wave891", "name": "Wave 89.1", "city": "Metro Manila", "country": "Philippines", "stream_url": "https://stream.wave891.fm/stream/1/"},
    {"id": "mm-rx931", "name": "Monster RX 93.1", "city": "Metro Manila", "country": "Philippines", "stream_url": "https://stream.radiomonster.ph/"},
    {"id": "tor-cbc-music", "name": "CBC Music", "city": "Toronto", "country": "Canada", "stream_url": "https://cbcmp3.ic.llnwd.net/stream/cbcmp3_cbc_mtl"},
    {"id": "tor-jazzfm", "name": "JAZZ.FM91", "city": "Toronto", "country": "Canada", "stream_url": "https://live.wostreaming.net/manifest/surfer_hawk-jazzfmaac-h.stream_m"}]


class MediaFile(Base):
    __tablename__ = "media_files"
    id = Column(Integer, primary_key=True)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_extension = Column(String(10), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    mime_type = Column(String(100))
    uploaded_by = Column(Integer)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    description = Column(Text)
    tags = Column(String(500))
    is_public = Column(Boolean, default=False)
    artist = Column(String(255))
    album = Column(String(255))
    genre = Column(String(255))
    artwork_url = Column(String(500))


def create_tables():
    Base.metadata.create_all(bind=engine)


class MediaOut(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    file_extension: str
    file_size: int
    mime_type: Optional[str]
    uploaded_by: Optional[int]
    uploaded_at: Optional[str]
    description: Optional[str]
    tags: List[str]
    is_public: bool
    download_url: str
    artist: Optional[str]
    album: Optional[str]
    genre: Optional[str]
    artwork_url: Optional[str]

    class Config:
        from_attributes = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def allowed_file(filename: str):
    if "." not in filename:
        return False, None
    ext = filename.rsplit(".", 1)[1].lower()
    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return True, file_type
    return False, None


def to_dict(record: MediaFile):
    return {
        "id": record.id,
        "filename": record.filename,
        "original_filename": record.original_filename,
        "file_type": record.file_type,
        "file_extension": record.file_extension,
        "file_size": record.file_size,
        "mime_type": record.mime_type,
        "uploaded_by": record.uploaded_by,
        "uploaded_at": record.uploaded_at.isoformat() if record.uploaded_at else None,
        "description": record.description,
        "tags": record.tags.split(",") if record.tags else [],
        "is_public": record.is_public,
        "download_url": f"/api/media/download/{record.id}",
        "artist": record.artist,
        "album": record.album,
        "genre": record.genre,
        "artwork_url": record.artwork_url,
    }


@app.get("/", summary="Root")
def root():
    return {
        "service": "Media Server (FastAPI)",
        "version": "1.0.0",
        "database": "media_db",
        "endpoints": {
            "health": "/api/health",
            "upload": "POST /api/media/upload",
            "files": "GET /api/media/files",
        },
    }


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "media-api", "timestamp": datetime.utcnow().isoformat()}


@app.post("/api/media/upload", response_model=MediaOut)
async def upload_file(
    file: UploadFile = File(...),
    description: str = Form(""),
    tags: str = Form(""),
    is_public: bool = Form(False),
    uploaded_by: Optional[int] = Form(None),
    artist: Optional[str] = Form(None),
    album: Optional[str] = Form(None),
    genre: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large")

    valid, file_type = allowed_file(file.filename)
    if not valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File type not allowed")

    ext = file.filename.rsplit(".", 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    media_file = MediaFile(
        filename=unique_filename,
        original_filename=file.filename,
        file_type=file_type,
        file_extension=ext,
        file_size=len(contents),
        file_path=file_path,
        mime_type=file.content_type,
        uploaded_by=uploaded_by,
        description=description,
        tags=tags,
        is_public=is_public,
        artist=artist,
        album=album,
        genre=genre,
    )
    db.add(media_file)
    db.commit()
    db.refresh(media_file)
    return to_dict(media_file)


@app.get("/api/media/files", response_model=List[MediaOut])
def list_files(file_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(MediaFile)
    if file_type:
        query = query.filter(MediaFile.file_type == file_type)
    records = query.order_by(MediaFile.uploaded_at.desc()).all()
    return [to_dict(r) for r in records]


@app.get("/api/media/file/{file_id}", response_model=MediaOut)
def get_file(file_id: int, db: Session = Depends(get_db)):
    record = db.query(MediaFile).filter(MediaFile.id == file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    return to_dict(record)


@app.get("/api/media/download/{file_id}")
def download_file(file_id: int, db: Session = Depends(get_db)):
    record = db.query(MediaFile).filter(MediaFile.id == file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(
        record.file_path,
        media_type=record.mime_type or "application/octet-stream",
        filename=record.original_filename,
    )


@app.delete("/api/media/file/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db)):
    record = db.query(MediaFile).filter(MediaFile.id == file_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="File not found")
    try:
        if record.file_path and os.path.exists(record.file_path):
            os.remove(record.file_path)
    except Exception:
        pass
    db.delete(record)
    db.commit()
    return {"message": "File deleted successfully"}


@app.get("/api/media/radio")
def radio_list():
    return {"stations": RADIO_STATIONS}


@app.get("/api/media/stats")
def stats(db: Session = Depends(get_db)):
    total_files = db.query(MediaFile).count()
    total_size = db.query(MediaFile).with_entities(MediaFile.file_size).all()
    size_sum = sum(size for (size,) in total_size) if total_size else 0
    return {"total_files": total_files, "total_size": size_sum}


if __name__ == "__main__":
    create_tables()
