import os
from datetime import datetime, date
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import Column, Date, DateTime, Enum, Float, ForeignKey, Integer, String, Text, create_engine, func, select
from sqlalchemy.orm import declarative_base, relationship, sessionmaker, Session
import enum


DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+psycopg2://supplychain:supplychain@db:5432/supplychain_db")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")

engine = create_engine(DATABASE_URL, echo=False, future=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


class PurchaseStatus(str, enum.Enum):
    draft = "draft"
    ordered = "ordered"
    received = "received"
    cancelled = "cancelled"


class ShipmentStatus(str, enum.Enum):
    pending = "pending"
    in_transit = "in_transit"
    delivered = "delivered"
    delayed = "delayed"


class MovementType(str, enum.Enum):
    inbound = "inbound"
    outbound = "outbound"
    adjust = "adjust"


class Supplier(Base):
    __tablename__ = "suppliers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    contact_name = Column(String(255))
    phone = Column(String(50))
    email = Column(String(255))
    address = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="supplier")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(100), unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    unit_cost = Column(Float, default=0)
    unit = Column(String(50), default="unit")
    reorder_level = Column(Integer, default=0)
    reorder_quantity = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier", back_populates="products")
    order_items = relationship("PurchaseOrderItem", back_populates="product")
    movements = relationship("InventoryMovement", back_populates="product")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"
    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String(100), unique=True, nullable=False)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    status = Column(Enum(PurchaseStatus), default=PurchaseStatus.draft)
    expected_date = Column(Date)
    notes = Column(Text)
    total_amount = Column(Float, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    supplier = relationship("Supplier")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")
    shipments = relationship("Shipment", back_populates="purchase_order")


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"
    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id", ondelete="CASCADE"))
    product_id = Column(Integer, ForeignKey("products.id"))
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Float, nullable=False)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    product = relationship("Product", back_populates="order_items")


class Shipment(Base):
    __tablename__ = "shipments"
    id = Column(Integer, primary_key=True, index=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"))
    carrier = Column(String(100))
    tracking_number = Column(String(255))
    eta = Column(Date)
    status = Column(Enum(ShipmentStatus), default=ShipmentStatus.pending)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    purchase_order = relationship("PurchaseOrder", back_populates="shipments")


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    movement_type = Column(Enum(MovementType), nullable=False)
    quantity = Column(Integer, nullable=False)
    reason = Column(String(255))
    reference = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Product", back_populates="movements")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------- Pydantic Schemas ----------
class SupplierCreate(BaseModel):
    name: str
    contact_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class SupplierRead(SupplierCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    sku: str
    name: str
    description: Optional[str] = None
    supplier_id: Optional[int] = None
    unit_cost: float = 0
    unit: str = "unit"
    reorder_level: int = 0
    reorder_quantity: int = 0


class ProductRead(ProductCreate):
    id: int
    created_at: datetime
    supplier: Optional[SupplierRead] = None
    stock_on_hand: int = 0

    class Config:
        from_attributes = True


class PurchaseOrderItemCreate(BaseModel):
    product_id: int
    quantity: int
    unit_cost: float


class PurchaseOrderCreate(BaseModel):
    reference: str
    supplier_id: Optional[int] = None
    status: PurchaseStatus = PurchaseStatus.draft
    expected_date: Optional[date] = None
    notes: Optional[str] = None
    items: List[PurchaseOrderItemCreate] = Field(default_factory=list)


class PurchaseOrderItemRead(PurchaseOrderItemCreate):
    id: int
    product: Optional[ProductRead] = None

    class Config:
        from_attributes = True


class PurchaseOrderRead(BaseModel):
    id: int
    reference: str
    supplier: Optional[SupplierRead] = None
    status: PurchaseStatus
    expected_date: Optional[date]
    notes: Optional[str]
    total_amount: float
    created_at: datetime
    items: List[PurchaseOrderItemRead] = Field(default_factory=list)

    class Config:
        from_attributes = True


class ShipmentCreate(BaseModel):
    purchase_order_id: Optional[int] = None
    carrier: Optional[str] = None
    tracking_number: Optional[str] = None
    eta: Optional[date] = None
    status: ShipmentStatus = ShipmentStatus.pending
    notes: Optional[str] = None


class ShipmentRead(ShipmentCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class MovementCreate(BaseModel):
    product_id: int
    movement_type: MovementType
    quantity: int
    reason: Optional[str] = None
    reference: Optional[str] = None


class MovementRead(MovementCreate):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


app = FastAPI(title="Supply Chain Management API", version="1.0.0")

if ALLOWED_ORIGINS == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in ALLOWED_ORIGINS.split(",")]

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
    """Populate with minimal demo data so the UI isn't empty."""
    db = SessionLocal()
    try:
        def get_or_create_supplier(name, **kwargs):
            existing = db.scalar(select(Supplier).where(Supplier.name == name))
            if existing:
                return existing
            supplier = Supplier(name=name, **kwargs)
            db.add(supplier)
            db.flush()
            return supplier

        def get_or_create_product(sku, **kwargs):
            existing = db.scalar(select(Product).where(Product.sku == sku))
            if existing:
                return existing
            product = Product(sku=sku, **kwargs)
            db.add(product)
            db.flush()
            return product

        def ensure_po(reference, supplier, status, expected_date=None, notes=None, items=None):
            existing = db.scalar(select(PurchaseOrder).where(PurchaseOrder.reference == reference))
            if existing:
                return existing
            order = PurchaseOrder(reference=reference, supplier_id=supplier.id if supplier else None, status=status, expected_date=expected_date, notes=notes)
            db.add(order)
            db.flush()
            total = 0
            for it in items or []:
                db_item = PurchaseOrderItem(
                    purchase_order_id=order.id,
                    product_id=it["product"].id,
                    quantity=it["quantity"],
                    unit_cost=it["unit_cost"],
                )
                total += it["quantity"] * it["unit_cost"]
                db.add(db_item)
            order.total_amount = total
            return order

        def ensure_shipment(po, carrier, tracking_number, eta, status):
            existing = db.scalar(select(Shipment).where(Shipment.tracking_number == tracking_number))
            if existing:
                return existing
            shipment = Shipment(purchase_order_id=po.id if po else None, carrier=carrier, tracking_number=tracking_number, eta=eta, status=status)
            db.add(shipment)
            return shipment

        # Suppliers
        acme = get_or_create_supplier("Acme Components", contact_name="Riley Smith", phone="555-111-2222", email="parts@acme.com", address="101 Industry Rd, Toronto")
        north = get_or_create_supplier("Northern Freight", contact_name="Sam Patel", phone="555-333-4444", email="ops@northernfreight.com", address="12 Harbor St, Hamilton")
        global_parts = get_or_create_supplier("Global Parts Co.", contact_name="Jamie Lee", phone="555-222-9090", email="sales@globalparts.com", address="22 Supply Pkwy, Mississauga")
        blue_logistics = get_or_create_supplier("Blue River Logistics", contact_name="Jordan Wu", phone="555-777-4545", email="support@blueriverlogistics.com", address="9 Port Ln, Oshawa")

        # Products
        widget = get_or_create_product("WID-1000", name="Widget Core", description="Primary widget core", supplier=acme, unit_cost=12.5, unit="pcs", reorder_level=20, reorder_quantity=50)
        plate = get_or_create_product("PLT-240", name="Mounting Plate", description="Steel mounting plate", supplier=acme, unit_cost=4.2, unit="pcs", reorder_level=40, reorder_quantity=100)
        cable = get_or_create_product("CAB-900", name="Signal Cable", description="Shielded 3m signal cable", supplier=global_parts, unit_cost=7.9, unit="pcs", reorder_level=30, reorder_quantity=80)
        bolt = get_or_create_product("BLT-550", name="Grade-8 Bolt Pack", description="Industrial fasteners (pack of 50)", supplier=global_parts, unit_cost=18.0, unit="pack", reorder_level=10, reorder_quantity=25)

        # Initial stock movements (avoid duplicates)
        def ensure_movement(product, movement_type, quantity, reason, reference):
            exists = db.scalar(
                select(InventoryMovement).where(
                    InventoryMovement.product_id == product.id,
                    InventoryMovement.reference == reference,
                    InventoryMovement.movement_type == movement_type,
                )
            )
            if exists:
                return
            db.add(InventoryMovement(product_id=product.id, movement_type=movement_type, quantity=quantity, reason=reason, reference=reference))

        ensure_movement(widget, MovementType.inbound, 35, "Initial stock", "SEED-WID")
        ensure_movement(plate, MovementType.inbound, 60, "Initial stock", "SEED-PLT")
        ensure_movement(cable, MovementType.inbound, 50, "Initial stock", "SEED-CAB")
        ensure_movement(bolt, MovementType.inbound, 20, "Initial stock", "SEED-BLT")

        # Purchase orders
        po1 = ensure_po(
            "PO-2024-001",
            supplier=acme,
            status=PurchaseStatus.ordered,
            expected_date=date.today(),
            items=[
                {"product": widget, "quantity": 80, "unit_cost": 12.5},
                {"product": plate, "quantity": 150, "unit_cost": 4.1},
            ],
        )

        po2 = ensure_po(
            "PO-2024-002",
            supplier=global_parts,
            status=PurchaseStatus.received,
            expected_date=date.today(),
            notes="Bulk replenishment",
            items=[
                {"product": cable, "quantity": 120, "unit_cost": 7.8},
                {"product": bolt, "quantity": 40, "unit_cost": 18.0},
            ],
        )

        po3 = ensure_po(
            "PO-2024-003",
            supplier=acme,
            status=PurchaseStatus.draft,
            expected_date=date.today(),
            notes="Draft PO for next sprint",
            items=[
                {"product": widget, "quantity": 50, "unit_cost": 12.4},
            ],
        )

        # Shipments
        ensure_shipment(po1, carrier="Northern Freight", tracking_number="NF1234567", eta=date.today(), status=ShipmentStatus.in_transit)
        ensure_shipment(po2, carrier="Blue River Logistics", tracking_number="BRL-88844", eta=date.today(), status=ShipmentStatus.delivered)
        ensure_shipment(po3, carrier="Northern Freight", tracking_number="NF-PO3-DRAFT", eta=date.today(), status=ShipmentStatus.pending)

        db.commit()
    finally:
        db.close()


def product_stock_on_hand(db: Session, product_id: int) -> int:
    inbound = db.scalar(
        select(func.coalesce(func.sum(InventoryMovement.quantity), 0)).where(
            InventoryMovement.product_id == product_id,
            InventoryMovement.movement_type == MovementType.inbound,
        )
    )
    outbound = db.scalar(
        select(func.coalesce(func.sum(InventoryMovement.quantity), 0)).where(
            InventoryMovement.product_id == product_id,
            InventoryMovement.movement_type == MovementType.outbound,
        )
    )
    adjust = db.scalar(
        select(func.coalesce(func.sum(InventoryMovement.quantity), 0)).where(
            InventoryMovement.product_id == product_id,
            InventoryMovement.movement_type == MovementType.adjust,
        )
    )
    return (inbound or 0) - (outbound or 0) + (adjust or 0)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/suppliers", response_model=List[SupplierRead])
def list_suppliers(db: Session = Depends(get_db)):
    suppliers = db.scalars(select(Supplier).order_by(Supplier.created_at.desc())).all()
    return suppliers


@app.post("/api/suppliers", response_model=SupplierRead, status_code=201)
def create_supplier(payload: SupplierCreate, db: Session = Depends(get_db)):
    supplier = Supplier(**payload.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)
    return supplier


@app.get("/api/products", response_model=List[ProductRead])
def list_products(db: Session = Depends(get_db)):
    products = db.scalars(select(Product).order_by(Product.created_at.desc())).all()
    result = []
    for product in products:
        stock = product_stock_on_hand(db, product.id)
        data = ProductRead.from_orm(product)
        data.stock_on_hand = stock
        result.append(data)
    return result


@app.post("/api/products", response_model=ProductRead, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    if db.scalar(select(Product).where(Product.sku == payload.sku)):
        raise HTTPException(status_code=400, detail="SKU already exists")
    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    data = ProductRead.from_orm(product)
    data.stock_on_hand = 0
    return data


@app.get("/api/purchase-orders", response_model=List[PurchaseOrderRead])
def list_purchase_orders(db: Session = Depends(get_db)):
    orders = db.scalars(select(PurchaseOrder).order_by(PurchaseOrder.created_at.desc())).all()
    return orders


@app.post("/api/purchase-orders", response_model=PurchaseOrderRead, status_code=201)
def create_purchase_order(payload: PurchaseOrderCreate, db: Session = Depends(get_db)):
    if db.scalar(select(PurchaseOrder).where(PurchaseOrder.reference == payload.reference)):
        raise HTTPException(status_code=400, detail="Reference already exists")

    order = PurchaseOrder(
        reference=payload.reference,
        supplier_id=payload.supplier_id,
        status=payload.status,
        expected_date=payload.expected_date,
        notes=payload.notes,
    )
    db.add(order)
    db.flush()

    total = 0
    for item in payload.items:
        db_item = PurchaseOrderItem(
            purchase_order_id=order.id,
            product_id=item.product_id,
            quantity=item.quantity,
            unit_cost=item.unit_cost,
        )
        total += item.quantity * item.unit_cost
        db.add(db_item)

    order.total_amount = total
    db.commit()
    db.refresh(order)
    return order


@app.get("/api/shipments", response_model=List[ShipmentRead])
def list_shipments(db: Session = Depends(get_db)):
    shipments = db.scalars(select(Shipment).order_by(Shipment.created_at.desc())).all()
    return shipments


@app.post("/api/shipments", response_model=ShipmentRead, status_code=201)
def create_shipment(payload: ShipmentCreate, db: Session = Depends(get_db)):
    shipment = Shipment(**payload.model_dump())
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return shipment


@app.get("/api/inventory", response_model=List[MovementRead])
def list_inventory_movements(db: Session = Depends(get_db)):
    movements = db.scalars(select(InventoryMovement).order_by(InventoryMovement.created_at.desc())).all()
    return movements


@app.post("/api/inventory", response_model=MovementRead, status_code=201)
def record_movement(payload: MovementCreate, db: Session = Depends(get_db)):
    product = db.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    movement = InventoryMovement(**payload.model_dump())
    db.add(movement)
    db.commit()
    db.refresh(movement)
    return movement


@app.get("/api/dashboard")
def dashboard(db: Session = Depends(get_db)):
    supplier_count = db.scalar(select(func.count()).select_from(Supplier)) or 0
    product_count = db.scalar(select(func.count()).select_from(Product)) or 0
    open_pos = db.scalar(select(func.count()).select_from(PurchaseOrder).where(PurchaseOrder.status != PurchaseStatus.cancelled)) or 0
    in_transit = db.scalar(select(func.count()).select_from(Shipment).where(Shipment.status.in_([ShipmentStatus.in_transit, ShipmentStatus.pending]))) or 0
    low_stock = db.scalars(select(Product)).all()
    low_stock_items = []
    for product in low_stock:
        on_hand = product_stock_on_hand(db, product.id)
        if product.reorder_level and on_hand <= product.reorder_level:
            low_stock_items.append({"id": product.id, "name": product.name, "sku": product.sku, "stock_on_hand": on_hand, "reorder_level": product.reorder_level})
    return {
        "suppliers": supplier_count,
        "products": product_count,
        "open_purchase_orders": open_pos,
        "shipments_in_transit": in_transit,
        "low_stock": low_stock_items,
    }
