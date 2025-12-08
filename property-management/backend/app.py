"""
Property Management API Server - Port 5050
Property, Tenant, Lease, and Maintenance Management
Database: property_db
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, date
import os

app = Flask(__name__)

# ==================== CONFIGURATION ====================

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://property_user:propertypass123@postgres-property:5432/property_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# CORS Configuration
cors_origin = os.getenv('CORS_ORIGIN', '*')
CORS(app, resources={r"/api/*": {"origins": cors_origin}})

# Database
db = SQLAlchemy(app)
_schema_ready = False

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
        # Ensure base tables exist before applying incremental column adds.
        db.create_all()

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/properties/<int:property_id>', methods=['GET'])
def get_property(property_id):
    """Get a single property by id"""
    try:
        prop = Property.query.get(property_id)
        if not prop:
            return jsonify({'error': 'Property not found'}), 404
        return jsonify(prop.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/properties', methods=['POST'])
def create_property():
    """Create a new property"""
    try:
        data = request.get_json()

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/properties/<int:property_id>', methods=['PUT'])
def update_property(property_id):
    """Update an existing property"""
    prop = Property.query.get(property_id)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

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
                setattr(prop, field, data.get(field))

        db.session.commit()
        return jsonify(prop.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/properties/<int:property_id>', methods=['DELETE'])
def delete_property(property_id):
    """Delete a property and its related leases"""
    prop = Property.query.get(property_id)
    if not prop:
        return jsonify({'error': 'Property not found'}), 404

    try:
        db.session.delete(prop)
        db.session.commit()
        return jsonify({'message': 'Property deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========== Tenant Endpoints ==========

@app.route('/api/tenants', methods=['GET'])
def get_tenants():
    """Get all tenants"""
    try:
        tenants = Tenant.query.order_by(Tenant.created_at.desc()).all()
        return jsonify([t.to_dict() for t in tenants]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/tenants/<int:tenant_id>', methods=['GET'])
def get_tenant(tenant_id):
    """Get a specific tenant"""
    try:
        tenant = Tenant.query.get(tenant_id)
        if not tenant:
            return jsonify({'error': 'Tenant not found'}), 404
        return jsonify(tenant.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/tenants', methods=['POST'])
def create_tenant():
    """Create a new tenant"""
    try:
        data = request.get_json()

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/tenants/<int:tenant_id>', methods=['PUT'])
def update_tenant(tenant_id):
    """Update tenant details"""
    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

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
        return jsonify({'error': str(e)}), 500


@app.route('/api/tenants/<int:tenant_id>', methods=['DELETE'])
def delete_tenant(tenant_id):
    """Delete a tenant"""
    tenant = Tenant.query.get(tenant_id)
    if not tenant:
        return jsonify({'error': 'Tenant not found'}), 404

    try:
        db.session.delete(tenant)
        db.session.commit()
        return jsonify({'message': 'Tenant deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========== Lease Endpoints ==========

@app.route('/api/leases', methods=['GET'])
def get_leases():
    """Get all leases"""
    try:
        leases = Lease.query.order_by(Lease.created_at.desc()).all()
        return jsonify([l.to_dict() for l in leases]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/leases', methods=['POST'])
def create_lease():
    """Create a new lease"""
    try:
        data = request.get_json()

        # Validate property and tenant exist
        property_obj = Property.query.get(data.get('property_id'))
        tenant = Tenant.query.get(data.get('tenant_id'))

        if not property_obj or not tenant:
            return jsonify({'error': 'Invalid property or tenant'}), 400

        # Parse dates
        start_date = None
        end_date = None
        if data.get('start_date'):
            start_date = datetime.fromisoformat(data.get('start_date')).date()
        if data.get('end_date'):
            end_date = datetime.fromisoformat(data.get('end_date')).date()

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
            notice_given_at=datetime.fromisoformat(data.get('notice_given_at')).replace(tzinfo=None) if data.get('notice_given_at') else None
        )

        db.session.add(lease)
        db.session.commit()

        return jsonify(lease.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/leases/<int:lease_id>', methods=['GET'])
def get_lease(lease_id):
    """Get a specific lease"""
    lease = Lease.query.get(lease_id)
    if not lease:
        return jsonify({'error': 'Lease not found'}), 404
    return jsonify(lease.to_dict()), 200


@app.route('/api/leases/<int:lease_id>', methods=['PUT'])
def update_lease(lease_id):
    """Update an existing lease"""
    lease = Lease.query.get(lease_id)
    if not lease:
        return jsonify({'error': 'Lease not found'}), 404

    try:
        data = request.get_json() or {}

        if 'property_id' in data:
            lease.property_id = data.get('property_id')
        if 'tenant_id' in data:
            lease.tenant_id = data.get('tenant_id')
        if 'unit' in data:
            lease.unit = data.get('unit')
        if 'start_date' in data:
            lease.start_date = datetime.fromisoformat(data['start_date']).date() if data.get('start_date') else None
        if 'end_date' in data:
            lease.end_date = datetime.fromisoformat(data['end_date']).date() if data.get('end_date') else None
        if 'rent' in data:
            lease.rent = data.get('rent')
        if 'rent_due_day' in data:
            lease.rent_due_day = data.get('rent_due_day')
        if 'deposit_amount' in data:
            lease.deposit_amount = data.get('deposit_amount')
        if 'status' in data:
            lease.status = data.get('status')
        if 'notice_given_at' in data:
            lease.notice_given_at = datetime.fromisoformat(data['notice_given_at']).replace(tzinfo=None) if data.get('notice_given_at') else None

        db.session.commit()
        return jsonify(lease.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/leases/<int:lease_id>', methods=['DELETE'])
def delete_lease(lease_id):
    """Delete a lease"""
    lease = Lease.query.get(lease_id)
    if not lease:
        return jsonify({'error': 'Lease not found'}), 404

    try:
        db.session.delete(lease)
        db.session.commit()
        return jsonify({'message': 'Lease deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========== Maintenance Endpoints ==========

@app.route('/api/maintenance', methods=['GET'])
def get_maintenance():
    """Get all maintenance requests"""
    try:
        maintenance = Maintenance.query.order_by(Maintenance.created_at.desc()).all()
        return jsonify([m.to_dict() for m in maintenance]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/maintenance/<int:maintenance_id>', methods=['GET'])
def get_maintenance_item(maintenance_id):
    """Get a maintenance ticket"""
    try:
        ticket = Maintenance.query.get(maintenance_id)
        if not ticket:
            return jsonify({'error': 'Maintenance not found'}), 404
        return jsonify(ticket.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/maintenance', methods=['POST'])
def create_maintenance():
    """Create a new maintenance request"""
    try:
        data = request.get_json()

        # Validate property exists
        property_obj = Property.query.get(data.get('property_id'))
        if not property_obj:
            return jsonify({'error': 'Invalid property'}), 400

        maintenance = Maintenance(
            property_id=data.get('property_id'),
            tenant_id=data.get('tenant_id'),
            title=data.get('title'),
            description=data.get('description'),
            priority=data.get('priority', 'medium'),
            due_date=date.fromisoformat(data.get('due_date')) if data.get('due_date') else None,
            completed_at=datetime.fromisoformat(data.get('completed_at')) if data.get('completed_at') else None,
            status=data.get('status', 'pending')
        )

        db.session.add(maintenance)
        db.session.commit()

        return jsonify(maintenance.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/maintenance/<int:maintenance_id>', methods=['PUT'])
def update_maintenance(maintenance_id):
    """Update a maintenance request"""
    ticket = Maintenance.query.get(maintenance_id)
    if not ticket:
        return jsonify({'error': 'Maintenance not found'}), 404

    try:
        data = request.get_json() or {}

        if 'property_id' in data:
            ticket.property_id = data.get('property_id')
        if 'tenant_id' in data:
            ticket.tenant_id = data.get('tenant_id')
        if 'title' in data:
            ticket.title = data.get('title')
        if 'description' in data:
            ticket.description = data.get('description')
        if 'priority' in data:
            ticket.priority = data.get('priority')
        if 'status' in data:
            ticket.status = data.get('status')
        if 'due_date' in data:
            ticket.due_date = date.fromisoformat(data['due_date']) if data.get('due_date') else None
        if 'completed_at' in data:
            ticket.completed_at = datetime.fromisoformat(data['completed_at']) if data.get('completed_at') else None

        db.session.commit()
        return jsonify(ticket.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@app.route('/api/maintenance/<int:maintenance_id>', methods=['DELETE'])
def delete_maintenance(maintenance_id):
    """Delete a maintenance request"""
    ticket = Maintenance.query.get(maintenance_id)
    if not ticket:
        return jsonify({'error': 'Maintenance not found'}), 404

    try:
        db.session.delete(ticket)
        db.session.commit()
        return jsonify({'message': 'Maintenance deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ========== Dashboard Endpoint ==========

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    """Get dashboard statistics"""
    try:
        prop_count = Property.query.count()
        tenant_count = Tenant.query.count()
        lease_count = Lease.query.count()
        open_tickets = Maintenance.query.filter(~Maintenance.status.in_(['completed', 'cancelled'])).count()

        return jsonify({
            'properties': prop_count,
            'tenants': tenant_count,
            'leases': lease_count,
            'open_tickets': open_tickets
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


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
            return jsonify({'error': 'Address is required'}), 400

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
            return jsonify({'error': 'Address not found'}), 404

        result = results[0]
        return jsonify({
            'latitude': float(result['lat']),
            'longitude': float(result['lon']),
            'display_name': result.get('display_name', '')
        }), 200

    except Exception as e:
        return jsonify({'error': f'Geocoding failed: {str(e)}'}), 500


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

        # Add sample data if no properties exist
        if Property.query.count() == 0:
            print("Adding sample data...")

            # Create properties
            prop1 = Property(
                name='Harbor View Apartments',
                address='101 Waterfront Dr',
                city='Toronto',
                province='ON',
                country='Canada',
                units_total=24,
                manager_name='Sofia Lee',
                manager_phone='555-900-1111',
                manager_email='sofia.lee@harborview.com',
                postal_code='M5J 1A1',
                latitude=43.6408,
                longitude=-79.3853
            )
            prop2 = Property(
                name='Maple Grove Townhomes',
                address='77 Cedar Ave',
                city='Mississauga',
                province='ON',
                country='Canada',
                units_total=16,
                manager_name='Daniel Green',
                manager_phone='555-222-3333',
                manager_email='daniel.green@maplegrove.com',
                postal_code='L5A 1B2',
                latitude=43.5890,
                longitude=-79.6441
            )
            db.session.add_all([prop1, prop2])
            db.session.flush()

            # Create tenants
            tenant1 = Tenant(
                full_name='Alex Morgan',
                email='alex.morgan@example.com',
                phone='555-100-2000'
            )
            tenant2 = Tenant(
                full_name='Jamie Patel',
                email='jamie.patel@example.com',
                phone='555-300-4000'
            )
            db.session.add_all([tenant1, tenant2])
            db.session.flush()

            # Create leases
            lease1 = Lease(
                property_id=prop1.id,
                tenant_id=tenant1.id,
                unit='A-201',
                start_date=date(2025, 1, 1),
                end_date=date(2025, 12, 31),
                rent=2200,
                rent_due_day=1,
                deposit_amount=2200,
                status='active'
            )
            lease2 = Lease(
                property_id=prop2.id,
                tenant_id=tenant2.id,
                unit='B-104',
                start_date=date(2025, 2, 1),
                end_date=date(2026, 1, 31),
                rent=1850,
                rent_due_day=1,
                deposit_amount=1850,
                status='draft'
            )
            db.session.add_all([lease1, lease2])

            # Create maintenance requests
            m1 = Maintenance(
                property_id=prop1.id,
                tenant_id=tenant1.id,
                title='Leaky faucet',
                description='Kitchen faucet dripping',
                priority='low',
                due_date=date(2025, 1, 15),
                status='pending'
            )
            m2 = Maintenance(
                property_id=prop2.id,
                tenant_id=tenant2.id,
                title='Heating issue',
                description='Living room heater not warming',
                priority='high',
                due_date=date(2025, 1, 10),
                status='in_progress'
            )
            db.session.add_all([m1, m2])

            db.session.commit()
            print("Sample data added successfully")


if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5050, debug=True)
