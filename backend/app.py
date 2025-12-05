"""
Main API Server - Port 5010 (changed from 5000 to avoid macOS AirPlay conflict)
Authentication, User Management, General API
Database: auth_db
"""

from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from datetime import datetime, timedelta
import jwt
import os

app = Flask(__name__)

# ==================== CONFIGURATION ====================

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'postgresql://qhitz_user:devpass123@postgres-auth:5432/auth_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# CORS Configuration
cors_origin = os.getenv('CORS_ORIGIN', '*')
CORS(app, resources={r"/api/*": {"origins": cors_origin}})

# Database
db = SQLAlchemy(app)

# ==================== MODELS ====================

class User(db.Model):
    """User model for authentication"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
            'is_active': self.is_active
        }

# ==================== AUTHENTICATION DECORATOR ====================

def token_required(f):
    """Decorator to protect routes with JWT token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]  # Bearer <token>
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
            if not current_user:
                return jsonify({'message': 'User not found'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        
        return f(current_user, *args, **kwargs)
    
    return decorated

# ==================== HEALTH CHECK ====================

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Main API Server',
        'version': '1.0.0',
        'port': 5000,
        'database': 'auth_db',
        'endpoints': {
            'health': '/api/health',
            'register': '/api/auth/register',
            'login': '/api/auth/login',
            'verify': '/api/auth/verify',
            'profile': '/api/auth/profile'
        }
    }), 200

@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'service': 'Main Authentication API',
        'version': '1.0.0',
        'endpoints': {
            'auth': {
                'register': 'POST /api/auth/register',
                'login': 'POST /api/auth/login',
                'verify': 'GET /api/auth/verify',
                'profile': 'GET /api/auth/profile',
                'update_profile': 'PUT /api/auth/profile',
                'change_password': 'POST /api/auth/change-password'
            }
        }
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'service': 'main-api',
            'port': 5000,
            'database': 'connected',
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'main-api',
            'database': 'disconnected',
            'error': str(e)
        }), 500

# ==================== AUTHENTICATION ROUTES ====================

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 409
    
    # Create new user with encrypted password
    password_hash = generate_password_hash(data['password'])
    new_user = User(
        username=data['username'],
        email=data['email'],
        password_hash=password_hash
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({
        'message': 'User registered successfully',
        'user': new_user.to_dict()
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Login user and return JWT token"""
    data = request.get_json()
    
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({'message': 'Missing credentials'}), 400
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Generate JWT token
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': user.to_dict()
    }), 200

@app.route('/api/auth/verify', methods=['GET'])
@token_required
def verify_token(current_user):
    """Verify JWT token"""
    return jsonify({
        'message': 'Token is valid',
        'user': current_user.to_dict()
    }), 200

@app.route('/api/auth/profile', methods=['GET'])
@token_required
def get_profile(current_user):
    """Get user profile"""
    return jsonify(current_user.to_dict()), 200

@app.route('/api/auth/profile', methods=['PUT'])
@token_required
def update_profile(current_user):
    """Update user profile"""
    data = request.get_json()
    
    if data.get('username'):
        existing = User.query.filter_by(username=data['username']).first()
        if existing and existing.id != current_user.id:
            return jsonify({'message': 'Username already exists'}), 409
        current_user.username = data['username']
    
    if data.get('email'):
        existing = User.query.filter_by(email=data['email']).first()
        if existing and existing.id != current_user.id:
            return jsonify({'message': 'Email already exists'}), 409
        current_user.email = data['email']
    
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': current_user.to_dict()
    }), 200

@app.route('/api/auth/change-password', methods=['POST'])
@token_required
def change_password(current_user):
    """Change user password"""
    data = request.get_json()
    
    if not data.get('current_password') or not data.get('new_password'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    if not check_password_hash(current_user.password_hash, data['current_password']):
        return jsonify({'message': 'Current password is incorrect'}), 401
    
    current_user.password_hash = generate_password_hash(data['new_password'])
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200

# ==================== INITIALIZE DATABASE ====================

def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Auth database tables created")

if __name__ == '__main__':
    print("🚀 Starting Main API Server...")
    print(f"📊 Database: auth_db")
    print(f"🔐 Password encryption: PBKDF2-SHA256")
    print(f"🔑 JWT tokens: Enabled")
    print(f"🌐 Port: 5000")
    
    # Initialize database tables
    create_tables()
    
    app.run(host='0.0.0.0', port=5010, debug=True)
