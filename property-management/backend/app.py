import os
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, create_engine, Session, select

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://pm_user:pm_pass@postgres-pm:5432/property_management_db")

engine = create_engine(DATABASE_URL, echo=False)


class Property(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    address: str
    city: str
    state: str
    zip_code: str
    units_total: int
    units_available: int
    manager: str


class Tenant(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(foreign_key="property.id")
    name: str
    email: str
    phone: str
    unit: str
    lease_start: str
    lease_end: str
    rent: float


class MaintenanceRequest(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int = Field(foreign_key="property.id")
    tenant_id: Optional[int] = Field(default=None, foreign_key="tenant.id")
    title: str
    description: str
    status: str = "open"
    priority: str = "normal"


def get_session():
    with Session(engine) as session:
        yield session


app = FastAPI(title="Property Management API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)


# Properties
@app.get("/api/properties", response_model=List[Property])
def list_properties(session: Session = Depends(get_session)):
    return session.exec(select(Property)).all()


@app.post("/api/properties", response_model=Property, status_code=status.HTTP_201_CREATED)
def create_property(prop: Property, session: Session = Depends(get_session)):
    session.add(prop)
    session.commit()
    session.refresh(prop)
    return prop


# Tenants
@app.get("/api/tenants", response_model=List[Tenant])
def list_tenants(session: Session = Depends(get_session)):
    return session.exec(select(Tenant)).all()


@app.post("/api/tenants", response_model=Tenant, status_code=status.HTTP_201_CREATED)
def create_tenant(tenant: Tenant, session: Session = Depends(get_session)):
    # Ensure property exists
    prop = session.get(Property, tenant.property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    session.add(tenant)
    session.commit()
    session.refresh(tenant)
    return tenant


# Maintenance
@app.get("/api/maintenance", response_model=List[MaintenanceRequest])
def list_requests(session: Session = Depends(get_session)):
    return session.exec(select(MaintenanceRequest)).all()


@app.post("/api/maintenance", response_model=MaintenanceRequest, status_code=status.HTTP_201_CREATED)
def create_request(req: MaintenanceRequest, session: Session = Depends(get_session)):
    prop = session.get(Property, req.property_id)
    if not prop:
        raise HTTPException(status_code=404, detail="Property not found")
    if req.tenant_id:
        tenant = session.get(Tenant, req.tenant_id)
        if not tenant:
            raise HTTPException(status_code=404, detail="Tenant not found")
    session.add(req)
    session.commit()
    session.refresh(req)
    return req
