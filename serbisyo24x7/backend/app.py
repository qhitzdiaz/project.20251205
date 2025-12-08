"""Serbisyo24x7 Services API (Flask)"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime, date
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://serbisyo_user:serbiyopass123@postgres-serbisyo:5432/serbisyo_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-serbisyo')

CORS(app, resources={r"/api/*": {"origins": os.getenv('CORS_ORIGIN', '*')}})
db = SQLAlchemy(app)
_schema_ready = False


class Service(db.Model):
    __tablename__ = 'services'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    category = db.Column(db.String(100))
    description = db.Column(db.Text)
    base_price = db.Column(db.Float, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'base_price': self.base_price,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class JobRequest(db.Model):
    __tablename__ = 'job_requests'
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey('services.id'))
    customer_name = db.Column(db.String(255), nullable=False)
    contact = db.Column(db.String(255))
    location = db.Column(db.Text)
    scheduled_for = db.Column(db.Date)
    status = db.Column(db.String(50), default='new')  # new, scheduled, in_progress, completed, cancelled
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    service = db.relationship('Service', backref=db.backref('jobs', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'service_id': self.service_id,
            'customer_name': self.customer_name,
            'contact': self.contact,
            'location': self.location,
            'scheduled_for': self.scheduled_for.isoformat() if self.scheduled_for else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'service': self.service.to_dict() if self.service else None
        }


def ensure_schema():
    global _schema_ready
    if _schema_ready:
        return
    with db.engine.begin() as conn:
        db.create_all()
    _schema_ready = True


@app.before_request
def _run_schema_if_needed():
    ensure_schema()


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'serbisyo24x7'}), 200


@app.route('/api/services', methods=['GET'])
def list_services():
    services = Service.query.order_by(Service.created_at.desc()).all()
    return jsonify([s.to_dict() for s in services]), 200


@app.route('/api/services', methods=['POST'])
def create_service():
    data = request.get_json() or {}
    if not data.get('name'):
        return jsonify({'error': 'name is required'}), 400
    svc = Service(
        name=data.get('name'),
        category=data.get('category'),
        description=data.get('description'),
        base_price=data.get('base_price', 0)
    )
    db.session.add(svc)
    db.session.commit()
    return jsonify(svc.to_dict()), 201


@app.route('/api/services/<int:service_id>', methods=['PUT'])
def update_service(service_id):
    svc = Service.query.get(service_id)
    if not svc:
        return jsonify({'error': 'Service not found'}), 404
    data = request.get_json() or {}
    for field in ['name', 'category', 'description', 'base_price']:
        if field in data:
            setattr(svc, field, data.get(field))
    db.session.commit()
    return jsonify(svc.to_dict()), 200


@app.route('/api/services/<int:service_id>', methods=['DELETE'])
def delete_service(service_id):
    svc = Service.query.get(service_id)
    if not svc:
        return jsonify({'error': 'Service not found'}), 404
    db.session.delete(svc)
    db.session.commit()
    return jsonify({'message': 'Service deleted'}), 200


@app.route('/api/jobs', methods=['GET'])
def list_jobs():
    status = request.args.get('status')
    query = JobRequest.query
    if status:
        query = query.filter_by(status=status)
    jobs = query.order_by(JobRequest.created_at.desc()).all()
    return jsonify([j.to_dict() for j in jobs]), 200


@app.route('/api/jobs', methods=['POST'])
def create_job():
    data = request.get_json() or {}
    if not data.get('customer_name'):
        return jsonify({'error': 'customer_name is required'}), 400
    scheduled_for = date.fromisoformat(data['scheduled_for']) if data.get('scheduled_for') else None
    job = JobRequest(
        service_id=data.get('service_id'),
        customer_name=data.get('customer_name'),
        contact=data.get('contact'),
        location=data.get('location'),
        scheduled_for=scheduled_for,
        status=data.get('status', 'new'),
        notes=data.get('notes')
    )
    db.session.add(job)
    db.session.commit()
    return jsonify(job.to_dict()), 201


@app.route('/api/jobs/<int:job_id>', methods=['PUT'])
def update_job(job_id):
    job = JobRequest.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    data = request.get_json() or {}
    for field in ['service_id', 'customer_name', 'contact', 'location', 'status', 'notes']:
        if field in data:
            setattr(job, field, data.get(field))
    if 'scheduled_for' in data:
        job.scheduled_for = date.fromisoformat(data['scheduled_for']) if data.get('scheduled_for') else None
    db.session.commit()
    return jsonify(job.to_dict()), 200


@app.route('/api/jobs/<int:job_id>', methods=['DELETE'])
def delete_job(job_id):
    job = JobRequest.query.get(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
    db.session.delete(job)
    db.session.commit()
    return jsonify({'message': 'Job deleted'}), 200


if __name__ == '__main__':
    ensure_schema()
    app.run(host='0.0.0.0', port=5080, debug=True)
