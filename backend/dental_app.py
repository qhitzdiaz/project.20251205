"""
Dental Appointment Application - Port 5013 (changed from 5003)
Complete dental practice management system
Database: dental_db
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime, timedelta
import os
import uuid
import ocr_utils

app = Flask(__name__)

# ==================== CONFIGURATION ====================

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DENTAL_DATABASE_URL',
    'postgresql://qhitz_user:devpass123@postgres-dental:5432/dental_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max for scanned docs
app.config['UPLOAD_FOLDER'] = '/app/scanned_documents'

# CORS Configuration
cors_origin = os.getenv('CORS_ORIGIN', '*')
CORS(app, resources={r"/api/*": {"origins": cors_origin}})

# Database
db = SQLAlchemy(app)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ==================== MODELS ====================

class Patient(db.Model):
    """Patient model"""
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    date_of_birth = db.Column(db.Date)
    # Detailed address fields
    street_address = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    zip_code = db.Column(db.String(20))
    country = db.Column(db.String(100))
    emergency_contact = db.Column(db.String(100))
    emergency_phone = db.Column(db.String(20))
    insurance_provider = db.Column(db.String(100))
    insurance_number = db.Column(db.String(50))
    medical_notes = db.Column(db.Text)
    allergies = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='patient', lazy=True)
    treatments = db.relationship('Treatment', backref='patient', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'street_address': self.street_address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'country': self.country,
            'emergency_contact': self.emergency_contact,
            'emergency_phone': self.emergency_phone,
            'insurance_provider': self.insurance_provider,
            'insurance_number': self.insurance_number,
            'medical_notes': self.medical_notes,
            'allergies': self.allergies,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_active': self.is_active
        }

class Dentist(db.Model):
    """Dentist/Doctor model"""
    __tablename__ = 'dentists'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    specialization = db.Column(db.String(100))
    license_number = db.Column(db.String(50))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    appointments = db.relationship('Appointment', backref='dentist', lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"Dr. {self.first_name} {self.last_name}",
            'email': self.email,
            'phone': self.phone,
            'specialization': self.specialization,
            'license_number': self.license_number,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Appointment(db.Model):
    """Appointment model"""
    __tablename__ = 'appointments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    dentist_id = db.Column(db.Integer, db.ForeignKey('dentists.id'), nullable=False)
    appointment_date = db.Column(db.DateTime, nullable=False)
    duration = db.Column(db.Integer, default=30)  # Duration in minutes
    appointment_type = db.Column(db.String(100))  # checkup, cleaning, filling, etc.
    status = db.Column(db.String(20), default='scheduled')  # scheduled, confirmed, completed, cancelled
    reason = db.Column(db.Text)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': f"{self.patient.first_name} {self.patient.last_name}",
            'dentist_id': self.dentist_id,
            'dentist_name': f"Dr. {self.dentist.first_name} {self.dentist.last_name}",
            'appointment_date': self.appointment_date.isoformat() if self.appointment_date else None,
            'duration': self.duration,
            'appointment_type': self.appointment_type,
            'status': self.status,
            'reason': self.reason,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class Treatment(db.Model):
    """Treatment/Procedure model"""
    __tablename__ = 'treatments'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    appointment_id = db.Column(db.Integer, db.ForeignKey('appointments.id'))
    treatment_name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    tooth_number = db.Column(db.String(10))
    treatment_date = db.Column(db.DateTime, nullable=False)
    cost = db.Column(db.Float)
    payment_status = db.Column(db.String(20), default='pending')  # pending, paid, partial
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': f"{self.patient.first_name} {self.patient.last_name}",
            'appointment_id': self.appointment_id,
            'treatment_name': self.treatment_name,
            'description': self.description,
            'tooth_number': self.tooth_number,
            'treatment_date': self.treatment_date.isoformat() if self.treatment_date else None,
            'cost': self.cost,
            'payment_status': self.payment_status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class ScannedDocument(db.Model):
    """Scanned document model for patient records"""
    __tablename__ = 'scanned_documents'
    
    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    document_type = db.Column(db.String(100), nullable=False)  # medical_history, xray, prescription, insurance, consent_form, lab_report
    document_title = db.Column(db.String(255), nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    page_count = db.Column(db.Integer, default=1)
    scan_date = db.Column(db.DateTime, default=datetime.utcnow)
    scanned_by = db.Column(db.String(100))  # Staff member who scanned
    notes = db.Column(db.Text)
    tags = db.Column(db.String(500))
    is_archived = db.Column(db.Boolean, default=False)
    
    # Relationship
    patient = db.relationship('Patient', backref='scanned_documents')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'patient_name': f"{self.patient.first_name} {self.patient.last_name}",
            'document_type': self.document_type,
            'document_title': self.document_title,
            'file_path': self.file_path,
            'file_size': self.file_size,
            'file_size_mb': round(self.file_size / (1024 * 1024), 2),
            'page_count': self.page_count,
            'scan_date': self.scan_date.isoformat() if self.scan_date else None,
            'scanned_by': self.scanned_by,
            'notes': self.notes,
            'tags': self.tags.split(',') if self.tags else [],
            'is_archived': self.is_archived,
            'download_url': f'/api/dental/document/download/{self.id}'
        }

# ==================== PHILIPPINE GEOGRAPHIC REFERENCE MODELS ====================

class PHRegion(db.Model):
    """Philippine Regions"""
    __tablename__ = 'ph_regions'

    id = db.Column(db.Integer, primary_key=True)
    region_code = db.Column(db.String(20), unique=True, nullable=False)
    region_name = db.Column(db.String(100), nullable=False)

    # Relationships
    provinces = db.relationship('PHProvince', backref='region', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'region_code': self.region_code,
            'region_name': self.region_name
        }

class PHProvince(db.Model):
    """Philippine Provinces"""
    __tablename__ = 'ph_provinces'

    id = db.Column(db.Integer, primary_key=True)
    region_id = db.Column(db.Integer, db.ForeignKey('ph_regions.id'), nullable=False)
    province_code = db.Column(db.String(20), unique=True, nullable=False)
    province_name = db.Column(db.String(100), nullable=False)

    # Relationships
    cities = db.relationship('PHCity', backref='province', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'region_id': self.region_id,
            'region_name': self.region.region_name,
            'province_code': self.province_code,
            'province_name': self.province_name
        }

class PHCity(db.Model):
    """Philippine Cities and Municipalities"""
    __tablename__ = 'ph_cities'

    id = db.Column(db.Integer, primary_key=True)
    province_id = db.Column(db.Integer, db.ForeignKey('ph_provinces.id'), nullable=False)
    city_code = db.Column(db.String(50), unique=True, nullable=False)
    city_name = db.Column(db.String(100), nullable=False)
    city_type = db.Column(db.String(50))  # 'city', 'municipality', 'component city', 'highly urbanized city'

    # Relationships
    barangays = db.relationship('PHBarangay', backref='city', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'province_id': self.province_id,
            'province_name': self.province.province_name,
            'city_code': self.city_code,
            'city_name': self.city_name,
            'city_type': self.city_type
        }

class PHBarangay(db.Model):
    """Philippine Barangays"""
    __tablename__ = 'ph_barangays'

    id = db.Column(db.Integer, primary_key=True)
    city_id = db.Column(db.Integer, db.ForeignKey('ph_cities.id'), nullable=False)
    barangay_code = db.Column(db.String(20), unique=True, nullable=False)
    barangay_name = db.Column(db.String(100), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'city_id': self.city_id,
            'city_name': self.city.city_name,
            'barangay_code': self.barangay_code,
            'barangay_name': self.barangay_name
        }

class PHStreet(db.Model):
    """Common Streets in Philippine Cities"""
    __tablename__ = 'ph_streets'

    id = db.Column(db.Integer, primary_key=True)
    city_id = db.Column(db.Integer, db.ForeignKey('ph_cities.id'), nullable=False)
    barangay_id = db.Column(db.Integer, db.ForeignKey('ph_barangays.id'))
    street_name = db.Column(db.String(200), nullable=False)
    street_type = db.Column(db.String(50))  # 'street', 'avenue', 'road', 'boulevard'

    # Relationship
    city = db.relationship('PHCity', backref='streets')
    barangay = db.relationship('PHBarangay', backref='streets')

    def to_dict(self):
        return {
            'id': self.id,
            'city_id': self.city_id,
            'city_name': self.city.city_name,
            'barangay_id': self.barangay_id,
            'barangay_name': self.barangay.barangay_name if self.barangay else None,
            'street_name': self.street_name,
            'street_type': self.street_type
        }

# ==================== HEALTH CHECK ====================

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Dental Appointment System',
        'version': '1.0.0',
        'port': 5003,
        'database': 'dental_db',
        'endpoints': {
            'health': '/api/health',
            'patients': '/api/dental/patients',
            'dentists': '/api/dental/dentists',
            'appointments': '/api/dental/appointments',
            'treatments': '/api/dental/treatments',
            'documents': '/api/dental/documents/upload',
            'stats': '/api/dental/stats'
        }
    }), 200

@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'service': 'Dental Appointment API',
        'version': '1.0.0',
        'endpoints': {
            'patients': {
                'list': 'GET /api/dental/patients',
                'create': 'POST /api/dental/patients',
                'get': 'GET /api/dental/patient/<id>',
                'update': 'PUT /api/dental/patient/<id>'
            },
            'dentists': {
                'list': 'GET /api/dental/dentists',
                'create': 'POST /api/dental/dentists'
            },
            'appointments': {
                'list': 'GET /api/dental/appointments',
                'create': 'POST /api/dental/appointments',
                'update': 'PUT /api/dental/appointment/<id>',
                'cancel': 'DELETE /api/dental/appointment/<id>'
            },
            'treatments': {
                'list': 'GET /api/dental/treatments',
                'create': 'POST /api/dental/treatments'
            },
            'documents': {
                'upload': 'POST /api/dental/documents/upload',
                'list': 'GET /api/dental/documents',
                'download': 'GET /api/dental/document/download/<id>',
                'delete': 'DELETE /api/dental/document/<id>',
                'types': 'GET /api/dental/documents/types'
            },
            'statistics': 'GET /api/dental/stats'
        }
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'service': 'dental-appointment',
            'port': 5003,
            'database': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'dental-appointment',
            'database': 'disconnected',
            'error': str(e)
        }), 500

# ==================== PATIENT ROUTES ====================

@app.route('/api/dental/patients', methods=['POST'])
def create_patient():
    """Create a new patient"""
    data = request.get_json()
    
    required_fields = ['first_name', 'last_name', 'email', 'phone']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Check if email exists
    if Patient.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 409
    
    patient = Patient(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone=data['phone'],
        date_of_birth=datetime.fromisoformat(data['date_of_birth']) if data.get('date_of_birth') else None,
        street_address=data.get('street_address'),
        city=data.get('city'),
        state=data.get('state'),
        zip_code=data.get('zip_code'),
        country=data.get('country'),
        emergency_contact=data.get('emergency_contact'),
        emergency_phone=data.get('emergency_phone'),
        insurance_provider=data.get('insurance_provider'),
        insurance_number=data.get('insurance_number'),
        medical_notes=data.get('medical_notes'),
        allergies=data.get('allergies')
    )
    
    db.session.add(patient)
    db.session.commit()
    
    return jsonify({
        'message': 'Patient created successfully',
        'patient': patient.to_dict()
    }), 201

@app.route('/api/dental/patients', methods=['GET'])
def get_patients():
    """Get all patients"""
    search = request.args.get('search', '')
    active_only = request.args.get('active_only', 'true').lower() == 'true'
    
    query = Patient.query
    
    if active_only:
        query = query.filter_by(is_active=True)
    
    if search:
        query = query.filter(
            db.or_(
                Patient.first_name.ilike(f'%{search}%'),
                Patient.last_name.ilike(f'%{search}%'),
                Patient.email.ilike(f'%{search}%'),
                Patient.phone.ilike(f'%{search}%')
            )
        )
    
    patients = query.order_by(Patient.last_name, Patient.first_name).all()

    # Add document count for each patient
    patients_with_docs = []
    for patient in patients:
        patient_dict = patient.to_dict()
        doc_count = ScannedDocument.query.filter_by(patient_id=patient.id, is_archived=False).count()
        patient_dict['document_count'] = doc_count
        patients_with_docs.append(patient_dict)

    return jsonify({
        'patients': patients_with_docs,
        'total': len(patients)
    }), 200

@app.route('/api/dental/patient/<int:patient_id>', methods=['GET'])
def get_patient(patient_id):
    """Get patient details"""
    patient = Patient.query.get_or_404(patient_id)
    
    upcoming_appointments = Appointment.query.filter(
        Appointment.patient_id == patient_id,
        Appointment.appointment_date >= datetime.utcnow(),
        Appointment.status.in_(['scheduled', 'confirmed'])
    ).order_by(Appointment.appointment_date).all()
    
    recent_treatments = Treatment.query.filter_by(patient_id=patient_id).order_by(
        Treatment.treatment_date.desc()
    ).limit(10).all()
    
    return jsonify({
        'patient': patient.to_dict(),
        'upcoming_appointments': [apt.to_dict() for apt in upcoming_appointments],
        'recent_treatments': [t.to_dict() for t in recent_treatments]
    }), 200

@app.route('/api/dental/patient/<int:patient_id>', methods=['PUT'])
def update_patient(patient_id):
    """Update patient information"""
    patient = Patient.query.get_or_404(patient_id)
    data = request.get_json()
    
    # Update fields
    updateable_fields = ['first_name', 'last_name', 'phone', 'street_address', 'city', 'state',
                         'zip_code', 'country', 'emergency_contact', 'emergency_phone',
                         'insurance_provider', 'insurance_number', 'medical_notes', 'allergies', 'is_active']
    
    for field in updateable_fields:
        if field in data:
            setattr(patient, field, data[field])
    
    if 'date_of_birth' in data and data['date_of_birth']:
        patient.date_of_birth = datetime.fromisoformat(data['date_of_birth'])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Patient updated successfully',
        'patient': patient.to_dict()
    }), 200

# ==================== DENTIST ROUTES ====================

@app.route('/api/dental/dentists', methods=['POST'])
def create_dentist():
    """Create a new dentist"""
    data = request.get_json()
    
    required_fields = ['first_name', 'last_name', 'email', 'phone']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if Dentist.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 409
    
    dentist = Dentist(
        first_name=data['first_name'],
        last_name=data['last_name'],
        email=data['email'],
        phone=data['phone'],
        specialization=data.get('specialization'),
        license_number=data.get('license_number')
    )
    
    db.session.add(dentist)
    db.session.commit()
    
    return jsonify({
        'message': 'Dentist created successfully',
        'dentist': dentist.to_dict()
    }), 201

@app.route('/api/dental/dentists', methods=['GET'])
def get_dentists():
    """Get all dentists"""
    active_only = request.args.get('active_only', 'true').lower() == 'true'
    
    query = Dentist.query
    if active_only:
        query = query.filter_by(is_active=True)
    
    dentists = query.order_by(Dentist.last_name).all()
    
    return jsonify({
        'dentists': [dentist.to_dict() for dentist in dentists]
    }), 200

# ==================== APPOINTMENT ROUTES ====================

@app.route('/api/dental/appointments', methods=['POST'])
def create_appointment():
    """Create a new appointment"""
    data = request.get_json()

    required_fields = ['patient_id', 'dentist_id', 'appointment_date']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400

    # Validate that appointment_date is not empty
    if not data['appointment_date'] or data['appointment_date'].strip() == '':
        return jsonify({'message': 'Appointment date cannot be empty'}), 400

    # Validate date format
    try:
        appointment_date = datetime.fromisoformat(data['appointment_date'])
    except ValueError:
        return jsonify({'message': 'Invalid appointment date format. Expected ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400

    appointment = Appointment(
        patient_id=data['patient_id'],
        dentist_id=data['dentist_id'],
        appointment_date=appointment_date,
        duration=data.get('duration', 30),
        appointment_type=data.get('appointment_type'),
        reason=data.get('reason'),
        notes=data.get('notes')
    )

    db.session.add(appointment)
    db.session.commit()

    return jsonify({
        'message': 'Appointment created successfully',
        'appointment': appointment.to_dict()
    }), 201

@app.route('/api/dental/appointments', methods=['GET'])
def get_appointments():
    """Get appointments with filters"""
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    patient_id = request.args.get('patient_id', type=int)
    dentist_id = request.args.get('dentist_id', type=int)
    status = request.args.get('status')
    
    query = Appointment.query
    
    if date_from:
        query = query.filter(Appointment.appointment_date >= datetime.fromisoformat(date_from))
    
    if date_to:
        query = query.filter(Appointment.appointment_date <= datetime.fromisoformat(date_to))
    
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    if dentist_id:
        query = query.filter_by(dentist_id=dentist_id)
    
    if status:
        query = query.filter_by(status=status)
    
    appointments = query.order_by(Appointment.appointment_date).all()
    
    return jsonify({
        'appointments': [apt.to_dict() for apt in appointments],
        'total': len(appointments)
    }), 200

@app.route('/api/dental/appointment/<int:appointment_id>', methods=['PUT'])
def update_appointment(appointment_id):
    """Update appointment"""
    appointment = Appointment.query.get_or_404(appointment_id)
    data = request.get_json()
    
    if 'appointment_date' in data:
        appointment.appointment_date = datetime.fromisoformat(data['appointment_date'])
    
    updateable_fields = ['dentist_id', 'duration', 'appointment_type', 'status', 'reason', 'notes']
    for field in updateable_fields:
        if field in data:
            setattr(appointment, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Appointment updated successfully',
        'appointment': appointment.to_dict()
    }), 200

@app.route('/api/dental/appointment/<int:appointment_id>', methods=['DELETE'])
def cancel_appointment(appointment_id):
    """Cancel an appointment"""
    appointment = Appointment.query.get_or_404(appointment_id)
    appointment.status = 'cancelled'
    db.session.commit()
    
    return jsonify({'message': 'Appointment cancelled successfully'}), 200

# ==================== TREATMENT ROUTES ====================

@app.route('/api/dental/treatments', methods=['POST'])
def create_treatment():
    """Create a new treatment record"""
    data = request.get_json()
    
    required_fields = ['patient_id', 'treatment_name', 'treatment_date']
    if not all(field in data for field in required_fields):
        return jsonify({'message': 'Missing required fields'}), 400
    
    treatment = Treatment(
        patient_id=data['patient_id'],
        appointment_id=data.get('appointment_id'),
        treatment_name=data['treatment_name'],
        description=data.get('description'),
        tooth_number=data.get('tooth_number'),
        treatment_date=datetime.fromisoformat(data['treatment_date']),
        cost=data.get('cost'),
        payment_status=data.get('payment_status', 'pending'),
        notes=data.get('notes')
    )
    
    db.session.add(treatment)
    db.session.commit()
    
    return jsonify({
        'message': 'Treatment record created successfully',
        'treatment': treatment.to_dict()
    }), 201

@app.route('/api/dental/treatments', methods=['GET'])
def get_treatments():
    """Get treatment records"""
    patient_id = request.args.get('patient_id', type=int)
    
    query = Treatment.query
    
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    treatments = query.order_by(Treatment.treatment_date.desc()).all()
    
    return jsonify({
        'treatments': [t.to_dict() for t in treatments]
    }), 200

# ==================== DOCUMENT SCANNING ROUTES ====================

@app.route('/api/dental/documents/upload', methods=['POST'])
def upload_scanned_document():
    """Upload scanned document(s) (PDF) - supports single or multiple files"""
    # Support both single file and multiple files
    files = request.files.getlist('files') or ([request.files['file']] if 'file' in request.files else [])

    if not files or len(files) == 0:
        return jsonify({'message': 'No files provided'}), 400

    # Get metadata (shared across all files)
    patient_id = request.form.get('patient_id')
    document_type = request.form.get('document_type', 'other')
    document_title = request.form.get('document_title')
    scanned_by = request.form.get('scanned_by')
    notes = request.form.get('notes', '')
    tags = request.form.get('tags', '')
    page_count = request.form.get('page_count', 1, type=int)

    if not document_title:
        return jsonify({'message': 'document_title is required'}), 400

    # If no patient_id provided, create a new auto-generated patient
    if not patient_id:
        # Create auto-generated patient
        auto_patient = Patient(
            first_name='Auto',
            last_name=f'Generated-{datetime.now().strftime("%Y%m%d-%H%M%S")}',
            email=f'auto-{uuid.uuid4().hex[:8]}@generated.local',
            phone='000-000-0000',
            date_of_birth=None,
            street_address='',
            city='',
            state='',
            zip_code='',
            country='',
            insurance_provider='',
            insurance_number='',
            emergency_contact='',
            emergency_phone='',
            allergies='',
            medical_notes='Auto-generated patient for document upload'
        )
        db.session.add(auto_patient)
        db.session.flush()  # Get the ID without committing
        patient_id = auto_patient.id

    # Create patient-specific directory
    patient_dir = os.path.join(app.config['UPLOAD_FOLDER'], str(patient_id))
    os.makedirs(patient_dir, exist_ok=True)

    # Process each file
    uploaded_documents = []
    errors = []

    for idx, file in enumerate(files):
        try:
            if file.filename == '':
                errors.append({'file': f'File {idx + 1}', 'error': 'No filename'})
                continue

            # Check if PDF
            if not file.filename.lower().endswith('.pdf'):
                errors.append({'file': file.filename, 'error': 'Only PDF files are allowed'})
                continue

            # Generate unique filename
            original_filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4().hex}.pdf"

            # Save file
            file_path = os.path.join(patient_dir, unique_filename)
            file.save(file_path)

            # Get file size
            file_size = os.path.getsize(file_path)

            # Create database record with indexed title if multiple files
            file_title = document_title if len(files) == 1 else f"{document_title} ({idx + 1})"

            document = ScannedDocument(
                patient_id=int(patient_id),
                document_type=document_type,
                document_title=file_title,
                file_path=file_path,
                file_size=file_size,
                page_count=page_count,
                scanned_by=scanned_by,
                notes=notes,
                tags=tags
            )

            db.session.add(document)
            uploaded_documents.append({
                'filename': original_filename,
                'document': document.to_dict()
            })

        except Exception as e:
            errors.append({'file': file.filename if file else f'File {idx + 1}', 'error': str(e)})

    # Commit all successful uploads
    if uploaded_documents:
        db.session.commit()

    # Get patient info
    patient = Patient.query.get(patient_id)

    success_count = len(uploaded_documents)
    total_count = len(files)

    response = {
        'message': f'{success_count} of {total_count} document(s) uploaded successfully',
        'documents': [doc['document'] for doc in uploaded_documents],
        'uploaded_files': [doc['filename'] for doc in uploaded_documents],
        'patient_id': patient_id,
        'patient_name': patient.full_name if patient else 'Unknown',
        'success_count': success_count,
        'total_count': total_count
    }

    if errors:
        response['errors'] = errors

    status_code = 201 if success_count > 0 else 400
    return jsonify(response), status_code

@app.route('/api/dental/documents', methods=['GET'])
def get_scanned_documents():
    """Get scanned documents with filters"""
    patient_id = request.args.get('patient_id', type=int)
    document_type = request.args.get('document_type')
    archived = request.args.get('archived', 'false').lower() == 'true'
    
    query = ScannedDocument.query
    
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    if document_type:
        query = query.filter_by(document_type=document_type)
    
    if not archived:
        query = query.filter_by(is_archived=False)
    
    documents = query.order_by(ScannedDocument.scan_date.desc()).all()
    
    return jsonify({
        'documents': [doc.to_dict() for doc in documents],
        'total': len(documents)
    }), 200

@app.route('/api/dental/document/<int:document_id>', methods=['GET'])
def get_document_details(document_id):
    """Get document details"""
    document = ScannedDocument.query.get_or_404(document_id)
    return jsonify(document.to_dict()), 200

@app.route('/api/dental/document/download/<int:document_id>', methods=['GET'])
def download_scanned_document(document_id):
    """Download a scanned document"""
    document = ScannedDocument.query.get_or_404(document_id)
    
    directory = os.path.dirname(document.file_path)
    filename = os.path.basename(document.file_path)
    
    return send_from_directory(
        directory,
        filename,
        as_attachment=True,
        download_name=f"{document.document_title}.pdf"
    )

@app.route('/api/dental/document/<int:document_id>', methods=['PUT'])
def update_document(document_id):
    """Update document metadata"""
    document = ScannedDocument.query.get_or_404(document_id)
    data = request.get_json()
    
    updateable_fields = ['document_type', 'document_title', 'notes', 'tags', 'is_archived']
    for field in updateable_fields:
        if field in data:
            setattr(document, field, data[field])
    
    db.session.commit()
    
    return jsonify({
        'message': 'Document updated successfully',
        'document': document.to_dict()
    }), 200

@app.route('/api/dental/document/<int:document_id>', methods=['DELETE'])
def delete_scanned_document(document_id):
    """Delete a scanned document"""
    document = ScannedDocument.query.get_or_404(document_id)
    
    # Delete physical file
    try:
        os.remove(document.file_path)
    except OSError:
        pass
    
    # Delete database record
    db.session.delete(document)
    db.session.commit()
    
    return jsonify({'message': 'Document deleted successfully'}), 200

@app.route('/api/dental/documents/types', methods=['GET'])
def get_document_types():
    """Get available document types"""
    types = [
        {'value': 'medical_history', 'label': 'Medical History'},
        {'value': 'xray', 'label': 'X-Ray'},
        {'value': 'prescription', 'label': 'Prescription'},
        {'value': 'insurance', 'label': 'Insurance Document'},
        {'value': 'consent_form', 'label': 'Consent Form'},
        {'value': 'lab_report', 'label': 'Lab Report'},
        {'value': 'treatment_plan', 'label': 'Treatment Plan'},
        {'value': 'referral', 'label': 'Referral Letter'},
        {'value': 'other', 'label': 'Other'}
    ]
    
    return jsonify({'types': types}), 200

# ==================== STATISTICS ====================

@app.route('/api/dental/stats', methods=['GET'])
def get_stats():
    """Get dental practice statistics"""
    total_patients = Patient.query.filter_by(is_active=True).count()
    total_dentists = Dentist.query.filter_by(is_active=True).count()
    
    today = datetime.utcnow().date()
    appointments_today = Appointment.query.filter(
        db.func.date(Appointment.appointment_date) == today
    ).count()
    
    upcoming_appointments = Appointment.query.filter(
        Appointment.appointment_date >= datetime.utcnow(),
        Appointment.status.in_(['scheduled', 'confirmed'])
    ).count()
    
    total_revenue = db.session.query(
        db.func.sum(Treatment.cost)
    ).filter_by(payment_status='paid').scalar() or 0
    
    pending_revenue = db.session.query(
        db.func.sum(Treatment.cost)
    ).filter_by(payment_status='pending').scalar() or 0
    
    total_documents = ScannedDocument.query.filter_by(is_archived=False).count()
    
    return jsonify({
        'total_patients': total_patients,
        'total_dentists': total_dentists,
        'appointments_today': appointments_today,
        'upcoming_appointments': upcoming_appointments,
        'total_revenue': round(total_revenue, 2),
        'pending_revenue': round(pending_revenue, 2),
        'total_scanned_documents': total_documents
    }), 200

# ==================== PHILIPPINE GEOGRAPHIC REFERENCE ENDPOINTS ====================

@app.route('/api/dental/ph/regions', methods=['GET'])
def get_ph_regions():
    """Get all Philippine regions"""
    try:
        regions = PHRegion.query.order_by(PHRegion.region_name).all()
        return jsonify([region.to_dict() for region in regions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dental/ph/provinces', methods=['GET'])
def get_ph_provinces():
    """Get provinces by region ID or all provinces"""
    try:
        region_id = request.args.get('region_id', type=int)

        if region_id:
            provinces = PHProvince.query.filter_by(region_id=region_id).order_by(PHProvince.province_name).all()
        else:
            provinces = PHProvince.query.order_by(PHProvince.province_name).all()

        return jsonify([province.to_dict() for province in provinces]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dental/ph/cities', methods=['GET'])
def get_ph_cities():
    """Get cities by province ID or all cities"""
    try:
        province_id = request.args.get('province_id', type=int)

        if province_id:
            cities = PHCity.query.filter_by(province_id=province_id).order_by(PHCity.city_name).all()
        else:
            cities = PHCity.query.order_by(PHCity.city_name).all()

        return jsonify([city.to_dict() for city in cities]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dental/ph/barangays', methods=['GET'])
def get_ph_barangays():
    """Get barangays by city ID or all barangays"""
    try:
        city_id = request.args.get('city_id', type=int)

        if city_id:
            barangays = PHBarangay.query.filter_by(city_id=city_id).order_by(PHBarangay.barangay_name).all()
        else:
            barangays = PHBarangay.query.order_by(PHBarangay.barangay_name).all()

        return jsonify([barangay.to_dict() for barangay in barangays]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dental/ph/streets', methods=['GET'])
def get_ph_streets():
    """Get streets by city ID or all streets"""
    try:
        city_id = request.args.get('city_id', type=int)
        barangay_id = request.args.get('barangay_id', type=int)

        query = PHStreet.query

        if city_id:
            query = query.filter_by(city_id=city_id)
        if barangay_id:
            query = query.filter_by(barangay_id=barangay_id)

        streets = query.order_by(PHStreet.street_name).all()

        return jsonify([street.to_dict() for street in streets]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== OCR TEXT EXTRACTION ====================

@app.route('/api/dental/document/<int:document_id>/ocr', methods=['POST'])
def extract_text_from_document(document_id):
    """Extract text from a scanned document using OCR"""
    try:
        document = ScannedDocument.query.get(document_id)
        if not document:
            return jsonify({'error': 'Document not found'}), 404

        file_path = document.file_path

        if not os.path.exists(file_path):
            return jsonify({'error': 'File not found on disk'}), 404

        # Extract text using OCR
        result = ocr_utils.extract_text_from_file(file_path)

        if not result['success']:
            return jsonify({
                'error': 'OCR processing failed',
                'details': result['error']
            }), 500

        # Update document with extracted text
        document.notes = (document.notes or '') + f"\n\n[OCR Extracted Text]\n{result['text']}"
        db.session.commit()

        return jsonify({
            'success': True,
            'document_id': document_id,
            'extracted_text': result['text'],
            'method': result['method'],
            'pages': result['pages'],
            'character_count': len(result['text'])
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/dental/document/ocr/preview', methods=['POST'])
def preview_ocr():
    """Preview OCR extraction without saving to database"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    try:
        # Save temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join('/tmp', f"{uuid.uuid4()}_{filename}")
        file.save(temp_path)

        # Extract text
        result = ocr_utils.extract_text_from_file(temp_path)

        # Clean up temp file
        os.remove(temp_path)

        if not result['success']:
            return jsonify({
                'error': 'OCR processing failed',
                'details': result['error']
            }), 500

        return jsonify({
            'success': True,
            'extracted_text': result['text'],
            'method': result['method'],
            'pages': result['pages'],
            'character_count': len(result['text']),
            'word_count': len(result['text'].split())
        }), 200

    except Exception as e:
        # Clean up temp file if it exists
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({'error': str(e)}), 500

# ==================== INITIALIZE DATABASE ====================

def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Dental database tables created")

if __name__ == '__main__':
    print("🚀 Starting Dental Appointment System...")
    print(f"📊 Database: dental_db")
    print(f"🦷 Features: patients, dentists, appointments, treatments")
    print(f"🌐 Port: 5003")
    
    # Initialize database tables
    create_tables()
    
    app.run(host='0.0.0.0', port=5013, debug=True)
