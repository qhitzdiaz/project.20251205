import os
from datetime import date, datetime
from typing import Optional, List
from enum import Enum

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Integer, String, Text, Float, Date, DateTime, Enum as SQLEnum, ForeignKey, create_engine, select, func
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://property:property@db:5432/property_db")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


class LeaseStatus(str, Enum):
    active = "active"
    pending = "pending"
    ended = "ended"


class Property(Base):
    __tablename__ = "properties"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(Text)
    city = Column(String(100))
    province = Column(String(100))
    country = Column(String(100))
    units_total = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    leases = relationship("Lease", back_populates="property", cascade="all, delete-orphan")


class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    leases = relationship("Lease", back_populates="tenant")
    maintenance_requests = relationship("Maintenance", back_populates="tenant")


class Lease(Base):
    __tablename__ = "leases"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    unit = Column(String(50))
    start_date = Column(Date)
    end_date = Column(Date)
    rent = Column(Float, default=0)
    status = Column(SQLEnum(LeaseStatus), default=LeaseStatus.pending)
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="leases")
    tenant = relationship("Tenant", back_populates="leases")


class Maintenance(Base):
    __tablename__ = "maintenance"
    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    priority = Column(String(50), default="normal")
    status = Column(String(50), default="open")
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property")
    tenant = relationship("Tenant", back_populates="maintenance_requests")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class PropertyCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    province: Optional[str] = None
    country: Optional[str] = None
    units_total: int = 0


class PropertyRead(PropertyCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TenantCreate(BaseModel):
    full_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    notes: Optional[str] = None


class TenantRead(TenantCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class LeaseCreate(BaseModel):
    property_id: int
    tenant_id: int
    unit: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    rent: float = 0
    status: LeaseStatus = LeaseStatus.pending


class LeaseRead(LeaseCreate):
    id: int
    created_at: datetime
    property: Optional[PropertyRead] = None
    tenant: Optional[TenantRead] = None

    class Config:
        from_attributes = True


class MaintenanceCreate(BaseModel):
    property_id: int
    tenant_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    priority: str = "normal"
    status: str = "open"


class MaintenanceRead(MaintenanceCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


app = FastAPI(title="Property Management API", version="1.0.0")

allow_origins = ["*"] if ALLOWED_ORIGINS == "*" else [o.strip() for o in ALLOWED_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_data()


def seed_data():
    db = SessionLocal()
    try:
        if db.scalar(select(func.count()).select_from(Property)) > 0:
            return

        prop1 = Property(name="Harbor View Apartments", address="101 Waterfront Dr", city="Toronto", province="ON", country="Canada", units_total=24)
        prop2 = Property(name="Maple Grove Townhomes", address="77 Cedar Ave", city="Mississauga", province="ON", country="Canada", units_total=16)
        db.add_all([prop1, prop2])
        db.flush()

        tenant1 = Tenant(full_name="Alex Morgan", email="alex.morgan@example.com", phone="555-100-2000")
        tenant2 = Tenant(full_name="Jamie Patel", email="jamie.patel@example.com", phone="555-300-4000")
        db.add_all([tenant1, tenant2])
        db.flush()

        lease1 = Lease(property_id=prop1.id, tenant_id=tenant1.id, unit="A-201", start_date=date(2025, 1, 1), end_date=date(2025, 12, 31), rent=2200, status=LeaseStatus.active)
        lease2 = Lease(property_id=prop2.id, tenant_id=tenant2.id, unit="B-104", start_date=date(2025, 2, 1), end_date=date(2026, 1, 31), rent=1850, status=LeaseStatus.pending)
        db.add_all([lease1, lease2])

        m1 = Maintenance(property_id=prop1.id, tenant_id=tenant1.id, title="Leaky faucet", description="Kitchen faucet dripping", priority="low", status="open")
        m2 = Maintenance(property_id=prop2.id, tenant_id=tenant2.id, title="Heating issue", description="Living room heater not warming", priority="high", status="in_progress")
        db.add_all([m1, m2])

        db.commit()
    finally:
        db.close()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/properties", response_model=List[PropertyRead])
def list_properties(db: Session = Depends(get_db)):
    return db.scalars(select(Property).order_by(Property.created_at.desc())).all()


@app.post("/api/properties", response_model=PropertyRead, status_code=201)
def create_property(payload: PropertyCreate, db: Session = Depends(get_db)):
    prop = Property(**payload.model_dump())
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@app.get("/api/tenants", response_model=List[TenantRead])
def list_tenants(db: Session = Depends(get_db)):
    return db.scalars(select(Tenant).order_by(Tenant.created_at.desc())).all()


@app.post("/api/tenants", response_model=TenantRead, status_code=201)
def create_tenant(payload: TenantCreate, db: Session = Depends(get_db)):
    tenant = Tenant(**payload.model_dump())
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant


@app.get("/api/leases", response_model=List[LeaseRead])
def list_leases(db: Session = Depends(get_db)):
    return db.scalars(select(Lease).order_by(Lease.created_at.desc())).all()


@app.post("/api/leases", response_model=LeaseRead, status_code=201)
def create_lease(payload: LeaseCreate, db: Session = Depends(get_db)):
    prop = db.get(Property, payload.property_id)
    tenant = db.get(Tenant, payload.tenant_id)
    if not prop or not tenant:
        raise HTTPException(status_code=400, detail="Invalid property or tenant")
    lease = Lease(**payload.model_dump())
    db.add(lease)
    db.commit()
    db.refresh(lease)
    return lease


@app.get("/api/maintenance", response_model=List[MaintenanceRead])
def list_maintenance(db: Session = Depends(get_db)):
    return db.scalars(select(Maintenance).order_by(Maintenance.created_at.desc())).all()


@app.post("/api/maintenance", response_model=MaintenanceRead, status_code=201)
def create_maintenance(payload: MaintenanceCreate, db: Session = Depends(get_db)):
    if not db.get(Property, payload.property_id):
        raise HTTPException(status_code=400, detail="Invalid property")
    maint = Maintenance(**payload.model_dump())
    db.add(maint)
    db.commit()
    db.refresh(maint)
    return maint


@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    prop_count = db.scalar(select(func.count()).select_from(Property)) or 0
    tenant_count = db.scalar(select(func.count()).select_from(Tenant)) or 0
    lease_count = db.scalar(select(func.count()).select_from(Lease)) or 0
    open_tickets = db.scalar(select(func.count()).select_from(Maintenance).where(Maintenance.status != "closed")) or 0
    return {
        "properties": prop_count,
        "tenants": tenant_count,
        "leases": lease_count,
        "open_tickets": open_tickets,
    }
