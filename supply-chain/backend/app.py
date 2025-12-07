"""
Supply Chain Management API Server - Port 5070
Supplier Management, Inventory, Logistics
Database: supply_chain_db
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)

# ==================== CONFIGURATION ====================

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://supply_user:supplypass123@postgres-supply:5432/supply_chain_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# CORS Configuration
cors_origin = os.getenv('CORS_ORIGIN', '*')
CORS(app, resources={r"/*": {"origins": cors_origin}})

# Database
db = SQLAlchemy(app)
_schema_ready = False

# ==================== MODELS ====================

class Supplier(db.Model):
    """Supplier model for supply chain management"""
    __tablename__ = 'suppliers'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    contact_person = db.Column(db.String(255))
    email = db.Column(db.String(255))
    phone = db.Column(db.String(50))
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    country = db.Column(db.String(100))
    status = db.Column(db.String(50), default='active')  # active, inactive
    rating = db.Column(db.Float, default=0.0)
    primary_contact = db.Column(db.String(255))
    contact_phone = db.Column(db.String(50))
    contact_email = db.Column(db.String(255))
    on_time_score = db.Column(db.Float, default=0.0)
    quality_score = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    products = db.relationship('Product', backref='supplier', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'contact_person': self.contact_person,
            'email': self.email,
            'phone': self.phone,
            'address': self.address,
            'city': self.city,
            'country': self.country,
            'status': self.status,
            'rating': self.rating,
            'primary_contact': self.primary_contact,
            'contact_phone': self.contact_phone,
            'contact_email': self.contact_email,
            'on_time_score': self.on_time_score,
            'quality_score': self.quality_score,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Product(db.Model):
    """Product model for inventory management"""
    __tablename__ = 'products'

    id = db.Column(db.Integer, primary_key=True)
    sku = db.Column(db.String(100), unique=True, nullable=False)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    unit_price = db.Column(db.Float, default=0.0)
    standard_cost = db.Column(db.Float, default=0.0)
    unit_of_measure = db.Column(db.String(50))
    quantity_in_stock = db.Column(db.Integer, default=0)
    reorder_level = db.Column(db.Integer, default=10)
    safety_stock = db.Column(db.Integer, default=0)
    lead_time_days = db.Column(db.Integer, default=0)
    status = db.Column(db.String(50), default='available')  # available, out_of_stock, discontinued
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'sku': self.sku,
            'name': self.name,
            'description': self.description,
            'category': self.category,
            'supplier_id': self.supplier_id,
            'unit_price': self.unit_price,
            'standard_cost': self.standard_cost,
            'unit_of_measure': self.unit_of_measure,
            'quantity_in_stock': self.quantity_in_stock,
            'reorder_level': self.reorder_level,
            'safety_stock': self.safety_stock,
            'lead_time_days': self.lead_time_days,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class PurchaseOrder(db.Model):
    """Purchase Order model"""
    __tablename__ = 'purchase_orders'

    id = db.Column(db.Integer, primary_key=True)
    order_number = db.Column(db.String(100), unique=True, nullable=False)
    supplier_id = db.Column(db.Integer, db.ForeignKey('suppliers.id'), nullable=False)
    order_date = db.Column(db.DateTime, default=datetime.utcnow)
    expected_delivery = db.Column(db.DateTime)
    received_at = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='pending')  # draft, sent, partial, received, canceled
    total_amount = db.Column(db.Float, default=0.0)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    supplier = db.relationship('Supplier', backref='purchase_orders')
    items = db.relationship('PurchaseOrderItem', backref='purchase_order', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'order_number': self.order_number,
            'supplier_id': self.supplier_id,
            'order_date': self.order_date.isoformat() if self.order_date else None,
            'expected_delivery': self.expected_delivery.isoformat() if self.expected_delivery else None,
            'status': self.status,
            'total_amount': self.total_amount,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class PurchaseOrderItem(db.Model):
    """Purchase Order Items"""
    __tablename__ = 'purchase_order_items'

    id = db.Column(db.Integer, primary_key=True)
    purchase_order_id = db.Column(db.Integer, db.ForeignKey('purchase_orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    unit_price = db.Column(db.Float, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)

    product = db.relationship('Product')

    def to_dict(self):
        return {
            'id': self.id,
            'purchase_order_id': self.purchase_order_id,
            'product_id': self.product_id,
            'quantity': self.quantity,
            'unit_price': self.unit_price,
            'subtotal': self.subtotal
        }


# ==================== ROUTES ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'supply-chain-api',
        'port': 5070,
        'timestamp': datetime.utcnow().isoformat()
    })


# ========== Supplier Endpoints ==========

@app.route('/suppliers', methods=['GET'])
def get_suppliers():
    """Get all suppliers"""
    try:
        suppliers = Supplier.query.all()
        return jsonify([s.to_dict() for s in suppliers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/suppliers/<int:supplier_id>', methods=['GET'])
def get_supplier(supplier_id):
    """Get a specific supplier"""
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404
    return jsonify(supplier.to_dict()), 200


@app.route('/suppliers', methods=['POST'])
def create_supplier():
    """Create a new supplier"""
    try:
        data = request.get_json()

        supplier = Supplier(
            name=data.get('name'),
            contact_person=data.get('contact_person') or data.get('primary_contact'),
            email=data.get('email') or data.get('contact_email'),
            phone=data.get('phone') or data.get('contact_phone'),
            address=data.get('address'),
            city=data.get('city'),
            country=data.get('country'),
            status=data.get('status', 'active'),
            rating=data.get('rating', 0.0),
            primary_contact=data.get('primary_contact'),
            contact_phone=data.get('contact_phone'),
            contact_email=data.get('contact_email'),
            on_time_score=data.get('on_time_score', 0.0),
            quality_score=data.get('quality_score', 0.0)
        )

        db.session.add(supplier)
        db.session.commit()

        return jsonify(supplier.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/suppliers/<int:supplier_id>', methods=['PUT'])
def update_supplier(supplier_id):
    """Update a supplier"""
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404

    try:
        data = request.get_json()

        supplier.name = data.get('name', supplier.name)
        supplier.contact_person = data.get('contact_person', supplier.contact_person)
        supplier.email = data.get('email', supplier.email)
        supplier.phone = data.get('phone', supplier.phone)
        supplier.address = data.get('address', supplier.address)
        supplier.city = data.get('city', supplier.city)
        supplier.country = data.get('country', supplier.country)
        supplier.status = data.get('status', supplier.status)
        supplier.rating = data.get('rating', supplier.rating)
        supplier.primary_contact = data.get('primary_contact', supplier.primary_contact)
        supplier.contact_phone = data.get('contact_phone', supplier.contact_phone)
        supplier.contact_email = data.get('contact_email', supplier.contact_email)
        supplier.on_time_score = data.get('on_time_score', supplier.on_time_score)
        supplier.quality_score = data.get('quality_score', supplier.quality_score)
        supplier.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify(supplier.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/suppliers/<int:supplier_id>', methods=['DELETE'])
def delete_supplier(supplier_id):
    """Delete a supplier"""
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404

    try:
        db.session.delete(supplier)
        db.session.commit()
        return jsonify({'message': 'Supplier deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========== Product Endpoints ==========

@app.route('/products', methods=['GET'])
def get_products():
    """Get all products"""
    try:
        products = Product.query.all()
        return jsonify([p.to_dict() for p in products]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product.to_dict()), 200


@app.route('/products', methods=['POST'])
def create_product():
    """Create a new product"""
    try:
        data = request.get_json()

        supplier_id = data.get('supplier_id')
        if not supplier_id:
            first_supplier = Supplier.query.first()
            if not first_supplier:
                return jsonify({'error': 'No supplier available. Please add a supplier first.'}), 400
            supplier_id = first_supplier.id

        product = Product(
            sku=data.get('sku'),
            name=data.get('name'),
            description=data.get('description'),
            category=data.get('category'),
            supplier_id=supplier_id,
            unit_price=data.get('unit_price', 0.0),
            standard_cost=data.get('standard_cost', 0.0),
            unit_of_measure=data.get('unit_of_measure'),
            quantity_in_stock=data.get('quantity_in_stock', 0),
            reorder_level=data.get('reorder_level', 10),
            safety_stock=data.get('safety_stock', 0),
            lead_time_days=data.get('lead_time_days', 0),
            status=data.get('status', 'available')
        )

        db.session.add(product)
        db.session.commit()

        return jsonify(product.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    """Update a product"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    try:
        data = request.get_json()

        product.name = data.get('name', product.name)
        product.description = data.get('description', product.description)
        product.category = data.get('category', product.category)
        product.unit_price = data.get('unit_price', product.unit_price)
        product.standard_cost = data.get('standard_cost', product.standard_cost)
        product.unit_of_measure = data.get('unit_of_measure', product.unit_of_measure)
        product.quantity_in_stock = data.get('quantity_in_stock', product.quantity_in_stock)
        product.reorder_level = data.get('reorder_level', product.reorder_level)
        product.safety_stock = data.get('safety_stock', product.safety_stock)
        product.lead_time_days = data.get('lead_time_days', product.lead_time_days)
        product.status = data.get('status', product.status)
        product.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify(product.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product"""
    product = Product.query.get(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404

    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({'message': 'Product deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========== Purchase Order Endpoints ==========

@app.route('/purchase-orders', methods=['GET'])
def get_purchase_orders():
    """Get all purchase orders"""
    try:
        orders = PurchaseOrder.query.all()
        return jsonify([o.to_dict() for o in orders]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/purchase-orders/<int:order_id>', methods=['GET'])
def get_purchase_order(order_id):
    """Get a specific purchase order"""
    order = PurchaseOrder.query.get(order_id)
    if not order:
        return jsonify({'error': 'Purchase order not found'}), 404

    order_dict = order.to_dict()
    order_dict['items'] = [item.to_dict() for item in order.items]
    return jsonify(order_dict), 200


@app.route('/purchase-orders', methods=['POST'])
def create_purchase_order():
    """Create a new purchase order"""
    try:
        data = request.get_json()

        order = PurchaseOrder(
            order_number=data.get('order_number'),
            supplier_id=data.get('supplier_id'),
            expected_delivery=datetime.fromisoformat(data.get('expected_delivery')) if data.get('expected_delivery') else None,
            status=data.get('status', 'draft'),
            total_amount=data.get('total_amount', 0.0),
            notes=data.get('notes'),
            received_at=datetime.fromisoformat(data.get('received_at')) if data.get('received_at') else None
        )

        db.session.add(order)
        db.session.flush()

        # Add order items if provided
        items = data.get('items', [])
        for item_data in items:
            item = PurchaseOrderItem(
                purchase_order_id=order.id,
                product_id=item_data.get('product_id'),
                quantity=item_data.get('quantity'),
                unit_price=item_data.get('unit_price'),
                subtotal=item_data.get('quantity') * item_data.get('unit_price')
            )
            db.session.add(item)

        db.session.commit()

        return jsonify(order.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/purchase-orders/<int:order_id>', methods=['PUT'])
def update_purchase_order(order_id):
    """Update a purchase order"""
    order = PurchaseOrder.query.get(order_id)
    if not order:
        return jsonify({'error': 'Purchase order not found'}), 404

    try:
        data = request.get_json()

        order.status = data.get('status', order.status)
        order.expected_delivery = datetime.fromisoformat(data.get('expected_delivery')) if data.get('expected_delivery') else order.expected_delivery
        order.received_at = datetime.fromisoformat(data.get('received_at')) if data.get('received_at') else order.received_at
        order.total_amount = data.get('total_amount', order.total_amount)
        order.notes = data.get('notes', order.notes)
        order.updated_at = datetime.utcnow()

        db.session.commit()

        return jsonify(order.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/purchase-orders/<int:order_id>', methods=['DELETE'])
def delete_purchase_order(order_id):
    """Delete a purchase order"""
    order = PurchaseOrder.query.get(order_id)
    if not order:
        return jsonify({'error': 'Purchase order not found'}), 404

    try:
        db.session.delete(order)
        db.session.commit()
        return jsonify({'message': 'Purchase order deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========== Dashboard & Statistics Endpoints ==========

@app.route('/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard statistics"""
    try:
        total_suppliers = Supplier.query.count()
        active_suppliers = Supplier.query.filter_by(status='active').count()
        total_products = Product.query.count()
        low_stock_products = Product.query.filter(Product.quantity_in_stock <= Product.reorder_level).count()
        total_orders = PurchaseOrder.query.count()
        pending_orders = PurchaseOrder.query.filter_by(status='pending').count()

        return jsonify({
            'totalSuppliers': total_suppliers,
            'totalProducts': total_products,
            'totalPurchaseOrders': total_orders,
            'totalShipments': 0  # Placeholder
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/shipments', methods=['GET'])
def get_shipments():
    """Get all shipments (placeholder)"""
    try:
        # Return empty array for now
        return jsonify([]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ==================== DATABASE INITIALIZATION ====================

def ensure_schema():
    """Run lightweight schema migrations once per process."""
    global _schema_ready
    if _schema_ready:
        return
    with db.engine.begin() as conn:
        # Ensure base tables exist before applying incremental column adds.
        db.create_all()

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


@app.before_request
def _run_schema_if_needed():
    ensure_schema()


def init_db():
    """Initialize the database"""
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")
        ensure_schema()

        # Add sample data if no suppliers exist
        if Supplier.query.count() == 0:
            print("Adding sample data...")

            suppliers = [
                Supplier(
                    name='Acme Components',
                    contact_person='John Smith',
                    email='john@acme.com',
                    phone='+1-555-0101',
                    address='123 Industrial Blvd',
                    city='New York',
                    country='USA',
                    status='active',
                    rating=4.5,
                    primary_contact='John Smith',
                    contact_phone='+1-555-0101',
                    contact_email='john@acme.com',
                    on_time_score=92,
                    quality_score=90
                ),
                Supplier(
                    name='Northern Freight',
                    contact_person='Sarah Johnson',
                    email='sarah@northern.com',
                    phone='+1-555-0202',
                    address='456 Logistics Ave',
                    city='Chicago',
                    country='USA',
                    status='active',
                    rating=4.0,
                    primary_contact='Sarah Johnson',
                    contact_phone='+1-555-0202',
                    contact_email='sarah@northern.com',
                    on_time_score=89,
                    quality_score=88
                ),
                Supplier(
                    name='Global Parts Co.',
                    contact_person='Mike Chen',
                    email='mike@globalparts.com',
                    phone='+1-555-0303',
                    address='789 Supply Lane',
                    city='Los Angeles',
                    country='USA',
                    status='active',
                    rating=4.8
                ),
                Supplier(
                    name='Blue River Logistics',
                    contact_person='Emma Davis',
                    email='emma@blueriver.com',
                    phone='+1-555-0404',
                    address='321 Warehouse Dr',
                    city='Seattle',
                    country='USA',
                    status='active',
                    rating=4.3
                )
            ]

            for supplier in suppliers:
                db.session.add(supplier)

            db.session.commit()
            print("Sample suppliers added successfully")

        if Product.query.count() == 0 and Supplier.query.first():
            default_supplier = Supplier.query.first()
            products = [
                Product(
                    sku='SKU-1001',
                    name='Industrial Fastener',
                    category='Hardware',
                    supplier_id=default_supplier.id,
                    unit_price=5.5,
                    standard_cost=3.2,
                    unit_of_measure='each',
                    quantity_in_stock=120,
                    reorder_level=40,
                    safety_stock=25,
                    lead_time_days=7
                ),
                Product(
                    sku='SKU-2002',
                    name='Composite Panel',
                    category='Materials',
                    supplier_id=default_supplier.id,
                    unit_price=32.0,
                    standard_cost=24.0,
                    unit_of_measure='sheet',
                    quantity_in_stock=60,
                    reorder_level=20,
                    safety_stock=10,
                    lead_time_days=14
                ),
                Product(
                    sku='SKU-3003',
                    name='Logistics Crate',
                    category='Packaging',
                    supplier_id=default_supplier.id,
                    unit_price=12.5,
                    standard_cost=8.5,
                    unit_of_measure='each',
                    quantity_in_stock=200,
                    reorder_level=50,
                    safety_stock=30,
                    lead_time_days=5
                ),
            ]
            for prod in products:
                db.session.add(prod)
            db.session.commit()
            print("Sample products added successfully")

        if PurchaseOrder.query.count() == 0 and Supplier.query.first() and Product.query.first():
            default_supplier = Supplier.query.first()
            po = PurchaseOrder(
                order_number='PO-10001',
                supplier_id=default_supplier.id,
                expected_delivery=datetime.utcnow(),
                status='draft',
                total_amount=0,
                notes='Initial sample PO'
            )
            db.session.add(po)
            db.session.flush()

            first_product = Product.query.first()
            item = PurchaseOrderItem(
                purchase_order_id=po.id,
                product_id=first_product.id,
                quantity=10,
                unit_price=first_product.unit_price,
                subtotal=10 * first_product.unit_price
            )
            po.total_amount = item.subtotal
            db.session.add(item)
            db.session.commit()
            print("Sample purchase order added successfully")


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5070, debug=True)
