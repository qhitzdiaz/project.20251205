"""
FastAPI replacement for the Property Management backend (port 5050).
Supports properties, tenants, leases, maintenance, staff, invoices,
expenses, transactions, and contracts using SQLAlchemy ORM.
"""

import os
import uuid
import json
import urllib.parse
import urllib.request
from datetime import date, datetime, timedelta

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    Date,
    DateTime,
    Boolean,
    Text,
    ForeignKey,
    or_,
    func,
)
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session


# ==================== DATABASE SETUP ====================

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///property.db")
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
cors_origin = os.getenv("CORS_ORIGIN", "*")

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()
_schema_ready = False


# ==================== MODELS ====================


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    address = Column(Text)
    city = Column(String(100))
    province = Column(String(100))
    country = Column(String(100))
    units_total = Column(Integer, default=0)
    latitude = Column(Float)
    longitude = Column(Float)
    manager_name = Column(String(255))
    manager_phone = Column(String(100))
    manager_email = Column(String(255))
    postal_code = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    leases = relationship("Lease", back_populates="property", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="property", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="property", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="property", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="property", cascade="all, delete-orphan")
    maintenance_items = relationship("Maintenance", back_populates="property", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "province": self.province,
            "country": self.country,
            "units_total": self.units_total,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "manager_name": self.manager_name,
            "manager_phone": self.manager_phone,
            "manager_email": self.manager_email,
            "postal_code": self.postal_code,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    leases = relationship("Lease", back_populates="tenant", cascade="all, delete-orphan")
    maintenance_requests = relationship("Maintenance", back_populates="tenant")

    def to_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Lease(Base):
    __tablename__ = "leases"

    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    unit = Column(String(50))
    start_date = Column(Date)
    end_date = Column(Date)
    rent = Column(Float, default=0)
    rent_due_day = Column(Integer, default=1)
    deposit_amount = Column(Float, default=0.0)
    status = Column(String(50), default="draft")
    notice_given_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="leases")
    tenant = relationship("Tenant", back_populates="leases")
    transactions = relationship("Transaction", back_populates="lease", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="lease", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="lease", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "property_id": self.property_id,
            "tenant_id": self.tenant_id,
            "unit": self.unit,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "rent": self.rent,
            "rent_due_day": self.rent_due_day,
            "deposit_amount": self.deposit_amount,
            "status": self.status,
            "notice_given_at": self.notice_given_at.isoformat() if self.notice_given_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "property": self.property.to_dict() if self.property else None,
            "tenant": self.tenant.to_dict() if self.tenant else None,
        }


class Maintenance(Base):
    __tablename__ = "maintenance"

    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    priority = Column(String(50), default="medium")
    due_date = Column(Date)
    completed_at = Column(DateTime)
    status = Column(String(50), default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="maintenance_items")
    tenant = relationship("Tenant", back_populates="maintenance_requests")

    def to_dict(self):
        return {
            "id": self.id,
            "property_id": self.property_id,
            "tenant_id": self.tenant_id,
            "title": self.title,
            "description": self.description,
            "priority": self.priority,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    full_name = Column(String(255), nullable=False)
    role = Column(String(100))
    email = Column(String(255))
    phone = Column(String(100))
    department = Column(String(100))
    address = Column(Text)
    date_of_birth = Column(Date)
    start_date = Column(Date)
    notes = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="staff")

    def to_dict(self):
        return {
            "id": self.id,
            "property_id": self.property_id,
            "full_name": self.full_name,
            "role": self.role,
            "email": self.email,
            "phone": self.phone,
            "department": self.department,
            "address": self.address,
            "date_of_birth": self.date_of_birth.isoformat() if self.date_of_birth else None,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "notes": self.notes,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    lease_id = Column(Integer, ForeignKey("leases.id"))
    txn_type = Column(String(20), nullable=False)
    category = Column(String(100))
    amount = Column(Float, nullable=False)
    txn_date = Column(Date, nullable=False)
    status = Column(String(50), default="cleared")
    memo = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="transactions")
    lease = relationship("Lease", back_populates="transactions")

    def to_dict(self):
        return {
            "id": self.id,
            "property_id": self.property_id,
            "lease_id": self.lease_id,
            "txn_type": self.txn_type,
            "category": self.category,
            "amount": self.amount,
            "txn_date": self.txn_date.isoformat() if self.txn_date else None,
            "status": self.status,
            "memo": self.memo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "property": self.property.to_dict() if self.property else None,
            "lease": self.lease.to_dict() if self.lease else None,
        }


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True)
    number = Column(String(50), unique=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    lease_id = Column(Integer, ForeignKey("leases.id"))
    amount = Column(Float, nullable=False)
    status = Column(String(50), default="pending")
    due_date = Column(Date)
    issue_date = Column(Date, default=date.today)
    paid_at = Column(DateTime)
    memo = Column(Text)
    maintenance_id = Column(Integer, ForeignKey("maintenance.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="invoices")
    lease = relationship("Lease", back_populates="invoices")
    maintenance = relationship("Maintenance", backref="invoices")

    def to_dict(self):
        return {
            "id": self.id,
            "number": self.number,
            "property_id": self.property_id,
            "lease_id": self.lease_id,
            "amount": self.amount,
            "status": self.status,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "issue_date": self.issue_date.isoformat() if self.issue_date else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
            "memo": self.memo,
            "maintenance_id": self.maintenance_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "property": self.property.to_dict() if self.property else None,
            "lease": self.lease.to_dict() if self.lease else None,
        }


class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True)
    property_id = Column(Integer, ForeignKey("properties.id"))
    lease_id = Column(Integer, ForeignKey("leases.id"))
    maintenance_id = Column(Integer, ForeignKey("maintenance.id"))
    category = Column(String(100))
    amount = Column(Float, nullable=False)
    expense_date = Column(Date, nullable=False)
    status = Column(String(50), default="recorded")
    memo = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="expenses")
    lease = relationship("Lease", back_populates="expenses")
    maintenance = relationship("Maintenance", backref="expenses")

    def to_dict(self):
        return {
            "id": self.id,
            "property_id": self.property_id,
            "lease_id": self.lease_id,
            "maintenance_id": self.maintenance_id,
            "category": self.category,
            "amount": self.amount,
            "expense_date": self.expense_date.isoformat() if self.expense_date else None,
            "status": self.status,
            "memo": self.memo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "property": self.property.to_dict() if self.property else None,
            "lease": self.lease.to_dict() if self.lease else None,
        }


class Contract(Base):
    __tablename__ = "contracts"

    id = Column(Integer, primary_key=True)
    contract_number = Column(String(100), unique=True)
    contract_type = Column(String(100))
    party_name = Column(String(255))
    party_email = Column(String(255))
    party_phone = Column(String(100))
    start_date = Column(Date)
    end_date = Column(Date)
    value = Column(Float, default=0.0)
    status = Column(String(50), default="active")
    description = Column(Text)
    payment_terms = Column(Text)
    renewal_terms = Column(Text)
    termination_notice_days = Column(Integer, default=30)
    auto_renew = Column(Boolean, default=False)
    signed_at = Column(DateTime)
    signed_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "contract_number": self.contract_number,
            "contract_type": self.contract_type,
            "party_name": self.party_name,
            "party_email": self.party_email,
            "party_phone": self.party_phone,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "value": self.value,
            "status": self.status,
            "description": self.description,
            "payment_terms": self.payment_terms,
            "renewal_terms": self.renewal_terms,
            "termination_notice_days": self.termination_notice_days,
            "auto_renew": self.auto_renew,
            "signed_at": self.signed_at.isoformat() if self.signed_at else None,
            "signed_by": self.signed_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== HELPERS ====================


def parse_iso_date(value, field_name):
    if value is None or value == "":
        return None
    try:
        return date.fromisoformat(value)
    except Exception as exc:  # pragma: no cover - defensive
        raise ValueError(f"Invalid date for {field_name}; expected ISO date string") from exc


def parse_iso_datetime(value, field_name):
    if value is None or value == "":
        return None
    try:
        return datetime.fromisoformat(value).replace(tzinfo=None)
    except Exception as exc:  # pragma: no cover - defensive
        raise ValueError(f"Invalid datetime for {field_name}; expected ISO datetime string") from exc


def month_start_for(dt: date, months_back: int = 0) -> date:
    year = dt.year + (dt.month - 1 - months_back) // 12
    month = (dt.month - 1 - months_back) % 12 + 1
    return date(year, month, 1)


def generate_contract_number() -> str:
    today = datetime.utcnow().strftime("%Y%m%d")
    suffix = uuid.uuid4().hex[:6].upper()
    return f"CT-{today}-{suffix}"


def ensure_schema():
    global _schema_ready
    if _schema_ready:
        return
    with engine.begin() as conn:
        advisory_locked = False
        try:
            if engine.url.get_backend_name() not in ["sqlite"]:
                conn.exec_driver_sql("SELECT pg_advisory_lock(4815162342)")
                advisory_locked = True

            Base.metadata.create_all(bind=conn)

            if engine.url.get_backend_name() == "sqlite":
                _schema_ready = True
                return

            conn.exec_driver_sql(
                "CREATE TABLE IF NOT EXISTS staff (id SERIAL PRIMARY KEY, property_id INTEGER REFERENCES properties(id), full_name VARCHAR(255) NOT NULL, role VARCHAR(100), email VARCHAR(255), phone VARCHAR(100), department VARCHAR(100), address TEXT, date_of_birth DATE, start_date DATE, notes TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
            )
            conn.exec_driver_sql(
                "CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, property_id INTEGER REFERENCES properties(id), lease_id INTEGER REFERENCES leases(id), txn_type VARCHAR(20) NOT NULL, category VARCHAR(100), amount FLOAT NOT NULL, txn_date DATE NOT NULL, status VARCHAR(50) DEFAULT 'cleared', memo TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
            )
            conn.exec_driver_sql(
                "CREATE TABLE IF NOT EXISTS invoices (id SERIAL PRIMARY KEY, number VARCHAR(50) UNIQUE, property_id INTEGER REFERENCES properties(id), lease_id INTEGER REFERENCES leases(id), maintenance_id INTEGER REFERENCES maintenance(id), amount FLOAT NOT NULL, status VARCHAR(50) DEFAULT 'pending', due_date DATE, issue_date DATE, paid_at TIMESTAMP, memo TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
            )
            conn.exec_driver_sql(
                "CREATE TABLE IF NOT EXISTS expenses (id SERIAL PRIMARY KEY, property_id INTEGER REFERENCES properties(id), lease_id INTEGER REFERENCES leases(id), maintenance_id INTEGER REFERENCES maintenance(id), category VARCHAR(100), amount FLOAT NOT NULL, expense_date DATE NOT NULL, status VARCHAR(50) DEFAULT 'recorded', memo TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
            )
            conn.exec_driver_sql("ALTER TABLE properties ADD COLUMN IF NOT EXISTS manager_name VARCHAR(255)")
            conn.exec_driver_sql("ALTER TABLE properties ADD COLUMN IF NOT EXISTS manager_phone VARCHAR(100)")
            conn.exec_driver_sql("ALTER TABLE properties ADD COLUMN IF NOT EXISTS manager_email VARCHAR(255)")
            conn.exec_driver_sql("ALTER TABLE properties ADD COLUMN IF NOT EXISTS postal_code VARCHAR(20)")
            conn.exec_driver_sql("ALTER TABLE properties ADD COLUMN IF NOT EXISTS latitude FLOAT")
            conn.exec_driver_sql("ALTER TABLE properties ADD COLUMN IF NOT EXISTS longitude FLOAT")
            conn.exec_driver_sql("ALTER TABLE leases ADD COLUMN IF NOT EXISTS rent_due_day INTEGER DEFAULT 1")
            conn.exec_driver_sql("ALTER TABLE leases ADD COLUMN IF NOT EXISTS deposit_amount FLOAT DEFAULT 0")
            conn.exec_driver_sql("ALTER TABLE leases ADD COLUMN IF NOT EXISTS notice_given_at TIMESTAMP")
            conn.exec_driver_sql("ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS due_date DATE")
            conn.exec_driver_sql("ALTER TABLE maintenance ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP")
            conn.exec_driver_sql("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS maintenance_id INTEGER REFERENCES maintenance(id)")
            conn.exec_driver_sql("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS maintenance_id INTEGER REFERENCES maintenance(id)")
            conn.exec_driver_sql("ALTER TABLE contracts ADD COLUMN IF NOT EXISTS contract_number VARCHAR(100)")
            conn.exec_driver_sql("ALTER TABLE contracts ADD COLUMN IF NOT EXISTS party_email VARCHAR(255)")
            conn.exec_driver_sql("ALTER TABLE contracts ADD COLUMN IF NOT EXISTS party_phone VARCHAR(100)")
            conn.exec_driver_sql("ALTER TABLE contracts ADD COLUMN IF NOT EXISTS payment_terms TEXT")
            conn.exec_driver_sql("ALTER TABLE contracts ADD COLUMN IF NOT EXISTS renewal_terms TEXT")
            conn.exec_driver_sql("ALTER TABLE contracts ADD COLUMN IF NOT EXISTS termination_notice_days INTEGER DEFAULT 30")
            conn.exec_driver_sql("ALTER TABLE contracts ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT FALSE")
            conn.exec_driver_sql("ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_at TIMESTAMP")
            conn.exec_driver_sql("ALTER TABLE contracts ADD COLUMN IF NOT EXISTS signed_by VARCHAR(255)")
            conn.exec_driver_sql(
                "DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE c.relname = 'uq_contracts_number' AND n.nspname = 'public') THEN CREATE UNIQUE INDEX uq_contracts_number ON contracts(contract_number) WHERE contract_number IS NOT NULL; END IF; END $$;"
            )
        finally:
            if advisory_locked:
                conn.exec_driver_sql("SELECT pg_advisory_unlock(4815162342)")
    _schema_ready = True


def get_db():
    ensure_schema()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==================== SCHEMAS ====================


class PropertyIn(BaseModel):
    name: str
    address: str | None = None
    city: str | None = None
    province: str | None = None
    country: str | None = None
    units_total: int = 0
    latitude: float | None = None
    longitude: float | None = None
    manager_name: str | None = None
    manager_phone: str | None = None
    manager_email: str | None = None
    postal_code: str | None = None


class TenantIn(BaseModel):
    full_name: str
    email: str | None = None
    phone: str | None = None
    notes: str | None = None


class LeaseIn(BaseModel):
    property_id: int
    tenant_id: int
    unit: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    rent: float = 0
    rent_due_day: int = 1
    deposit_amount: float = 0.0
    status: str = "draft"
    notice_given_at: str | None = None


class MaintenanceIn(BaseModel):
    property_id: int
    tenant_id: int | None = None
    title: str
    description: str | None = None
    priority: str = "medium"
    due_date: str | None = None
    completed_at: str | None = None
    status: str = "pending"


class StaffIn(BaseModel):
    property_id: int | None = None
    full_name: str
    role: str | None = None
    email: str | None = None
    phone: str | None = None
    department: str | None = None
    address: str | None = None
    date_of_birth: str | None = None
    start_date: str | None = None
    is_active: bool = True


class InvoiceIn(BaseModel):
    number: str | None = None
    property_id: int | None = None
    lease_id: int | None = None
    maintenance_id: int | None = None
    amount: float
    status: str = "pending"
    due_date: str | None = None
    issue_date: str | None = None
    paid_at: str | None = None
    memo: str | None = None


class ExpenseIn(BaseModel):
    property_id: int | None = None
    lease_id: int | None = None
    maintenance_id: int | None = None
    category: str | None = None
    amount: float
    expense_date: str
    status: str = "recorded"
    memo: str | None = None


class TransactionIn(BaseModel):
    property_id: int | None = None
    lease_id: int | None = None
    txn_type: str
    category: str | None = None
    amount: float
    txn_date: str
    status: str = "cleared"
    memo: str | None = None


class ContractIn(BaseModel):
    contract_number: str | None = None
    contract_type: str | None = ""
    party_name: str | None = ""
    party_email: str | None = None
    party_phone: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    value: float = 0
    status: str = "active"
    description: str | None = ""
    payment_terms: str | None = None
    renewal_terms: str | None = None
    termination_notice_days: int = 30
    auto_renew: bool = False
    signed_at: str | None = None
    signed_by: str | None = None


# ==================== APP ====================

app = FastAPI(title="Property Management API", version="2.0-fastapi")
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


# ========== Health ==========


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "property-management-api", "port": 5050}


# ========== Properties ==========


@app.get("/api/properties")
def get_properties(db: Session = Depends(get_db)):
    props = db.query(Property).order_by(Property.created_at.desc()).all()
    return [p.to_dict() for p in props]


@app.get("/api/properties/{property_id}")
def get_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    return prop.to_dict()


@app.post("/api/properties", status_code=201)
def create_property(payload: PropertyIn, db: Session = Depends(get_db)):
    prop = Property(**payload.dict())
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop.to_dict()


@app.put("/api/properties/{property_id}")
def update_property(property_id: int, payload: PropertyIn, db: Session = Depends(get_db)):
    prop = db.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    for key, value in payload.dict().items():
        setattr(prop, key, value)
    db.commit()
    db.refresh(prop)
    return prop.to_dict()


@app.delete("/api/properties/{property_id}")
def delete_property(property_id: int, db: Session = Depends(get_db)):
    prop = db.get(Property, property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    db.delete(prop)
    db.commit()
    return {"message": "Property deleted successfully"}


# ========== Tenants ==========


@app.get("/api/tenants")
def get_tenants(db: Session = Depends(get_db)):
    tenants = db.query(Tenant).order_by(Tenant.created_at.desc()).all()
    return [t.to_dict() for t in tenants]


@app.get("/api/tenants/{tenant_id}")
def get_tenant(tenant_id: int, db: Session = Depends(get_db)):
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant.to_dict()


@app.post("/api/tenants", status_code=201)
def create_tenant(payload: TenantIn, db: Session = Depends(get_db)):
    tenant = Tenant(**payload.dict())
    db.add(tenant)
    db.commit()
    db.refresh(tenant)
    return tenant.to_dict()


@app.put("/api/tenants/{tenant_id}")
def update_tenant(tenant_id: int, payload: TenantIn, db: Session = Depends(get_db)):
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    for key, value in payload.dict().items():
        setattr(tenant, key, value)
    db.commit()
    db.refresh(tenant)
    return tenant.to_dict()


@app.delete("/api/tenants/{tenant_id}")
def delete_tenant(tenant_id: int, db: Session = Depends(get_db)):
    tenant = db.get(Tenant, tenant_id)
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    db.delete(tenant)
    db.commit()
    return {"message": "Tenant deleted successfully"}


# ========== Leases ==========


@app.get("/api/leases")
def get_leases(db: Session = Depends(get_db)):
    leases = db.query(Lease).order_by(Lease.created_at.desc()).all()
    return [l.to_dict() for l in leases]


@app.post("/api/leases", status_code=201)
def create_lease(payload: LeaseIn, db: Session = Depends(get_db)):
    prop = db.get(Property, payload.property_id)
    tenant = db.get(Tenant, payload.tenant_id)
    if not prop or not tenant:
        raise HTTPException(status_code=400, detail="Invalid property or tenant")
    lease = Lease(
        property_id=payload.property_id,
        tenant_id=payload.tenant_id,
        unit=payload.unit,
        start_date=parse_iso_date(payload.start_date, "start_date"),
        end_date=parse_iso_date(payload.end_date, "end_date"),
        rent=payload.rent,
        rent_due_day=payload.rent_due_day,
        deposit_amount=payload.deposit_amount,
        status=payload.status,
        notice_given_at=parse_iso_datetime(payload.notice_given_at, "notice_given_at"),
    )
    db.add(lease)
    db.commit()
    db.refresh(lease)
    return lease.to_dict()


@app.get("/api/leases/{lease_id}")
def get_lease(lease_id: int, db: Session = Depends(get_db)):
    lease = db.get(Lease, lease_id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    return lease.to_dict()


@app.put("/api/leases/{lease_id}")
def update_lease(lease_id: int, payload: LeaseIn, db: Session = Depends(get_db)):
    lease = db.get(Lease, lease_id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    if payload.property_id:
        prop = db.get(Property, payload.property_id)
        if not prop:
            raise HTTPException(status_code=400, detail="Invalid property")
    if payload.tenant_id:
        tenant = db.get(Tenant, payload.tenant_id)
        if not tenant:
            raise HTTPException(status_code=400, detail="Invalid tenant")
    lease.property_id = payload.property_id
    lease.tenant_id = payload.tenant_id
    lease.unit = payload.unit
    lease.start_date = parse_iso_date(payload.start_date, "start_date")
    lease.end_date = parse_iso_date(payload.end_date, "end_date")
    lease.rent = payload.rent
    lease.rent_due_day = payload.rent_due_day
    lease.deposit_amount = payload.deposit_amount
    lease.status = payload.status
    lease.notice_given_at = parse_iso_datetime(payload.notice_given_at, "notice_given_at")
    db.commit()
    db.refresh(lease)
    return lease.to_dict()


@app.delete("/api/leases/{lease_id}")
def delete_lease(lease_id: int, db: Session = Depends(get_db)):
    lease = db.get(Lease, lease_id)
    if not lease:
        raise HTTPException(status_code=404, detail="Lease not found")
    db.delete(lease)
    db.commit()
    return {"message": "Lease deleted successfully"}


# ========== Maintenance ==========


@app.get("/api/maintenance")
def get_maintenance(db: Session = Depends(get_db)):
    maintenance = db.query(Maintenance).order_by(Maintenance.created_at.desc()).all()
    return [m.to_dict() for m in maintenance]


@app.get("/api/maintenance/{maintenance_id}")
def get_maintenance_item(maintenance_id: int, db: Session = Depends(get_db)):
    ticket = db.get(Maintenance, maintenance_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    return ticket.to_dict()


@app.post("/api/maintenance", status_code=201)
def create_maintenance(payload: MaintenanceIn, db: Session = Depends(get_db)):
    prop = db.get(Property, payload.property_id)
    if not prop:
        raise HTTPException(status_code=400, detail="Invalid property")
    if payload.tenant_id:
        tenant = db.get(Tenant, payload.tenant_id)
        if not tenant:
            raise HTTPException(status_code=400, detail="Invalid tenant")
    maintenance = Maintenance(
        property_id=payload.property_id,
        tenant_id=payload.tenant_id,
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        due_date=parse_iso_date(payload.due_date, "due_date"),
        completed_at=parse_iso_datetime(payload.completed_at, "completed_at"),
        status=payload.status,
    )
    db.add(maintenance)
    db.commit()
    db.refresh(maintenance)
    return maintenance.to_dict()


@app.put("/api/maintenance/{maintenance_id}")
def update_maintenance(maintenance_id: int, payload: MaintenanceIn, db: Session = Depends(get_db)):
    ticket = db.get(Maintenance, maintenance_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    if payload.property_id:
        prop = db.get(Property, payload.property_id)
        if not prop:
            raise HTTPException(status_code=400, detail="Invalid property")
    if payload.tenant_id:
        tenant = db.get(Tenant, payload.tenant_id)
        if not tenant:
            raise HTTPException(status_code=400, detail="Invalid tenant")
    ticket.property_id = payload.property_id
    ticket.tenant_id = payload.tenant_id
    ticket.title = payload.title
    ticket.description = payload.description
    ticket.priority = payload.priority
    ticket.status = payload.status
    ticket.due_date = parse_iso_date(payload.due_date, "due_date")
    ticket.completed_at = parse_iso_datetime(payload.completed_at, "completed_at")
    db.commit()
    db.refresh(ticket)
    return ticket.to_dict()


@app.delete("/api/maintenance/{maintenance_id}")
def delete_maintenance(maintenance_id: int, db: Session = Depends(get_db)):
    ticket = db.get(Maintenance, maintenance_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Maintenance not found")
    db.delete(ticket)
    db.commit()
    return {"message": "Maintenance deleted successfully"}


# ========== Dashboard ==========


@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    today = date.today()
    in_30 = today + timedelta(days=30)
    in_60 = today + timedelta(days=60)
    in_90 = today + timedelta(days=90)

    prop_count = db.query(Property).count()
    tenant_count = db.query(Tenant).count()
    lease_count = db.query(Lease).count()
    staff_count = db.query(Staff).filter(Staff.is_active.is_(True)).count()

    lease_status_counts = dict(db.query(Lease.status, func.count(Lease.id)).group_by(Lease.status).all())
    overdue_rent = lease_status_counts.get("late", 0)
    active_leases = lease_status_counts.get("active", 0)
    total_units = db.query(func.coalesce(func.sum(Property.units_total), 0)).scalar()
    occupancy_rate = round((active_leases / total_units) * 100, 1) if total_units else None

    expiring_30 = (
        db.query(Lease)
        .filter(
            Lease.end_date.isnot(None),
            Lease.end_date >= today,
            Lease.end_date <= in_30,
            Lease.status.in_(["active", "draft"]),
        )
        .count()
    )
    expiring_60 = (
        db.query(Lease)
        .filter(
            Lease.end_date.isnot(None),
            Lease.end_date > in_30,
            Lease.end_date <= in_60,
            Lease.status.in_(["active", "draft"]),
        )
        .count()
    )
    expiring_90 = (
        db.query(Lease)
        .filter(
            Lease.end_date.isnot(None),
            Lease.end_date > in_60,
            Lease.end_date <= in_90,
            Lease.status.in_(["active", "draft"]),
        )
        .count()
    )

    maintenance_by_status = dict(db.query(Maintenance.status, func.count(Maintenance.id)).group_by(Maintenance.status).all())
    maintenance_by_priority = dict(
        db.query(Maintenance.priority, func.count(Maintenance.id)).group_by(Maintenance.priority).all()
    )
    open_tickets = db.query(Maintenance).filter(~Maintenance.status.in_(["completed", "cancelled"])).count()
    due_this_week = (
        db.query(Maintenance)
        .filter(
            Maintenance.due_date.isnot(None),
            Maintenance.due_date >= today,
            Maintenance.due_date <= today + timedelta(days=7),
            ~Maintenance.status.in_(["completed", "cancelled"]),
        )
        .order_by(Maintenance.due_date.asc())
        .limit(5)
        .all()
    )

    income_total = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(Transaction.txn_type == "income").scalar()
    expense_total = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(Transaction.txn_type == "expense").scalar()
    net_cash = round(income_total - expense_total, 2)

    monthly_cash = []
    for i in range(0, 6):
        month_start = month_start_for(today, i)
        next_month = month_start_for(today, i - 1)
        income = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(Transaction.txn_type == "income", Transaction.txn_date >= month_start, Transaction.txn_date < next_month)
            .scalar()
        )
        expense = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(Transaction.txn_type == "expense", Transaction.txn_date >= month_start, Transaction.txn_date < next_month)
            .scalar()
        )
        monthly_cash.append(
            {"month": month_start.strftime("%Y-%m"), "income": float(income or 0), "expense": float(expense or 0), "net": float((income or 0) - (expense or 0))}
        )

    properties_missing_manager = (
        db.query(Property).filter(or_(Property.manager_name.is_(None), Property.manager_name == "")).count()
    )
    leases_expiring_soon = (
        db.query(Lease)
        .filter(
            Lease.end_date.isnot(None),
            Lease.end_date >= today,
            Lease.end_date <= in_60,
            Lease.status.in_(["active", "draft"]),
        )
        .order_by(Lease.end_date.asc())
        .limit(5)
        .all()
    )

    def serialize_lease(lease: Lease):
        return {
            "id": lease.id,
            "unit": lease.unit,
            "status": lease.status,
            "rent": lease.rent,
            "end_date": lease.end_date.isoformat() if lease.end_date else None,
            "property": lease.property.to_dict() if lease.property else None,
            "tenant": lease.tenant.to_dict() if lease.tenant else None,
        }

    def serialize_ticket(ticket: Maintenance):
        return {
            "id": ticket.id,
            "title": ticket.title,
            "status": ticket.status,
            "priority": ticket.priority,
            "due_date": ticket.due_date.isoformat() if ticket.due_date else None,
            "property_id": ticket.property_id,
            "tenant_id": ticket.tenant_id,
        }

    return {
        "summary": {"properties": prop_count, "tenants": tenant_count, "leases": lease_count, "staff": staff_count},
        "leases": {
            "status_counts": lease_status_counts,
            "overdue_rent": overdue_rent,
            "expiring": {"days_30": expiring_30, "days_60": expiring_60, "days_90": expiring_90},
            "occupancy": {"active_leases": active_leases, "total_units": total_units, "occupancy_rate": occupancy_rate},
            "expiring_soon": [serialize_lease(l) for l in leases_expiring_soon],
        },
        "maintenance": {
            "open_tickets": open_tickets,
            "by_status": maintenance_by_status,
            "by_priority": maintenance_by_priority,
            "due_this_week": [serialize_ticket(t) for t in due_this_week],
        },
        "admin": {"income_total": float(income_total or 0), "expense_total": float(expense_total or 0), "net_cash": net_cash, "cashflow": list(reversed(monthly_cash))},
        "alerts": {"properties_missing_manager": properties_missing_manager},
    }


# ========== Staff ==========


@app.get("/api/staff")
def list_staff(property_id: int | None = Query(default=None), active_only: bool = Query(default=True), db: Session = Depends(get_db)):
    query = db.query(Staff)
    if property_id:
        query = query.filter_by(property_id=property_id)
    if active_only:
        query = query.filter_by(is_active=True)
    staff = query.order_by(Staff.full_name.asc()).all()
    return [s.to_dict() for s in staff]


@app.post("/api/staff", status_code=201)
def create_staff(payload: StaffIn, db: Session = Depends(get_db)):
    staff = Staff(
        property_id=payload.property_id,
        full_name=payload.full_name,
        role=payload.role,
        email=payload.email,
        phone=payload.phone,
        department=payload.department,
        address=payload.address,
        date_of_birth=parse_iso_date(payload.date_of_birth, "date_of_birth"),
        start_date=parse_iso_date(payload.start_date, "start_date"),
        is_active=payload.is_active,
    )
    db.add(staff)
    db.commit()
    db.refresh(staff)
    return staff.to_dict()


@app.put("/api/staff/{staff_id}")
def update_staff(staff_id: int, payload: StaffIn, db: Session = Depends(get_db)):
    staff = db.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    for key, value in payload.dict().items():
        if key in {"date_of_birth", "start_date"}:
            setattr(staff, key, parse_iso_date(value, key))
        else:
            setattr(staff, key, value)
    db.commit()
    db.refresh(staff)
    return staff.to_dict()


@app.delete("/api/staff/{staff_id}")
def delete_staff(staff_id: int, db: Session = Depends(get_db)):
    staff = db.get(Staff, staff_id)
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
    db.delete(staff)
    db.commit()
    return {"message": "Staff deleted successfully"}


# ========== Geocode ==========


@app.post("/api/geocode")
def geocode_address(payload: dict, db: Session = Depends(get_db)):  # db dep to keep schema warm
    address = payload.get("address", "")
    if not address:
        raise HTTPException(status_code=400, detail="Address is required")
    parts = [payload.get("address", ""), payload.get("city", ""), payload.get("province", ""), payload.get("country", "")]
    full_address = ", ".join([p for p in parts if p])
    encoded_address = urllib.parse.quote(full_address)
    url = f"https://nominatim.openstreetmap.org/search?q={encoded_address}&format=json&limit=1"
    req = urllib.request.Request(url)
    req.add_header("User-Agent", "PropertyManagementApp/1.0")
    with urllib.request.urlopen(req, timeout=5) as response:
        results = json.loads(response.read().decode())
    if not results:
        raise HTTPException(status_code=404, detail="Address not found")
    result = results[0]
    return {"latitude": float(result["lat"]), "longitude": float(result["lon"]), "display_name": result.get("display_name", "")}


# ========== Invoices ==========


@app.get("/api/invoices")
def list_invoices(
    property_id: int | None = Query(default=None),
    lease_id: int | None = Query(default=None),
    maintenance_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Invoice)
    if property_id:
        query = query.filter_by(property_id=property_id)
    if lease_id:
        query = query.filter_by(lease_id=lease_id)
    if maintenance_id:
        query = query.filter_by(maintenance_id=maintenance_id)
    if status:
        query = query.filter_by(status=status)
    if q:
        like_pattern = f"%{q.strip()}%"
        query = query.filter(or_(Invoice.number.ilike(like_pattern), Invoice.memo.ilike(like_pattern)))
    query = query.join(Property, isouter=True).join(Lease, isouter=True)
    invoices = query.order_by(Invoice.due_date.asc().nullslast(), Invoice.created_at.desc()).all()
    return [i.to_dict() for i in invoices]


@app.post("/api/invoices", status_code=201)
def create_invoice(payload: InvoiceIn, db: Session = Depends(get_db)):
    issue_date = parse_iso_date(payload.issue_date, "issue_date") or date.today()
    due_date = parse_iso_date(payload.due_date, "due_date")
    paid_at = parse_iso_datetime(payload.paid_at, "paid_at")
    if payload.property_id and not db.get(Property, payload.property_id):
        raise HTTPException(status_code=400, detail="Invalid property")
    if payload.lease_id and not db.get(Lease, payload.lease_id):
        raise HTTPException(status_code=400, detail="Invalid lease")
    inv = Invoice(
        number=payload.number,
        property_id=payload.property_id,
        lease_id=payload.lease_id,
        maintenance_id=payload.maintenance_id,
        amount=payload.amount,
        status=payload.status,
        due_date=due_date,
        issue_date=issue_date,
        paid_at=paid_at,
        memo=payload.memo,
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv.to_dict()


@app.put("/api/invoices/{invoice_id}")
def update_invoice(invoice_id: int, payload: InvoiceIn, db: Session = Depends(get_db)):
    inv = db.get(Invoice, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if payload.property_id and not db.get(Property, payload.property_id):
        raise HTTPException(status_code=400, detail="Invalid property")
    if payload.lease_id and not db.get(Lease, payload.lease_id):
        raise HTTPException(status_code=400, detail="Invalid lease")
    if payload.maintenance_id and not db.get(Maintenance, payload.maintenance_id):
        raise HTTPException(status_code=400, detail="Invalid maintenance")
    inv.number = payload.number
    inv.property_id = payload.property_id
    inv.lease_id = payload.lease_id
    inv.maintenance_id = payload.maintenance_id
    inv.amount = payload.amount
    inv.status = payload.status
    inv.due_date = parse_iso_date(payload.due_date, "due_date")
    inv.issue_date = parse_iso_date(payload.issue_date, "issue_date")
    inv.paid_at = parse_iso_datetime(payload.paid_at, "paid_at")
    inv.memo = payload.memo
    db.commit()
    db.refresh(inv)
    return inv.to_dict()


@app.delete("/api/invoices/{invoice_id}")
def delete_invoice(invoice_id: int, db: Session = Depends(get_db)):
    inv = db.get(Invoice, invoice_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(inv)
    db.commit()
    return {"message": "Invoice deleted successfully"}


# ========== Expenses ==========


@app.get("/api/expenses")
def list_expenses(
    property_id: int | None = Query(default=None),
    lease_id: int | None = Query(default=None),
    maintenance_id: int | None = Query(default=None),
    status: str | None = Query(default=None),
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Expense)
    if property_id:
        query = query.filter_by(property_id=property_id)
    if lease_id:
        query = query.filter_by(lease_id=lease_id)
    if maintenance_id:
        query = query.filter_by(maintenance_id=maintenance_id)
    if status:
        query = query.filter_by(status=status)
    if q:
        like_pattern = f"%{q.strip()}%"
        query = query.filter(or_(Expense.memo.ilike(like_pattern), Expense.category.ilike(like_pattern)))
    expenses = query.order_by(Expense.expense_date.desc(), Expense.created_at.desc()).all()
    return [e.to_dict() for e in expenses]


@app.post("/api/expenses", status_code=201)
def create_expense(payload: ExpenseIn, db: Session = Depends(get_db)):
    if payload.property_id and not db.get(Property, payload.property_id):
        raise HTTPException(status_code=400, detail="Invalid property")
    if payload.lease_id and not db.get(Lease, payload.lease_id):
        raise HTTPException(status_code=400, detail="Invalid lease")
    if payload.maintenance_id and not db.get(Maintenance, payload.maintenance_id):
        raise HTTPException(status_code=400, detail="Invalid maintenance")
    exp = Expense(
        property_id=payload.property_id,
        lease_id=payload.lease_id,
        maintenance_id=payload.maintenance_id,
        category=payload.category,
        amount=payload.amount,
        expense_date=parse_iso_date(payload.expense_date, "expense_date"),
        status=payload.status,
        memo=payload.memo,
    )
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp.to_dict()


@app.put("/api/expenses/{expense_id}")
def update_expense(expense_id: int, payload: ExpenseIn, db: Session = Depends(get_db)):
    exp = db.get(Expense, expense_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    if payload.property_id and not db.get(Property, payload.property_id):
        raise HTTPException(status_code=400, detail="Invalid property")
    if payload.lease_id and not db.get(Lease, payload.lease_id):
        raise HTTPException(status_code=400, detail="Invalid lease")
    if payload.maintenance_id and not db.get(Maintenance, payload.maintenance_id):
        raise HTTPException(status_code=400, detail="Invalid maintenance")
    exp.property_id = payload.property_id
    exp.lease_id = payload.lease_id
    exp.maintenance_id = payload.maintenance_id
    exp.category = payload.category
    exp.amount = payload.amount
    exp.expense_date = parse_iso_date(payload.expense_date, "expense_date")
    exp.status = payload.status
    exp.memo = payload.memo
    db.commit()
    db.refresh(exp)
    return exp.to_dict()


@app.delete("/api/expenses/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    exp = db.get(Expense, expense_id)
    if not exp:
        raise HTTPException(status_code=404, detail="Expense not found")
    db.delete(exp)
    db.commit()
    return {"message": "Expense deleted successfully"}


# ========== Transactions ==========


@app.get("/api/transactions")
def list_transactions(property_id: int | None = Query(default=None), txn_type: str | None = Query(default=None), month: str | None = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(Transaction)
    if property_id:
        query = query.filter_by(property_id=property_id)
    if txn_type in ["income", "expense"]:
        query = query.filter_by(txn_type=txn_type)
    if month:
        try:
            year, m = month.split("-")
            month_start = date(int(year), int(m), 1)
            next_month = (month_start + timedelta(days=32)).replace(day=1)
            query = query.filter(Transaction.txn_date >= month_start, Transaction.txn_date < next_month)
        except Exception:
            raise HTTPException(status_code=400, detail="month must be YYYY-MM")
    items = query.order_by(Transaction.txn_date.desc(), Transaction.id.desc()).all()
    return [t.to_dict() for t in items]


@app.post("/api/transactions", status_code=201)
def create_transaction(payload: TransactionIn, db: Session = Depends(get_db)):
    if payload.txn_type not in ["income", "expense"]:
        raise HTTPException(status_code=400, detail="txn_type must be income or expense")
    if payload.property_id and not db.get(Property, payload.property_id):
        raise HTTPException(status_code=400, detail="Invalid property")
    if payload.lease_id and not db.get(Lease, payload.lease_id):
        raise HTTPException(status_code=400, detail="Invalid lease")
    txn = Transaction(
        property_id=payload.property_id,
        lease_id=payload.lease_id,
        txn_type=payload.txn_type,
        category=payload.category,
        amount=payload.amount,
        txn_date=parse_iso_date(payload.txn_date, "txn_date"),
        status=payload.status,
        memo=payload.memo,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn.to_dict()


@app.put("/api/transactions/{txn_id}")
def update_transaction(txn_id: int, payload: TransactionIn, db: Session = Depends(get_db)):
    txn = db.get(Transaction, txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if payload.txn_type not in ["income", "expense"]:
        raise HTTPException(status_code=400, detail="txn_type must be income or expense")
    if payload.property_id and not db.get(Property, payload.property_id):
        raise HTTPException(status_code=400, detail="Invalid property")
    if payload.lease_id and not db.get(Lease, payload.lease_id):
        raise HTTPException(status_code=400, detail="Invalid lease")
    txn.property_id = payload.property_id
    txn.lease_id = payload.lease_id
    txn.txn_type = payload.txn_type
    txn.category = payload.category
    txn.amount = payload.amount
    txn.txn_date = parse_iso_date(payload.txn_date, "txn_date")
    txn.status = payload.status
    txn.memo = payload.memo
    db.commit()
    db.refresh(txn)
    return txn.to_dict()


@app.delete("/api/transactions/{txn_id}")
def delete_transaction(txn_id: int, db: Session = Depends(get_db)):
    txn = db.get(Transaction, txn_id)
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(txn)
    db.commit()
    return {"message": "Transaction deleted successfully"}


@app.get("/api/admin/summary")
def admin_summary(months: int = Query(default=6), db: Session = Depends(get_db)):
    today = date.today()
    income_total = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(Transaction.txn_type == "income").scalar()
    expense_total = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)).filter(Transaction.txn_type == "expense").scalar()
    net_cash = float((income_total or 0) - (expense_total or 0))
    cashflow = []
    for i in range(months):
        month_val = month_start_for(today, i)
        next_month = month_start_for(today, i - 1)
        income = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(Transaction.txn_type == "income", Transaction.txn_date >= month_val, Transaction.txn_date < next_month)
            .scalar()
        )
        expense = (
            db.query(func.coalesce(func.sum(Transaction.amount), 0.0))
            .filter(Transaction.txn_type == "expense", Transaction.txn_date >= month_val, Transaction.txn_date < next_month)
            .scalar()
        )
        cashflow.append(
            {"month": month_val.strftime("%Y-%m"), "income": float(income or 0), "expense": float(expense or 0), "net": float((income or 0) - (expense or 0))}
        )
    return {"income_total": float(income_total or 0), "expense_total": float(expense_total or 0), "net_cash": net_cash, "cashflow": list(reversed(cashflow))}


# ========== Contracts ==========


@app.get("/api/contracts")
def get_contracts(status: str | None = Query(default=None), db: Session = Depends(get_db)):
    query = db.query(Contract)
    if status:
        query = query.filter_by(status=status)
    contracts = query.order_by(Contract.created_at.desc()).all()
    return [c.to_dict() for c in contracts]


@app.get("/api/contracts/{contract_id}")
def get_contract(contract_id: int, db: Session = Depends(get_db)):
    contract = db.get(Contract, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract.to_dict()


@app.post("/api/contracts", status_code=201)
def create_contract(payload: ContractIn, db: Session = Depends(get_db)):
    contract = Contract()
    contract.contract_number = payload.contract_number or generate_contract_number()
    contract.contract_type = payload.contract_type or ""
    contract.party_name = payload.party_name or ""
    contract.party_email = payload.party_email
    contract.party_phone = payload.party_phone
    contract.start_date = parse_iso_date(payload.start_date, "start_date")
    contract.end_date = parse_iso_date(payload.end_date, "end_date")
    contract.value = float(payload.value or 0)
    contract.status = payload.status or "active"
    contract.description = payload.description or ""
    contract.payment_terms = payload.payment_terms
    contract.renewal_terms = payload.renewal_terms
    contract.termination_notice_days = int(payload.termination_notice_days or 30)
    contract.auto_renew = bool(payload.auto_renew)
    contract.signed_at = parse_iso_datetime(payload.signed_at, "signed_at") if payload.signed_at else None
    contract.signed_by = payload.signed_by
    db.add(contract)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Contract number already exists. Provide a unique value.")
    db.refresh(contract)
    return contract.to_dict()


@app.put("/api/contracts/{contract_id}")
def update_contract(contract_id: int, payload: ContractIn, db: Session = Depends(get_db)):
    contract = db.get(Contract, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    try:
        for key, value in payload.dict().items():
            if key in {"start_date", "end_date"}:
                setattr(contract, key, parse_iso_date(value, key))
            elif key == "signed_at":
                contract.signed_at = parse_iso_datetime(value, "signed_at") if value else None
            elif key == "value":
                contract.value = float(value or 0)
            elif key == "termination_notice_days":
                contract.termination_notice_days = int(value or 0)
            elif key == "auto_renew":
                contract.auto_renew = bool(value)
            else:
                setattr(contract, key, value)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Contract number already exists. Provide a unique value.")
    db.refresh(contract)
    return contract.to_dict()


@app.delete("/api/contracts/{contract_id}")
def delete_contract(contract_id: int, db: Session = Depends(get_db)):
    contract = db.get(Contract, contract_id)
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    db.delete(contract)
    db.commit()
    return {"message": "Contract deleted successfully"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("fastapi_property:app", host="0.0.0.0", port=5050, reload=False)
