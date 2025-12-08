"""
Property Management API Server - Port 5050
Property, Tenant, Lease, and Maintenance Management
Database: property_db
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, date, timedelta
import os

app = Flask(__name__)

# ==================== CONFIGURATION ====================

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///property.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# CORS Configuration
cors_origin = os.getenv('CORS_ORIGIN', '*')
CORS(app, resources={r"/api/*": {"origins": cors_origin}})

# Database
db = SQLAlchemy(app)
_schema_ready = False


# ==================== HELPERS ====================

def error_response(message, status_code=400):
    """Consistent error responses"""
    return jsonify({'error': message}), status_code


def parse_iso_date(value, field_name):
    """Parse an ISO date string or return None"""
    if value is None or value == '':
        return None
    try:
        return date.fromisoformat(value)
    except Exception:
        raise ValueError(f"Invalid date for {field_name}; expected ISO date string")


def parse_iso_datetime(value, field_name):
    """Parse an ISO datetime string or return None"""
    if value is None or value == '':
        return None
    try:
        return datetime.fromisoformat(value).replace(tzinfo=None)
    except Exception:
        raise ValueError(f"Invalid datetime for {field_name}; expected ISO datetime string")


def month_start_for(dt: date, months_back: int = 0) -> date:
    """Return the first day of the month shifted back by months_back."""
    year = dt.year + (dt.month - 1 - months_back) // 12
    month = (dt.month - 1 - months_back) % 12 + 1
    return date(year, month, 1)

# ==================== MODELS ====================

class Property(db.Model):
    """Property model for property management"""
    __tablename__ = 'properties'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.Text)
    city = db.Column(db.String(100))
    province = db.Column(db.String(100))
    country = db.Column(db.String(100))
    units_total = db.Column(db.Integer, default=0)
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    manager_name = db.Column(db.String(255))
    manager_phone = db.Column(db.String(100))
    manager_email = db.Column(db.String(255))
    postal_code = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    leases = db.relationship('Lease', backref='property', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'address': self.address,
            'city': self.city,
            'province': self.province,
            'country': self.country,
            'units_total': self.units_total,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'manager_name': self.manager_name,
            'manager_phone': self.manager_phone,
            'manager_email': self.manager_email,
            'postal_code': self.postal_code,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Tenant(db.Model):
    """Tenant model"""
    __tablename__ = 'tenants'

    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255))
    phone = db.Column(db.String(100))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    leases = db.relationship('Lease', backref='tenant', lazy=True)
    maintenance_requests = db.relationship('Maintenance', backref='tenant', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'full_name': self.full_name,
            'email': self.email,
            'phone': self.phone,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Lease(db.Model):
    """Lease model"""
    __tablename__ = 'leases'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'), nullable=False)
    unit = db.Column(db.String(50))
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    rent = db.Column(db.Float, default=0)
    rent_due_day = db.Column(db.Integer, default=1)
    deposit_amount = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(50), default='draft')  # draft, active, ended, late
    notice_given_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'tenant_id': self.tenant_id,
            'unit': self.unit,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'rent': self.rent,
            'rent_due_day': self.rent_due_day,
            'deposit_amount': self.deposit_amount,
            'status': self.status,
            'notice_given_at': self.notice_given_at.isoformat() if self.notice_given_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'property': self.property.to_dict() if self.property else None,
            'tenant': self.tenant.to_dict() if self.tenant else None
        }


class Maintenance(db.Model):
    """Maintenance request model"""
    __tablename__ = 'maintenance'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'), nullable=False)
    tenant_id = db.Column(db.Integer, db.ForeignKey('tenants.id'))
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    priority = db.Column(db.String(50), default='medium')  # low, medium, high
    due_date = db.Column(db.Date)
    completed_at = db.Column(db.DateTime)
    status = db.Column(db.String(50), default='pending')  # pending, in_progress, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'tenant_id': self.tenant_id,
            'title': self.title,
            'description': self.description,
            'priority': self.priority,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Staff(db.Model):
    """Staff members assigned to properties"""
    __tablename__ = 'staff'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'))
    full_name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(100))
    email = db.Column(db.String(255))
    phone = db.Column(db.String(100))
    department = db.Column(db.String(100))
    address = db.Column(db.Text)
    date_of_birth = db.Column(db.Date)
    start_date = db.Column(db.Date)
    notes = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    property = db.relationship('Property', backref=db.backref('staff', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'full_name': self.full_name,
            'role': self.role,
            'email': self.email,
            'phone': self.phone,
            'department': self.department,
            'address': self.address,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'notes': self.notes,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Transaction(db.Model):
    """Accounting transaction for income/expense and cash flow"""
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'))
    lease_id = db.Column(db.Integer, db.ForeignKey('leases.id'))
    txn_type = db.Column(db.String(20), nullable=False)  # income, expense
    category = db.Column(db.String(100))
    amount = db.Column(db.Float, nullable=False)
    txn_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='cleared')  # cleared, pending
    memo = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    property = db.relationship('Property', backref=db.backref('transactions', lazy=True))
    lease = db.relationship('Lease', backref=db.backref('transactions', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'lease_id': self.lease_id,
            'txn_type': self.txn_type,
            'category': self.category,
            'amount': self.amount,
            'txn_date': self.txn_date.isoformat() if self.txn_date else None,
            'status': self.status,
            'memo': self.memo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'property': self.property.to_dict() if self.property else None,
            'lease': self.lease.to_dict() if self.lease else None
        }


class Invoice(db.Model):
    """Invoice model for billing income/expenses"""
    __tablename__ = 'invoices'

    id = db.Column(db.Integer, primary_key=True)
    number = db.Column(db.String(50), unique=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'))
    lease_id = db.Column(db.Integer, db.ForeignKey('leases.id'))
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default='pending')  # pending, sent, paid, overdue, void
    due_date = db.Column(db.Date)
    issue_date = db.Column(db.Date, default=date.today)
    paid_at = db.Column(db.DateTime)
    memo = db.Column(db.Text)
    maintenance_id = db.Column(db.Integer, db.ForeignKey('maintenance.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    property = db.relationship('Property', backref=db.backref('invoices', lazy=True))
    lease = db.relationship('Lease', backref=db.backref('invoices', lazy=True))
    maintenance = db.relationship('Maintenance', backref=db.backref('invoices', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'number': self.number,
            'property_id': self.property_id,
            'lease_id': self.lease_id,
            'amount': self.amount,
            'status': self.status,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'issue_date': self.issue_date.isoformat() if self.issue_date else None,
            'paid_at': self.paid_at.isoformat() if self.paid_at else None,
            'memo': self.memo,
            'maintenance_id': self.maintenance_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'property': self.property.to_dict() if self.property else None,
            'lease': self.lease.to_dict() if self.lease else None
        }


class Expense(db.Model):
    """Expense model for non-rent costs"""
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    property_id = db.Column(db.Integer, db.ForeignKey('properties.id'))
    lease_id = db.Column(db.Integer, db.ForeignKey('leases.id'))
    maintenance_id = db.Column(db.Integer, db.ForeignKey('maintenance.id'))
    category = db.Column(db.String(100))
    amount = db.Column(db.Float, nullable=False)
    expense_date = db.Column(db.Date, nullable=False)
    status = db.Column(db.String(50), default='recorded')  # recorded, pending, reimbursed
    memo = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    property = db.relationship('Property', backref=db.backref('expenses', lazy=True))
    lease = db.relationship('Lease', backref=db.backref('expenses', lazy=True))
    maintenance = db.relationship('Maintenance', backref=db.backref('expenses', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'property_id': self.property_id,
            'lease_id': self.lease_id,
            'maintenance_id': self.maintenance_id,
            'category': self.category,
            'amount': self.amount,
            'expense_date': self.expense_date.isoformat() if self.expense_date else None,
            'status': self.status,
            'memo': self.memo,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'property': self.property.to_dict() if self.property else None,
            'lease': self.lease.to_dict() if self.lease else None,
        }


class Contract(db.Model):
    """Contract model for service contracts, vendor agreements, and leases"""
    __tablename__ = 'contracts'

    id = db.Column(db.Integer, primary_key=True)
    contract_type = db.Column(db.String(100))  # service, vendor, lease, etc.
    party_name = db.Column(db.String(255))  # contractor/vendor name
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    value = db.Column(db.Float, default=0.0)
    status = db.Column(db.String(50), default='active')  # active, pending, expired, terminated
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'contract_type': self.contract_type,
            'party_name': self.party_name,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'value': self.value,
            'status': self.status,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


# ==================== ROUTES ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'service': 'property-management-api',
        'port': 5050
    })


def ensure_schema():
    """Run lightweight schema migrations once per process."""
    global _schema_ready
    if _schema_ready:
        return
    with db.engine.begin() as conn:
        advisory_locked = False
        try:
            if db.engine.url.get_backend_name() not in ['sqlite']:
                # Prevent concurrent ALTER/CREATE across gunicorn workers
                conn.exec_driver_sql("SELECT pg_advisory_lock(4815162342)")
                advisory_locked = True

            # Ensure base tables exist before applying incremental column adds.
            db.create_all()

            # SQLite has limited ALTER support; skip migration-style ALTERs there.
            if db.engine.url.get_backend_name() == 'sqlite':
                _schema_ready = True
                return

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
            conn.exec_driver_sql("CREATE TABLE IF NOT EXISTS staff (id SERIAL PRIMARY KEY, property_id INTEGER REFERENCES properties(id), full_name VARCHAR(255) NOT NULL, role VARCHAR(100), email VARCHAR(255), phone VARCHAR(100), department VARCHAR(100), address TEXT, date_of_birth DATE, start_date DATE, notes TEXT, is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
            conn.exec_driver_sql("CREATE TABLE IF NOT EXISTS transactions (id SERIAL PRIMARY KEY, property_id INTEGER REFERENCES properties(id), lease_id INTEGER REFERENCES leases(id), txn_type VARCHAR(20) NOT NULL, category VARCHAR(100), amount FLOAT NOT NULL, txn_date DATE NOT NULL, status VARCHAR(50) DEFAULT 'cleared', memo TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
            conn.exec_driver_sql("CREATE TABLE IF NOT EXISTS invoices (id SERIAL PRIMARY KEY, number VARCHAR(50) UNIQUE, property_id INTEGER REFERENCES properties(id), lease_id INTEGER REFERENCES leases(id), maintenance_id INTEGER REFERENCES maintenance(id), amount FLOAT NOT NULL, status VARCHAR(50) DEFAULT 'pending', due_date DATE, issue_date DATE, paid_at TIMESTAMP, memo TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
            conn.exec_driver_sql("ALTER TABLE invoices ADD COLUMN IF NOT EXISTS maintenance_id INTEGER REFERENCES maintenance(id)")
            conn.exec_driver_sql("CREATE TABLE IF NOT EXISTS expenses (id SERIAL PRIMARY KEY, property_id INTEGER REFERENCES properties(id), lease_id INTEGER REFERENCES leases(id), maintenance_id INTEGER REFERENCES maintenance(id), category VARCHAR(100), amount FLOAT NOT NULL, expense_date DATE NOT NULL, status VARCHAR(50) DEFAULT 'recorded', memo TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)")
            conn.exec_driver_sql("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS maintenance_id INTEGER REFERENCES maintenance(id)")
        finally:
            if advisory_locked:
                conn.exec_driver_sql("SELECT pg_advisory_unlock(4815162342)")
    _schema_ready = True


@app.before_request
def _run_schema_if_needed():
    ensure_schema()


# ========== Property Endpoints ==========

@app.route('/api/properties', methods=['GET'])
def get_properties():
    """Get all properties"""
    try:
        properties = Property.query.order_by(Property.created_at.desc()).all()
        return jsonify([p.to_dict() for p in properties]), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/properties/<int:property_id>', methods=['GET'])
def get_property(property_id):
    """Get a single property by id"""
    try:
        prop = Property.query.get(property_id)
        if not prop:
            return error_response('Property not found', 404)
        return jsonify(prop.to_dict()), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/properties', methods=['POST'])
def create_property():
    """Create a new property"""
    try:
        data = request.get_json()

        if not data or not data.get('name'):
            return error_response('name is required', 400)

        property_obj = Property(
            name=data.get('name'),
            address=data.get('address'),
            city=data.get('city'),
            province=data.get('province'),
            country=data.get('country'),
            units_total=data.get('units_total', 0),
            latitude=data.get('latitude'),
            longitude=data.get('longitude'),
            manager_name=data.get('manager_name'),
            manager_phone=data.get('manager_phone'),
            manager_email=data.get('manager_email'),
            postal_code=data.get('postal_code')
        )

        db.session.add(property_obj)
        db.session.commit()

        return jsonify(property_obj.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/properties/<int:property_id>', methods=['PUT'])
def update_property(property_id):
    """Update an existing property"""
    prop = Property.query.get(property_id)
    if not prop:
        return error_response('Property not found', 404)

    try:
        data = request.get_json() or {}

        fields = [
            'name',
            'address',
            'city',
            'province',
            'country',
            'units_total',
            'latitude',
            'longitude',
            'manager_name',
            'manager_phone',
            'manager_email',
            'postal_code'
        ]

        for field in fields:
            if field in data:
                if field == 'name' and not data.get(field):
                    return error_response('name cannot be empty', 400)
                setattr(prop, field, data.get(field))

        db.session.commit()
        return jsonify(prop.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/properties/<int:property_id>', methods=['DELETE'])
def delete_property(property_id):
    """Delete a property and its related leases"""
    prop = Property.query.get(property_id)
    if not prop:
        return error_response('Property not found', 404)

    try:
        db.session.delete(prop)
        db.session.commit()
        return jsonify({'message': 'Property deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)


# ========== Tenant Endpoints ==========

@app.route('/api/tenants', methods=['GET'])
def get_tenants():
    """Get all tenants"""
    try:
        tenants = Tenant.query.order_by(Tenant.created_at.desc()).all()
        return jsonify([t.to_dict() for t in tenants]), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/tenants/<int:tenant_id>', methods=['GET'])
def get_tenant(tenant_id):
    """Get a specific tenant"""
    try:
        tenant = Tenant.query.get(tenant_id)
        if not tenant:
            return error_response('Tenant not found', 404)
        return jsonify(tenant.to_dict()), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/tenants', methods=['POST'])
def create_tenant():
    """Create a new tenant"""
    try:
        data = request.get_json()

        if not data or not data.get('full_name'):
            return error_response('full_name is required', 400)

        tenant = Tenant(
            full_name=data.get('full_name'),
            email=data.get('email'),
            phone=data.get('phone'),
            notes=data.get('notes')
        )

        db.session.add(tenant)
        db.session.commit()

        return jsonify(tenant.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/tenants/<int:tenant_id>', methods=['PUT'])
def update_tenant(tenant_id):
    """Update tenant details"""
    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return error_response('Tenant not found', 404)

    try:
        data = request.get_json() or {}

        tenant.full_name = data.get('full_name', tenant.full_name)
        tenant.email = data.get('email', tenant.email)
        tenant.phone = data.get('phone', tenant.phone)
        tenant.notes = data.get('notes', tenant.notes)

        db.session.commit()
        return jsonify(tenant.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/tenants/<int:tenant_id>', methods=['DELETE'])
def delete_tenant(tenant_id):
    """Delete a tenant"""
    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return error_response('Tenant not found', 404)

    try:
        db.session.delete(tenant)
        db.session.commit()
        return jsonify({'message': 'Tenant deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)


# ========== Lease Endpoints ==========

@app.route('/api/leases', methods=['GET'])
def get_leases():
    """Get all leases"""
    try:
        leases = Lease.query.order_by(Lease.created_at.desc()).all()
        return jsonify([l.to_dict() for l in leases]), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/leases', methods=['POST'])
def create_lease():
    """Create a new lease"""
    try:
        data = request.get_json()

        if not data:
            return error_response('payload is required', 400)
        if not data.get('property_id') or not data.get('tenant_id'):
            return error_response('property_id and tenant_id are required', 400)

        # Validate property and tenant exist
        property_obj = Property.query.get(data.get('property_id'))
        tenant = Tenant.query.get(data.get('tenant_id'))

        if not property_obj or not tenant:
            return error_response('Invalid property or tenant', 400)

        # Parse dates
        start_date = parse_iso_date(data.get('start_date'), 'start_date')
        end_date = parse_iso_date(data.get('end_date'), 'end_date')

        lease = Lease(
            property_id=data.get('property_id'),
            tenant_id=data.get('tenant_id'),
            unit=data.get('unit'),
            start_date=start_date,
            end_date=end_date,
            rent=data.get('rent', 0),
            rent_due_day=data.get('rent_due_day', 1),
            deposit_amount=data.get('deposit_amount', 0.0),
            status=data.get('status', 'draft'),
            notice_given_at=parse_iso_datetime(data.get('notice_given_at'), 'notice_given_at')
        )

        db.session.add(lease)
        db.session.commit()

        return jsonify(lease.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/leases/<int:lease_id>', methods=['GET'])
def get_lease(lease_id):
    """Get a specific lease"""
    lease = Lease.query.get(lease_id)
    if not lease:
        return error_response('Lease not found', 404)
    return jsonify(lease.to_dict()), 200


@app.route('/api/leases/<int:lease_id>', methods=['PUT'])
def update_lease(lease_id):
    """Update an existing lease"""
    lease = Lease.query.get(lease_id)
    if not lease:
        return error_response('Lease not found', 404)

    try:
        data = request.get_json() or {}

        if 'property_id' in data:
            property_obj = Property.query.get(data.get('property_id'))
            if not property_obj:
                return error_response('Invalid property', 400)
            lease.property_id = data.get('property_id')
        if 'tenant_id' in data:
            tenant = Tenant.query.get(data.get('tenant_id'))
            if not tenant:
                return error_response('Invalid tenant', 400)
            lease.tenant_id = data.get('tenant_id')
        if 'unit' in data:
            lease.unit = data.get('unit')
        if 'start_date' in data:
            lease.start_date = parse_iso_date(data.get('start_date'), 'start_date')
        if 'end_date' in data:
            lease.end_date = parse_iso_date(data.get('end_date'), 'end_date')
        if 'rent' in data:
            lease.rent = data.get('rent')
        if 'rent_due_day' in data:
            lease.rent_due_day = data.get('rent_due_day')
        if 'deposit_amount' in data:
            lease.deposit_amount = data.get('deposit_amount')
        if 'status' in data:
            lease.status = data.get('status')
        if 'notice_given_at' in data:
            lease.notice_given_at = parse_iso_datetime(data.get('notice_given_at'), 'notice_given_at')

        db.session.commit()
        return jsonify(lease.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/leases/<int:lease_id>', methods=['DELETE'])
def delete_lease(lease_id):
    """Delete a lease"""
    lease = Lease.query.get(lease_id)
    if not lease:
        return error_response('Lease not found', 404)

    try:
        db.session.delete(lease)
        db.session.commit()
        return jsonify({'message': 'Lease deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)


# ========== Maintenance Endpoints ==========

@app.route('/api/maintenance', methods=['GET'])
def get_maintenance():
    """Get all maintenance requests"""
    try:
        maintenance = Maintenance.query.order_by(Maintenance.created_at.desc()).all()
        return jsonify([m.to_dict() for m in maintenance]), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/maintenance/<int:maintenance_id>', methods=['GET'])
def get_maintenance_item(maintenance_id):
    """Get a maintenance ticket"""
    try:
        ticket = Maintenance.query.get(maintenance_id)
        if not ticket:
            return error_response('Maintenance not found', 404)
        return jsonify(ticket.to_dict()), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/maintenance', methods=['POST'])
def create_maintenance():
    """Create a new maintenance request"""
    try:
        data = request.get_json()

        if not data or not data.get('property_id'):
            return error_response('property_id is required', 400)
        if not data.get('title'):
            return error_response('title is required', 400)

        # Validate property exists
        property_obj = Property.query.get(data.get('property_id'))
        if not property_obj:
            return error_response('Invalid property', 400)

        # Tenant optional; validate if provided
        if data.get('tenant_id'):
            tenant = Tenant.query.get(data.get('tenant_id'))
            if not tenant:
                return error_response('Invalid tenant', 400)

        maintenance = Maintenance(
            property_id=data.get('property_id'),
            tenant_id=data.get('tenant_id'),
            title=data.get('title'),
            description=data.get('description'),
            priority=data.get('priority', 'medium'),
            due_date=parse_iso_date(data.get('due_date'), 'due_date'),
            completed_at=parse_iso_datetime(data.get('completed_at'), 'completed_at'),
            status=data.get('status', 'pending')
        )

        db.session.add(maintenance)
        db.session.commit()

        return jsonify(maintenance.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/maintenance/<int:maintenance_id>', methods=['PUT'])
def update_maintenance(maintenance_id):
    """Update a maintenance request"""
    ticket = Maintenance.query.get(maintenance_id)
    if not ticket:
        return error_response('Maintenance not found', 404)

    try:
        data = request.get_json() or {}

        if 'property_id' in data:
            property_obj = Property.query.get(data.get('property_id'))
            if not property_obj:
                return error_response('Invalid property', 400)
            ticket.property_id = data.get('property_id')
        if 'tenant_id' in data:
            if data.get('tenant_id'):
                tenant = Tenant.query.get(data.get('tenant_id'))
                if not tenant:
                    return error_response('Invalid tenant', 400)
                ticket.tenant_id = data.get('tenant_id')
            else:
                ticket.tenant_id = None
        if 'title' in data:
            ticket.title = data.get('title')
        if 'description' in data:
            ticket.description = data.get('description')
        if 'priority' in data:
            ticket.priority = data.get('priority')
        if 'status' in data:
            ticket.status = data.get('status')
        if 'due_date' in data:
            ticket.due_date = parse_iso_date(data.get('due_date'), 'due_date')
        if 'completed_at' in data:
            ticket.completed_at = parse_iso_datetime(data.get('completed_at'), 'completed_at')

        db.session.commit()
        return jsonify(ticket.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/maintenance/<int:maintenance_id>', methods=['DELETE'])
def delete_maintenance(maintenance_id):
    """Delete a maintenance request"""
    ticket = Maintenance.query.get(maintenance_id)
    if not ticket:
        return error_response('Maintenance not found', 404)

    try:
        db.session.delete(ticket)
        db.session.commit()
        return jsonify({'message': 'Maintenance deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)


# ========== Dashboard Endpoint ==========

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard statistics"""
    try:
        today = date.today()
        in_30 = today + timedelta(days=30)
        in_60 = today + timedelta(days=60)
        in_90 = today + timedelta(days=90)

        # Summary counts
        prop_count = Property.query.count()
        tenant_count = Tenant.query.count()
        lease_count = Lease.query.count()
        staff_count = Staff.query.filter_by(is_active=True).count()

        # Lease health
        lease_status_counts = dict(
            db.session.query(Lease.status, db.func.count(Lease.id)).group_by(Lease.status).all()
        )
        overdue_rent = lease_status_counts.get('late', 0)
        active_leases = lease_status_counts.get('active', 0)
        total_units = db.session.query(db.func.coalesce(db.func.sum(Property.units_total), 0)).scalar()
        occupancy_rate = round((active_leases / total_units) * 100, 1) if total_units else None

        expiring_30 = Lease.query.filter(
            Lease.end_date.isnot(None),
            Lease.end_date >= today,
            Lease.end_date <= in_30,
            Lease.status.in_(['active', 'draft'])
        ).count()
        expiring_60 = Lease.query.filter(
            Lease.end_date.isnot(None),
            Lease.end_date > in_30,
            Lease.end_date <= in_60,
            Lease.status.in_(['active', 'draft'])
        ).count()
        expiring_90 = Lease.query.filter(
            Lease.end_date.isnot(None),
            Lease.end_date > in_60,
            Lease.end_date <= in_90,
            Lease.status.in_(['active', 'draft'])
        ).count()

        # Maintenance health
        maintenance_by_status = dict(
            db.session.query(Maintenance.status, db.func.count(Maintenance.id)).group_by(Maintenance.status).all()
        )
        maintenance_by_priority = dict(
            db.session.query(Maintenance.priority, db.func.count(Maintenance.id)).group_by(Maintenance.priority).all()
        )
        open_tickets = Maintenance.query.filter(~Maintenance.status.in_(['completed', 'cancelled'])).count()
        due_this_week = Maintenance.query.filter(
            Maintenance.due_date.isnot(None),
            Maintenance.due_date >= today,
            Maintenance.due_date <= today + timedelta(days=7),
            ~Maintenance.status.in_(['completed', 'cancelled'])
        ).order_by(Maintenance.due_date.asc()).limit(5).all()

        # Accounting / admin
        income_total = db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0.0)).filter(Transaction.txn_type == 'income').scalar()
        expense_total = db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0.0)).filter(Transaction.txn_type == 'expense').scalar()
        net_cash = round(income_total - expense_total, 2)

        monthly_cash = []
        for i in range(0, 6):
            month_start = month_start_for(today, i)
            next_month = month_start_for(today, i - 1)

            income = db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0.0)).filter(
                Transaction.txn_type == 'income',
                Transaction.txn_date >= month_start,
                Transaction.txn_date < next_month
            ).scalar()
            expense = db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0.0)).filter(
                Transaction.txn_type == 'expense',
                Transaction.txn_date >= month_start,
                Transaction.txn_date < next_month
            ).scalar()
            monthly_cash.append({
                'month': month_start.strftime('%Y-%m'),
                'income': float(income or 0),
                'expense': float(expense or 0),
                'net': float((income or 0) - (expense or 0))
            })

        # Data quality / alerts
        properties_missing_manager = Property.query.filter(
            db.or_(Property.manager_name.is_(None), Property.manager_name == '')
        ).count()

        leases_expiring_soon = Lease.query.filter(
            Lease.end_date.isnot(None),
            Lease.end_date >= today,
            Lease.end_date <= in_60,
            Lease.status.in_(['active', 'draft'])
        ).order_by(Lease.end_date.asc()).limit(5).all()

        def serialize_lease(lease: Lease):
            return {
                'id': lease.id,
                'unit': lease.unit,
                'status': lease.status,
                'rent': lease.rent,
                'end_date': lease.end_date.isoformat() if lease.end_date else None,
                'property': lease.property.to_dict() if lease.property else None,
                'tenant': lease.tenant.to_dict() if lease.tenant else None
            }

        def serialize_ticket(ticket: Maintenance):
            return {
                'id': ticket.id,
                'title': ticket.title,
                'status': ticket.status,
                'priority': ticket.priority,
                'due_date': ticket.due_date.isoformat() if ticket.due_date else None,
                'property_id': ticket.property_id,
                'tenant_id': ticket.tenant_id
            }

        return jsonify({
            'summary': {
                'properties': prop_count,
                'tenants': tenant_count,
                'leases': lease_count,
                'staff': staff_count
            },
            'leases': {
                'status_counts': lease_status_counts,
                'overdue_rent': overdue_rent,
                'expiring': {
                    'days_30': expiring_30,
                    'days_60': expiring_60,
                    'days_90': expiring_90
                },
                'occupancy': {
                    'active_leases': active_leases,
                    'total_units': total_units,
                    'occupancy_rate': occupancy_rate
                },
                'expiring_soon': [serialize_lease(l) for l in leases_expiring_soon]
            },
            'maintenance': {
                'open_tickets': open_tickets,
                'by_status': maintenance_by_status,
                'by_priority': maintenance_by_priority,
                'due_this_week': [serialize_ticket(t) for t in due_this_week]
            },
            'admin': {
                'income_total': float(income_total or 0),
                'expense_total': float(expense_total or 0),
                'net_cash': net_cash,
                'cashflow': list(reversed(monthly_cash))
            },
            'alerts': {
                'properties_missing_manager': properties_missing_manager
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ========== Staff Endpoints ==========

@app.route('/api/staff', methods=['GET'])
def list_staff():
    """List staff members with optional filtering by property_id and active flag"""
    try:
        property_id = request.args.get('property_id', type=int)
        active_only = request.args.get('active_only', 'true').lower() == 'true'

        query = Staff.query
        if property_id:
            query = query.filter_by(property_id=property_id)
        if active_only:
            query = query.filter_by(is_active=True)

        staff = query.order_by(Staff.full_name.asc()).all()
        return jsonify([s.to_dict() for s in staff]), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/staff', methods=['POST'])
def create_staff():
    """Create a staff member"""
    try:
        data = request.get_json() or {}

        if not data.get('full_name'):
            return jsonify({'error': 'full_name is required'}), 400

        staff = Staff(
            property_id=data.get('property_id'),
            full_name=data.get('full_name'),
            role=data.get('role'),
            email=data.get('email'),
            phone=data.get('phone'),
            department=data.get('department'),
            address=data.get('address'),
            date_of_birth=datetime.fromisoformat(data['date_of_birth']).date() if data.get('date_of_birth') else None,
            start_date=datetime.fromisoformat(data['start_date']).date() if data.get('start_date') else None,
            is_active=data.get('is_active', True)
        )
        db.session.add(staff)
        db.session.commit()

        return jsonify(staff.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/staff/<int:staff_id>', methods=['PUT'])
def update_staff(staff_id):
    """Update a staff member"""
    staff = Staff.query.get(staff_id)
    if not staff:
        return error_response('Staff not found', 404)

    try:
        data = request.get_json() or {}

        for field in ['property_id', 'full_name', 'role', 'email', 'phone', 'is_active']:
            if field in data:
                setattr(staff, field, data[field])
        if 'department' in data:
            staff.department = data.get('department')
        if 'address' in data:
            staff.address = data.get('address')
        if 'date_of_birth' in data:
            staff.date_of_birth = datetime.fromisoformat(data['date_of_birth']).date() if data.get('date_of_birth') else None
        if 'start_date' in data:
            staff.start_date = datetime.fromisoformat(data['start_date']).date() if data.get('start_date') else None

        db.session.commit()
        return jsonify(staff.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/staff/<int:staff_id>', methods=['DELETE'])
def delete_staff(staff_id):
    """Delete a staff member"""
    staff = Staff.query.get(staff_id)
    if not staff:
        return error_response('Staff not found', 404)

    try:
        db.session.delete(staff)
        db.session.commit()
        return jsonify({'message': 'Staff deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)


# ========== Geocoding Endpoint ==========

@app.route('/api/geocode', methods=['POST'])
def geocode_address():
    """Geocode an address using Nominatim (OpenStreetMap)"""
    try:
        import urllib.parse
        import urllib.request
        import json

        data = request.get_json()
        address = data.get('address', '')

        if not address:
            return error_response('Address is required', 400)

        # Build full address string
        parts = [
            data.get('address', ''),
            data.get('city', ''),
            data.get('province', ''),
            data.get('country', '')
        ]
        full_address = ', '.join([p for p in parts if p])

        # Use Nominatim API (OpenStreetMap)
        encoded_address = urllib.parse.quote(full_address)
        url = f'https://nominatim.openstreetmap.org/search?q={encoded_address}&format=json&limit=1'

        req = urllib.request.Request(url)
        req.add_header('User-Agent', 'PropertyManagementApp/1.0')

        with urllib.request.urlopen(req, timeout=5) as response:
            results = json.loads(response.read().decode())

        if not results:
            return error_response('Address not found', 404)

        result = results[0]
        return jsonify({
            'latitude': float(result['lat']),
            'longitude': float(result['lon']),
            'display_name': result.get('display_name', '')
        }), 200

    except Exception as e:
        return error_response(f'Geocoding failed: {str(e)}', 500)


# ========== Invoice Endpoints ==========

@app.route('/api/invoices', methods=['GET'])
def list_invoices():
    """List invoices with optional filters"""
    try:
        property_id = request.args.get('property_id', type=int)
        lease_id = request.args.get('lease_id', type=int)
        maintenance_id = request.args.get('maintenance_id', type=int)
        status = request.args.get('status')
        query_text = request.args.get('q', '').strip()
        query = Invoice.query
        if property_id:
            query = query.filter_by(property_id=property_id)
        if lease_id:
            query = query.filter_by(lease_id=lease_id)
        if maintenance_id:
            query = query.filter_by(maintenance_id=maintenance_id)
        if status:
            query = query.filter_by(status=status)
        if query_text:
            like_pattern = f"%{query_text}%"
            query = query.filter(db.or_(Invoice.number.ilike(like_pattern), Invoice.memo.ilike(like_pattern)))
        query = query.join(Property, isouter=True).join(Lease, isouter=True)
        invoices = query.order_by(Invoice.due_date.asc().nullslast(), Invoice.created_at.desc()).all()
        return jsonify([i.to_dict() for i in invoices]), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/invoices', methods=['POST'])
def create_invoice():
    """Create an invoice"""
    try:
        data = request.get_json() or {}
        if data.get('amount') is None:
            return error_response('amount is required', 400)
        issue_date = parse_iso_date(data.get('issue_date'), 'issue_date') or date.today()
        due_date = parse_iso_date(data.get('due_date'), 'due_date')
        paid_at = parse_iso_datetime(data.get('paid_at'), 'paid_at')

        if data.get('property_id'):
            prop = Property.query.get(data.get('property_id'))
            if not prop:
                return error_response('Invalid property', 400)
        if data.get('lease_id'):
            lease = Lease.query.get(data.get('lease_id'))
            if not lease:
                return error_response('Invalid lease', 400)

        invoice = Invoice(
            number=data.get('number'),
            property_id=data.get('property_id'),
            lease_id=data.get('lease_id'),
            amount=data.get('amount'),
            status=data.get('status', 'pending'),
            due_date=due_date,
            issue_date=issue_date,
            paid_at=paid_at,
            memo=data.get('memo')
        )
        db.session.add(invoice)
        db.session.commit()
        return jsonify(invoice.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/invoices/<int:invoice_id>', methods=['PUT'])
def update_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return error_response('Invoice not found', 404)
    try:
        data = request.get_json() or {}
        if 'number' in data:
            invoice.number = data.get('number')
        if 'amount' in data:
            invoice.amount = data.get('amount')
        if 'status' in data:
            invoice.status = data.get('status')
        if 'due_date' in data:
            invoice.due_date = parse_iso_date(data.get('due_date'), 'due_date')
        if 'issue_date' in data:
            invoice.issue_date = parse_iso_date(data.get('issue_date'), 'issue_date')
        if 'paid_at' in data:
            invoice.paid_at = parse_iso_datetime(data.get('paid_at'), 'paid_at')
        if 'memo' in data:
            invoice.memo = data.get('memo')
        if 'property_id' in data:
            if data.get('property_id'):
                prop = Property.query.get(data.get('property_id'))
                if not prop:
                    return error_response('Invalid property', 400)
                invoice.property_id = data.get('property_id')
            else:
                invoice.property_id = None
        if 'lease_id' in data:
            if data.get('lease_id'):
                lease = Lease.query.get(data.get('lease_id'))
                if not lease:
                    return error_response('Invalid lease', 400)
                invoice.lease_id = data.get('lease_id')
            else:
                invoice.lease_id = None
        if 'maintenance_id' in data:
            if data.get('maintenance_id'):
                ticket = Maintenance.query.get(data.get('maintenance_id'))
                if not ticket:
                    return error_response('Invalid maintenance', 400)
                invoice.maintenance_id = data.get('maintenance_id')
            else:
                invoice.maintenance_id = None

        db.session.commit()
        return jsonify(invoice.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/invoices/<int:invoice_id>', methods=['DELETE'])
def delete_invoice(invoice_id):
    invoice = Invoice.query.get(invoice_id)
    if not invoice:
        return error_response('Invoice not found', 404)
    try:
        db.session.delete(invoice)
        db.session.commit()
        return jsonify({'message': 'Invoice deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)


@app.route('/api/expenses', methods=['GET'])
def list_expenses():
    """List expenses with optional filters"""
    try:
        property_id = request.args.get('property_id', type=int)
        lease_id = request.args.get('lease_id', type=int)
        maintenance_id = request.args.get('maintenance_id', type=int)
        status = request.args.get('status')
        query_text = request.args.get('q', '').strip()

        query = Expense.query
        if property_id:
            query = query.filter_by(property_id=property_id)
        if lease_id:
            query = query.filter_by(lease_id=lease_id)
        if maintenance_id:
            query = query.filter_by(maintenance_id=maintenance_id)
        if status:
            query = query.filter_by(status=status)
        if query_text:
            like_pattern = f"%{query_text}%"
            query = query.filter(db.or_(Expense.memo.ilike(like_pattern), Expense.category.ilike(like_pattern)))

        expenses = query.order_by(Expense.expense_date.desc(), Expense.created_at.desc()).all()
        return jsonify([e.to_dict() for e in expenses]), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/expenses', methods=['POST'])
def create_expense():
    """Create an expense"""
    try:
        data = request.get_json() or {}
        if data.get('amount') is None:
            return error_response('amount is required', 400)
        if not data.get('expense_date'):
            return error_response('expense_date is required', 400)

        expense_date = parse_iso_date(data.get('expense_date'), 'expense_date')

        if data.get('property_id'):
            prop = Property.query.get(data.get('property_id'))
            if not prop:
                return error_response('Invalid property', 400)
        if data.get('lease_id'):
            lease = Lease.query.get(data.get('lease_id'))
            if not lease:
                return error_response('Invalid lease', 400)
        if data.get('maintenance_id'):
            maint = Maintenance.query.get(data.get('maintenance_id'))
            if not maint:
                return error_response('Invalid maintenance', 400)

        exp = Expense(
            property_id=data.get('property_id'),
            lease_id=data.get('lease_id'),
            maintenance_id=data.get('maintenance_id'),
            category=data.get('category'),
            amount=data.get('amount'),
            expense_date=expense_date,
            status=data.get('status', 'recorded'),
            memo=data.get('memo')
        )
        db.session.add(exp)
        db.session.commit()
        return jsonify(exp.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/expenses/<int:expense_id>', methods=['PUT'])
def update_expense(expense_id):
    exp = Expense.query.get(expense_id)
    if not exp:
        return error_response('Expense not found', 404)
    try:
        data = request.get_json() or {}
        if 'amount' in data:
            exp.amount = data.get('amount')
        if 'category' in data:
            exp.category = data.get('category')
        if 'expense_date' in data:
            exp.expense_date = parse_iso_date(data.get('expense_date'), 'expense_date')
        if 'status' in data:
            exp.status = data.get('status')
        if 'memo' in data:
            exp.memo = data.get('memo')
        if 'property_id' in data:
            if data.get('property_id'):
                prop = Property.query.get(data.get('property_id'))
                if not prop:
                    return error_response('Invalid property', 400)
                exp.property_id = data.get('property_id')
            else:
                exp.property_id = None
        if 'lease_id' in data:
            if data.get('lease_id'):
                lease = Lease.query.get(data.get('lease_id'))
                if not lease:
                    return error_response('Invalid lease', 400)
                exp.lease_id = data.get('lease_id')
            else:
                exp.lease_id = None
        if 'maintenance_id' in data:
            if data.get('maintenance_id'):
                maint = Maintenance.query.get(data.get('maintenance_id'))
                if not maint:
                    return error_response('Invalid maintenance', 400)
                exp.maintenance_id = data.get('maintenance_id')
            else:
                exp.maintenance_id = None

        db.session.commit()
        return jsonify(exp.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    exp = Expense.query.get(expense_id)
    if not exp:
        return error_response('Expense not found', 404)
    try:
        db.session.delete(exp)
        db.session.commit()
        return jsonify({'message': 'Expense deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)
# ========== Transactions (Accounting) Endpoints ==========

@app.route('/api/transactions', methods=['GET'])
def list_transactions():
    """List transactions with optional filtering"""
    try:
        property_id = request.args.get('property_id', type=int)
        txn_type = request.args.get('txn_type')
        month = request.args.get('month')  # YYYY-MM

        query = Transaction.query
        if property_id:
            query = query.filter_by(property_id=property_id)
        if txn_type in ['income', 'expense']:
            query = query.filter_by(txn_type=txn_type)
        if month:
            try:
                year, m = month.split('-')
                month_start = date(int(year), int(m), 1)
                next_month = (month_start + timedelta(days=32)).replace(day=1)
                query = query.filter(Transaction.txn_date >= month_start, Transaction.txn_date < next_month)
            except Exception:
                return error_response('month must be YYYY-MM', 400)

        items = query.order_by(Transaction.txn_date.desc(), Transaction.id.desc()).all()
        return jsonify([t.to_dict() for t in items]), 200
    except Exception as e:
        return error_response(str(e), 500)


@app.route('/api/transactions', methods=['POST'])
def create_transaction():
    """Create a transaction"""
    try:
        data = request.get_json() or {}
        if data.get('txn_type') not in ['income', 'expense']:
            return error_response('txn_type must be income or expense', 400)
        if data.get('amount') is None:
            return error_response('amount is required', 400)
        if data.get('txn_date') is None:
            return error_response('txn_date is required', 400)

        txn_date = parse_iso_date(data.get('txn_date'), 'txn_date')

        if data.get('property_id'):
            prop = Property.query.get(data.get('property_id'))
            if not prop:
                return error_response('Invalid property', 400)
        if data.get('lease_id'):
            lease = Lease.query.get(data.get('lease_id'))
            if not lease:
                return error_response('Invalid lease', 400)

        txn = Transaction(
            property_id=data.get('property_id'),
            lease_id=data.get('lease_id'),
            txn_type=data.get('txn_type'),
            category=data.get('category'),
            amount=data.get('amount'),
            txn_date=txn_date,
            status=data.get('status', 'cleared'),
            memo=data.get('memo')
        )
        db.session.add(txn)
        db.session.commit()
        return jsonify(txn.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/transactions/<int:txn_id>', methods=['PUT'])
def update_transaction(txn_id):
    """Update a transaction"""
    txn = Transaction.query.get(txn_id)
    if not txn:
        return error_response('Transaction not found', 404)

    try:
        data = request.get_json() or {}

        if 'txn_type' in data:
            if data.get('txn_type') not in ['income', 'expense']:
                return error_response('txn_type must be income or expense', 400)
            txn.txn_type = data.get('txn_type')
        if 'amount' in data:
            txn.amount = data.get('amount')
        if 'category' in data:
            txn.category = data.get('category')
        if 'txn_date' in data:
            txn.txn_date = parse_iso_date(data.get('txn_date'), 'txn_date')
        if 'status' in data:
            txn.status = data.get('status')
        if 'memo' in data:
            txn.memo = data.get('memo')
        if 'property_id' in data:
            if data.get('property_id'):
                prop = Property.query.get(data.get('property_id'))
                if not prop:
                    return error_response('Invalid property', 400)
                txn.property_id = data.get('property_id')
            else:
                txn.property_id = None
        if 'lease_id' in data:
            if data.get('lease_id'):
                lease = Lease.query.get(data.get('lease_id'))
                if not lease:
                    return error_response('Invalid lease', 400)
                txn.lease_id = data.get('lease_id')
            else:
                txn.lease_id = None

        db.session.commit()
        return jsonify(txn.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        if isinstance(e, ValueError):
            return error_response(str(e), 400)
        return error_response(str(e), 500)


@app.route('/api/transactions/<int:txn_id>', methods=['DELETE'])
def delete_transaction(txn_id):
    """Delete a transaction"""
    txn = Transaction.query.get(txn_id)
    if not txn:
        return error_response('Transaction not found', 404)
    try:
        db.session.delete(txn)
        db.session.commit()
        return jsonify({'message': 'Transaction deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)


@app.route('/api/admin/summary', methods=['GET'])
def admin_summary():
    """Admin/accounting summary with net, income, expense, and monthly cashflow"""
    try:
        months = request.args.get('months', default=6, type=int)
        today = date.today()

        income_total = db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0.0)).filter(Transaction.txn_type == 'income').scalar()
        expense_total = db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0.0)).filter(Transaction.txn_type == 'expense').scalar()
        net_cash = float((income_total or 0) - (expense_total or 0))

        cashflow = []
        for i in range(months):
            month = month_start_for(today, i)
            next_month = month_start_for(today, i - 1)
            income = db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0.0)).filter(
                Transaction.txn_type == 'income',
                Transaction.txn_date >= month,
                Transaction.txn_date < next_month
            ).scalar()
            expense = db.session.query(db.func.coalesce(db.func.sum(Transaction.amount), 0.0)).filter(
                Transaction.txn_type == 'expense',
                Transaction.txn_date >= month,
                Transaction.txn_date < next_month
            ).scalar()
            cashflow.append({
                'month': month.strftime('%Y-%m'),
                'income': float(income or 0),
                'expense': float(expense or 0),
                'net': float((income or 0) - (expense or 0))
            })

        return jsonify({
            'income_total': float(income_total or 0),
            'expense_total': float(expense_total or 0),
            'net_cash': net_cash,
            'cashflow': list(reversed(cashflow))
        }), 200
    except Exception as e:
        return error_response(str(e), 500)


# ==================== CONTRACTS ====================

@app.route('/api/contracts', methods=['GET'])
def get_contracts():
    """Get all contracts with optional status filter"""
    ensure_schema()
    status = request.args.get('status')
    query = Contract.query
    if status:
        query = query.filter_by(status=status)
    contracts = query.order_by(Contract.created_at.desc()).all()
    return jsonify([c.to_dict() for c in contracts]), 200


@app.route('/api/contracts/<int:contract_id>', methods=['GET'])
def get_contract(contract_id):
    """Get a single contract by ID"""
    ensure_schema()
    contract = Contract.query.get_or_404(contract_id)
    return jsonify(contract.to_dict()), 200


@app.route('/api/contracts', methods=['POST'])
def create_contract():
    """Create a new contract"""
    ensure_schema()
    data = request.get_json()
    if not data:
        return error_response("Request body must be JSON"), 400

    try:
        contract = Contract()
        contract.contract_type = data.get('contract_type', '')
        contract.party_name = data.get('party_name', '')
        contract.start_date = parse_iso_date(data.get('start_date'), 'start_date')
        contract.end_date = parse_iso_date(data.get('end_date'), 'end_date')
        contract.value = float(data.get('value', 0))
        contract.status = data.get('status', 'active')
        contract.description = data.get('description', '')

        db.session.add(contract)
        db.session.commit()
        return jsonify(contract.to_dict()), 201
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)


@app.route('/api/contracts/<int:contract_id>', methods=['PUT'])
def update_contract(contract_id):
    """Update an existing contract"""
    ensure_schema()
    contract = Contract.query.get_or_404(contract_id)
    data = request.get_json()
    if not data:
        return error_response("Request body must be JSON"), 400

    try:
        if 'contract_type' in data:
            contract.contract_type = data['contract_type']
        if 'party_name' in data:
            contract.party_name = data['party_name']
        if 'start_date' in data:
            contract.start_date = parse_iso_date(data['start_date'], 'start_date')
        if 'end_date' in data:
            contract.end_date = parse_iso_date(data['end_date'], 'end_date')
        if 'value' in data:
            contract.value = float(data['value'])
        if 'status' in data:
            contract.status = data['status']
        if 'description' in data:
            contract.description = data['description']

        db.session.commit()
        return jsonify(contract.to_dict()), 200
    except ValueError as e:
        return error_response(str(e), 400)
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)


@app.route('/api/contracts/<int:contract_id>', methods=['DELETE'])
def delete_contract(contract_id):
    """Delete a contract"""
    ensure_schema()
    contract = Contract.query.get_or_404(contract_id)
    try:
        db.session.delete(contract)
        db.session.commit()
        return jsonify({'message': 'Contract deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return error_response(str(e), 500)


# ==================== DATABASE INITIALIZATION ====================

def init_db():
    """Initialize the database"""
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")

        # Lightweight column migrations (idempotent)
        with db.engine.begin() as conn:
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


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5050, debug=False)
