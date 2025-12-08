"""
FastAPI version of the Serbisyo24x7 services API (port 5080).
Supports services and job requests.
"""

import os
from datetime import datetime, date
from typing import Optional

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    Float,
    Date,
    DateTime,
    ForeignKey,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://serbisyo_user:serbiyopass123@postgres-serbisyo:5432/serbisyo_db",
)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-serbisyo")
cors_origin = os.getenv("CORS_ORIGIN", "*")

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()
_schema_ready = False


class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100))
    description = Column(Text)
    base_price = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "description": self.description,
            "base_price": self.base_price,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class JobRequest(Base):
    __tablename__ = "job_requests"
    id = Column(Integer, primary_key=True)
    service_id = Column(Integer, ForeignKey("services.id"))
    customer_name = Column(String(255), nullable=False)
    contact = Column(String(255))
    location = Column(Text)
    scheduled_for = Column(Date)
    status = Column(String(50), default="new")
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    service = relationship("Service", backref="jobs")

    def to_dict(self):
        return {
            "id": self.id,
            "service_id": self.service_id,
            "customer_name": self.customer_name,
            "contact": self.contact,
            "location": self.location,
            "scheduled_for": self.scheduled_for.isoformat() if self.scheduled_for else None,
            "status": self.status,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "service": self.service.to_dict() if self.service else None,
        }


def ensure_schema():
    global _schema_ready
    if _schema_ready:
        return
    with engine.begin() as conn:
        Base.metadata.create_all(bind=conn)
    _schema_ready = True


def get_db():
    ensure_schema()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class ServiceIn(BaseModel):
    name: str
    category: Optional[str] = None
    description: Optional[str] = None
    base_price: float = 0


class JobIn(BaseModel):
    service_id: Optional[int] = None
    customer_name: str
    contact: Optional[str] = None
    location: Optional[str] = None
    scheduled_for: Optional[str] = None
    status: str = "new"
    notes: Optional[str] = None


app = FastAPI(title="Serbisyo24x7 API", version="2.0-fastapi")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[cors_origin] if cors_origin != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    ensure_schema()


@app.get("/health")
def health():
    return {"status": "ok", "service": "serbisyo24x7"}


@app.get("/api/services")
def list_services(db: Session = Depends(get_db)):
    services = db.query(Service).order_by(Service.created_at.desc()).all()
    return [s.to_dict() for s in services]


@app.post("/api/services", status_code=201)
def create_service(payload: ServiceIn, db: Session = Depends(get_db)):
    svc = Service(**payload.dict())
    db.add(svc)
    db.commit()
    db.refresh(svc)
    return svc.to_dict()


@app.put("/api/services/{service_id}")
def update_service(service_id: int, payload: ServiceIn, db: Session = Depends(get_db)):
    svc = db.get(Service, service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    for key, value in payload.dict().items():
        setattr(svc, key, value)
    db.commit()
    db.refresh(svc)
    return svc.to_dict()


@app.delete("/api/services/{service_id}")
def delete_service(service_id: int, db: Session = Depends(get_db)):
    svc = db.get(Service, service_id)
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(svc)
    db.commit()
    return {"message": "Service deleted"}


@app.get("/api/jobs")
def list_jobs(status: Optional[str] = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(JobRequest)
    if status:
        query = query.filter_by(status=status)
    jobs = query.order_by(JobRequest.created_at.desc()).all()
    return [j.to_dict() for j in jobs]


@app.post("/api/jobs", status_code=201)
def create_job(payload: JobIn, db: Session = Depends(get_db)):
    sched = date.fromisoformat(payload.scheduled_for) if payload.scheduled_for else None
    job = JobRequest(
        service_id=payload.service_id,
        customer_name=payload.customer_name,
        contact=payload.contact,
        location=payload.location,
        scheduled_for=sched,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job.to_dict()


@app.put("/api/jobs/{job_id}")
def update_job(job_id: int, payload: JobIn, db: Session = Depends(get_db)):
    job = db.get(JobRequest, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    for key, value in payload.dict().items():
        if key == "scheduled_for":
            job.scheduled_for = date.fromisoformat(value) if value else None
        else:
            setattr(job, key, value)
    db.commit()
    db.refresh(job)
    return job.to_dict()


@app.delete("/api/jobs/{job_id}")
def delete_job(job_id: int, db: Session = Depends(get_db)):
    job = db.get(JobRequest, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"message": "Job deleted"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("fastapi_serbisyo:app", host="0.0.0.0", port=5080, reload=False)
