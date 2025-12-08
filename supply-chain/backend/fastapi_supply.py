"""
FastAPI replacement for the Supply Chain backend (port 5070).
Supports suppliers, products, purchase orders + items, dashboard, and shipments placeholder.
"""

import os
from datetime import datetime
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    create_engine,
    func,
)
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session

# ==================== CONFIG ====================

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://supply_user:supplypass123@postgres-supply:5432/supply_chain_db",
)
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
cors_origin = os.getenv("CORS_ORIGIN", "*")

engine = create_engine(DATABASE_URL, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()
_schema_ready = False


# ==================== MODELS ====================


class Supplier(Base):
    __tablename__ = "suppliers"

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    contact_person = Column(String(255))
    email = Column(String(255))
    phone = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    country = Column(String(100))
    status = Column(String(50), default="active")
    rating = Column(Float, default=0.0)
    primary_contact = Column(String(255))
    contact_phone = Column(String(50))
    contact_email = Column(String(255))
    on_time_score = Column(Float, default=0.0)
    quality_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    products = relationship("Product", back_populates="supplier", cascade="all, delete-orphan")
    purchase_orders = relationship("PurchaseOrder", back_populates="supplier", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "contact_person": self.contact_person,
            "email": self.email,
            "phone": self.phone,
            "address": self.address,
            "city": self.city,
            "country": self.country,
            "status": self.status,
            "rating": self.rating,
            "primary_contact": self.primary_contact,
            "contact_phone": self.contact_phone,
            "contact_email": self.contact_email,
            "on_time_score": self.on_time_score,
            "quality_score": self.quality_score,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True)
    sku = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(100))
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    unit_price = Column(Float, default=0.0)
    standard_cost = Column(Float, default=0.0)
    unit_of_measure = Column(String(50))
    quantity_in_stock = Column(Integer, default=0)
    reorder_level = Column(Integer, default=10)
    safety_stock = Column(Integer, default=0)
    lead_time_days = Column(Integer, default=0)
    status = Column(String(50), default="available")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="products")

    def to_dict(self):
        return {
            "id": self.id,
            "sku": self.sku,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "supplier_id": self.supplier_id,
            "unit_price": self.unit_price,
            "standard_cost": self.standard_cost,
            "unit_of_measure": self.unit_of_measure,
            "quantity_in_stock": self.quantity_in_stock,
            "reorder_level": self.reorder_level,
            "safety_stock": self.safety_stock,
            "lead_time_days": self.lead_time_days,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True)
    order_number = Column(String(100), unique=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"), nullable=False)
    order_date = Column(DateTime, default=datetime.utcnow)
    expected_delivery = Column(DateTime)
    received_at = Column(DateTime)
    status = Column(String(50), default="pending")
    total_amount = Column(Float, default=0.0)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="purchase_orders")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")

    def to_dict(self, include_items: bool = False):
        data = {
            "id": self.id,
            "order_number": self.order_number,
            "supplier_id": self.supplier_id,
            "order_date": self.order_date.isoformat() if self.order_date else None,
            "expected_delivery": self.expected_delivery.isoformat() if self.expected_delivery else None,
            "status": self.status,
            "total_amount": self.total_amount,
            "notes": self.notes,
            "received_at": self.received_at.isoformat() if self.received_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_items:
            data["items"] = [item.to_dict() for item in self.items]
        return data


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product")

    def to_dict(self):
        return {
            "id": self.id,
            "purchase_order_id": self.purchase_order_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "unit_price": self.unit_price,
            "subtotal": self.subtotal,
        }


# ==================== DB HELPERS ====================


def ensure_schema():
    global _schema_ready
    if _schema_ready:
        return
    with engine.begin() as conn:
        Base.metadata.create_all(bind=conn)
        conn.exec_driver_sql("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS primary_contact VARCHAR(255)")
        conn.exec_driver_sql("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50)")
        conn.exec_driver_sql("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255)")
        conn.exec_driver_sql("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS on_time_score FLOAT DEFAULT 0.0")
        conn.exec_driver_sql("ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS quality_score FLOAT DEFAULT 0.0")
        conn.exec_driver_sql("ALTER TABLE products ADD COLUMN IF NOT EXISTS standard_cost FLOAT DEFAULT 0.0")
        conn.exec_driver_sql("ALTER TABLE products ADD COLUMN IF NOT EXISTS unit_of_measure VARCHAR(50)")
        conn.exec_driver_sql("ALTER TABLE products ADD COLUMN IF NOT EXISTS safety_stock INTEGER DEFAULT 0")
        conn.exec_driver_sql("ALTER TABLE products ADD COLUMN IF NOT EXISTS lead_time_days INTEGER DEFAULT 0")
        conn.exec_driver_sql("ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS received_at TIMESTAMP")
    _schema_ready = True


def get_db():
    ensure_schema()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def parse_dt(value: Optional[str]):
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid datetime; expected ISO format") from exc


# ==================== SCHEMAS ====================


class SupplierIn(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    status: str = "active"
    rating: float = 0.0
    primary_contact: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    on_time_score: float = 0.0
    quality_score: float = 0.0


class ProductIn(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    supplier_id: Optional[int] = None
    unit_price: float = 0.0
    standard_cost: float = 0.0
    unit_of_measure: Optional[str] = None
    quantity_in_stock: int = 0
    reorder_level: int = 10
    safety_stock: int = 0
    lead_time_days: int = 0
    status: str = "available"


class PurchaseOrderItemIn(BaseModel):
    product_id: int
    quantity: int
    unit_price: float


class PurchaseOrderIn(BaseModel):
    order_number: str
    supplier_id: int
    expected_delivery: Optional[str] = None
    status: str = "draft"
    total_amount: float = 0.0
    notes: Optional[str] = None
    received_at: Optional[str] = None
    items: List[PurchaseOrderItemIn] = Field(default_factory=list)


# ==================== APP ====================

app = FastAPI(title="Supply Chain API", version="2.0-fastapi")
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
def health_check():
    return {
        "status": "healthy",
        "service": "supply-chain-api",
        "port": 5070,
        "timestamp": datetime.utcnow().isoformat(),
    }


# ========== Supplier Endpoints ==========


@app.get("/suppliers")
def get_suppliers(db: Session = Depends(get_db)):
    suppliers = db.query(Supplier).all()
    return [s.to_dict() for s in suppliers]


@app.get("/suppliers/{supplier_id}")
def get_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier.to_dict()


@app.post("/suppliers", status_code=201)
def create_supplier(payload: SupplierIn, db: Session = Depends(get_db)):
    supplier = Supplier(**payload.dict())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier.to_dict()


@app.put("/suppliers/{supplier_id}")
def update_supplier(supplier_id: int, payload: SupplierIn, db: Session = Depends(get_db)):
    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    for key, value in payload.dict().items():
        setattr(supplier, key, value)
    supplier.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(supplier)
    return supplier.to_dict()


@app.delete("/suppliers/{supplier_id}")
def delete_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found")
    db.delete(supplier)
    db.commit()
    return {"message": "Supplier deleted successfully"}


# ========== Product Endpoints ==========


@app.get("/products")
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return [p.to_dict() for p in products]


@app.get("/products/{product_id}")
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product.to_dict()


@app.post("/products", status_code=201)
def create_product(payload: ProductIn, db: Session = Depends(get_db)):
    supplier_id = payload.supplier_id
    if not supplier_id:
        first_supplier = db.query(Supplier).first()
        if not first_supplier:
            raise HTTPException(status_code=400, detail="No supplier available. Please add a supplier first.")
        supplier_id = first_supplier.id
    product = Product(
        sku=payload.sku,
        name=payload.name,
        description=payload.description,
        category=payload.category,
        supplier_id=supplier_id,
        unit_price=payload.unit_price,
        standard_cost=payload.standard_cost,
        unit_of_measure=payload.unit_of_measure,
        quantity_in_stock=payload.quantity_in_stock,
        reorder_level=payload.reorder_level,
        safety_stock=payload.safety_stock,
        lead_time_days=payload.lead_time_days,
        status=payload.status,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return product.to_dict()


@app.put("/products/{product_id}")
def update_product(product_id: int, payload: ProductIn, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in payload.dict().items():
        setattr(product, key, value)
    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    return product.to_dict()


@app.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}


# ========== Purchase Orders ==========


@app.get("/purchase-orders")
def get_purchase_orders(db: Session = Depends(get_db)):
    orders = db.query(PurchaseOrder).all()
    return [o.to_dict() for o in orders]


@app.get("/purchase-orders/{order_id}")
def get_purchase_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(PurchaseOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    return order.to_dict(include_items=True)


@app.post("/purchase-orders", status_code=201)
def create_purchase_order(payload: PurchaseOrderIn, db: Session = Depends(get_db)):
    order = PurchaseOrder(
        order_number=payload.order_number,
        supplier_id=payload.supplier_id,
        expected_delivery=parse_dt(payload.expected_delivery),
        status=payload.status,
        total_amount=payload.total_amount,
        notes=payload.notes,
        received_at=parse_dt(payload.received_at),
    )
    db.add(order)
    db.flush()
    total = 0.0
    for item_data in payload.items:
        subtotal = item_data.quantity * item_data.unit_price
        total += subtotal
        item = PurchaseOrderItem(
            purchase_order_id=order.id,
            product_id=item_data.product_id,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            subtotal=subtotal,
        )
        db.add(item)
    order.total_amount = total if total else order.total_amount
    db.commit()
    db.refresh(order)
    return order.to_dict()


@app.put("/purchase-orders/{order_id}")
def update_purchase_order(order_id: int, payload: PurchaseOrderIn, db: Session = Depends(get_db)):
    order = db.get(PurchaseOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    order.status = payload.status or order.status
    order.expected_delivery = parse_dt(payload.expected_delivery) or order.expected_delivery
    order.received_at = parse_dt(payload.received_at) or order.received_at
    order.total_amount = payload.total_amount if payload.total_amount is not None else order.total_amount
    order.notes = payload.notes if payload.notes is not None else order.notes
    order.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(order)
    return order.to_dict()


@app.delete("/purchase-orders/{order_id}")
def delete_purchase_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(PurchaseOrder, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Purchase order not found")
    db.delete(order)
    db.commit()
    return {"message": "Purchase order deleted successfully"}


# ========== Dashboard & Shipments ==========


@app.get("/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    total_suppliers = db.query(Supplier).count()
    active_suppliers = db.query(Supplier).filter_by(status="active").count()
    total_products = db.query(Product).count()
    low_stock_products = db.query(Product).filter(Product.quantity_in_stock <= Product.reorder_level).count()
    total_orders = db.query(PurchaseOrder).count()
    pending_orders = db.query(PurchaseOrder).filter_by(status="pending").count()
    return {
        "totalSuppliers": total_suppliers,
        "totalProducts": total_products,
        "totalPurchaseOrders": total_orders,
        "totalShipments": 0,
        "activeSuppliers": active_suppliers,
        "lowStockProducts": low_stock_products,
        "pendingOrders": pending_orders,
    }


@app.get("/shipments")
def get_shipments(db: Session = Depends(get_db)):  # db keeps schema warm
    return []


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("fastapi_supply:app", host="0.0.0.0", port=5070, reload=False)
