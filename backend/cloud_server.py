"""
Cloud Storage Server - Port 5012 (changed from 5002)
Document/File Storage with Folders and Sharing
Database: cloud_db
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid
import shutil

app = Flask(__name__)

# ==================== CONFIGURATION ====================

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'CLOUD_DATABASE_URL',
    'postgresql://qhitz_user:devpass123@postgres-cloud:5432/cloud_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB max
app.config['STORAGE_FOLDER'] = '/app/storage'

# CORS Configuration
cors_origin = os.getenv('CORS_ORIGIN', '*')
CORS(app, resources={r"/api/*": {"origins": cors_origin}})

# Database
db = SQLAlchemy(app)

# Create storage directory
os.makedirs(app.config['STORAGE_FOLDER'], exist_ok=True)

# ==================== MODELS ====================

class Folder(db.Model):
    """Folder model for organizing files"""
    __tablename__ = 'folders'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    parent_id = db.Column(db.Integer, db.ForeignKey('folders.id'), nullable=True)
    owner_id = db.Column(db.Integer, nullable=False)  # User ID
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_shared = db.Column(db.Boolean, default=False)
    
    # Relationships
    files = db.relationship('CloudFile', backref='folder', lazy=True, cascade='all, delete-orphan')
    subfolders = db.relationship('Folder', backref=db.backref('parent', remote_side=[id]), lazy=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'parent_id': self.parent_id,
            'owner_id': self.owner_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'is_shared': self.is_shared,
            'file_count': len(self.files),
            'subfolder_count': len(self.subfolders)
        }

class CloudFile(db.Model):
    """Cloud file model"""
    __tablename__ = 'cloud_files'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_extension = db.Column(db.String(10), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)
    file_path = db.Column(db.String(500), nullable=False)
    mime_type = db.Column(db.String(100))
    folder_id = db.Column(db.Integer, db.ForeignKey('folders.id'), nullable=True)
    owner_id = db.Column(db.Integer, nullable=False)  # User ID
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    modified_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    version = db.Column(db.Integer, default=1)
    is_shared = db.Column(db.Boolean, default=False)
    shared_link = db.Column(db.String(100), unique=True, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_extension': self.file_extension,
            'file_size': self.file_size,
            'file_size_mb': round(self.file_size / (1024 * 1024), 2),
            'mime_type': self.mime_type,
            'folder_id': self.folder_id,
            'owner_id': self.owner_id,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'modified_at': self.modified_at.isoformat() if self.modified_at else None,
            'version': self.version,
            'is_shared': self.is_shared,
            'shared_link': self.shared_link,
            'download_url': f'/api/cloud/download/{self.id}'
        }

# ==================== HEALTH CHECK ====================

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Cloud Storage Server',
        'version': '1.0.0',
        'port': 5002,
        'database': 'cloud_db',
        'endpoints': {
            'health': '/api/health',
            'folders': '/api/cloud/folders',
            'upload': '/api/cloud/upload',
            'files': '/api/cloud/files',
            'stats': '/api/cloud/stats'
        }
    }), 200

@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'service': 'Cloud Storage API',
        'version': '1.0.0',
        'endpoints': {
            'folders': {
                'create': 'POST /api/cloud/folders',
                'list': 'GET /api/cloud/folders',
                'get': 'GET /api/cloud/folder/<id>',
                'delete': 'DELETE /api/cloud/folder/<id>'
            },
            'files': {
                'upload': 'POST /api/cloud/upload',
                'list': 'GET /api/cloud/files',
                'download': 'GET /api/cloud/download/<id>',
                'delete': 'DELETE /api/cloud/file/<id>',
                'share': 'POST /api/cloud/share/<id>'
            },
            'stats': 'GET /api/cloud/stats'
        }
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'service': 'cloud-storage',
            'port': 5002,
            'database': 'connected',
            'storage_folder': app.config['STORAGE_FOLDER'],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'cloud-storage',
            'database': 'disconnected',
            'error': str(e)
        }), 500

# ==================== FOLDER ROUTES ====================

@app.route('/api/cloud/folders', methods=['POST'])
def create_folder():
    """Create a new folder"""
    data = request.get_json()
    
    if not data.get('name') or not data.get('owner_id'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    folder = Folder(
        name=data['name'],
        parent_id=data.get('parent_id'),
        owner_id=data['owner_id']
    )
    
    db.session.add(folder)
    db.session.commit()
    
    return jsonify({
        'message': 'Folder created successfully',
        'folder': folder.to_dict()
    }), 201

@app.route('/api/cloud/folders', methods=['GET'])
def get_folders():
    """Get folders for a user"""
    user_id = request.args.get('user_id', type=int)
    parent_id = request.args.get('parent_id', type=int)
    
    if not user_id:
        return jsonify({'message': 'user_id required'}), 400
    
    query = Folder.query.filter_by(owner_id=user_id)
    
    if parent_id:
        query = query.filter_by(parent_id=parent_id)
    elif 'parent_id' in request.args:
        query = query.filter_by(parent_id=None)
    
    folders = query.order_by(Folder.name).all()
    
    return jsonify({
        'folders': [folder.to_dict() for folder in folders]
    }), 200

@app.route('/api/cloud/folder/<int:folder_id>', methods=['GET'])
def get_folder(folder_id):
    """Get folder details"""
    folder = Folder.query.get_or_404(folder_id)
    
    return jsonify({
        'folder': folder.to_dict(),
        'files': [file.to_dict() for file in folder.files],
        'subfolders': [sf.to_dict() for sf in folder.subfolders]
    }), 200

@app.route('/api/cloud/folder/<int:folder_id>', methods=['DELETE'])
def delete_folder(folder_id):
    """Delete a folder and its contents"""
    folder = Folder.query.get_or_404(folder_id)
    
    # Delete all files in folder
    for file in folder.files:
        try:
            os.remove(file.file_path)
        except OSError:
            pass
    
    # Delete folder
    db.session.delete(folder)
    db.session.commit()
    
    return jsonify({'message': 'Folder deleted successfully'}), 200

# ==================== FILE ROUTES ====================

@app.route('/api/cloud/upload', methods=['POST'])
def upload_file():
    """Upload file(s) to cloud storage - supports single or multiple files"""
    # Support both single file and multiple files
    files = request.files.getlist('files') or ([request.files['file']] if 'file' in request.files else [])

    if not files or len(files) == 0:
        return jsonify({'message': 'No files provided'}), 400

    # Get metadata (shared across all files)
    owner_id = request.form.get('owner_id')
    folder_id = request.form.get('folder_id')

    if not owner_id:
        return jsonify({'message': 'owner_id required'}), 400

    # Create user storage directory
    user_storage = os.path.join(app.config['STORAGE_FOLDER'], str(owner_id))
    os.makedirs(user_storage, exist_ok=True)

    # Process each file
    uploaded_files = []
    errors = []

    for idx, file in enumerate(files):
        try:
            if file.filename == '':
                errors.append({'file': f'File {idx + 1}', 'error': 'No filename'})
                continue

            # Generate unique filename
            original_filename = secure_filename(file.filename)
            file_extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}" if file_extension else uuid.uuid4().hex

            # Save file
            file_path = os.path.join(user_storage, unique_filename)
            file.save(file_path)

            # Get file size
            file_size = os.path.getsize(file_path)

            # Create database record
            cloud_file = CloudFile(
                filename=unique_filename,
                original_filename=original_filename,
                file_extension=file_extension,
                file_size=file_size,
                file_path=file_path,
                mime_type=file.content_type,
                folder_id=int(folder_id) if folder_id else None,
                owner_id=int(owner_id)
            )

            db.session.add(cloud_file)
            uploaded_files.append({
                'filename': original_filename,
                'file': cloud_file.to_dict()
            })

        except Exception as e:
            errors.append({'file': file.filename if file else f'File {idx + 1}', 'error': str(e)})

    # Commit all successful uploads
    if uploaded_files:
        db.session.commit()

    success_count = len(uploaded_files)
    total_count = len(files)

    response = {
        'message': f'{success_count} of {total_count} file(s) uploaded successfully',
        'files': [file_data['file'] for file_data in uploaded_files],
        'uploaded_files': [file_data['filename'] for file_data in uploaded_files],
        'success_count': success_count,
        'total_count': total_count
    }

    if errors:
        response['errors'] = errors

    status_code = 201 if success_count > 0 else 400
    return jsonify(response), status_code

@app.route('/api/cloud/files', methods=['GET'])
def get_files():
    """Get files for a user"""
    user_id = request.args.get('user_id', type=int)
    folder_id = request.args.get('folder_id', type=int)
    
    if not user_id:
        return jsonify({'message': 'user_id required'}), 400
    
    query = CloudFile.query.filter_by(owner_id=user_id)
    
    if folder_id:
        query = query.filter_by(folder_id=folder_id)
    elif 'folder_id' in request.args:
        query = query.filter_by(folder_id=None)
    
    files = query.order_by(CloudFile.uploaded_at.desc()).all()
    
    return jsonify({
        'files': [file.to_dict() for file in files]
    }), 200

@app.route('/api/cloud/download/<int:file_id>', methods=['GET'])
def download_file(file_id):
    """Download a file"""
    cloud_file = CloudFile.query.get_or_404(file_id)
    
    directory = os.path.dirname(cloud_file.file_path)
    filename = os.path.basename(cloud_file.file_path)
    
    return send_from_directory(
        directory,
        filename,
        as_attachment=True,
        download_name=cloud_file.original_filename
    )

@app.route('/api/cloud/file/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete a file"""
    cloud_file = CloudFile.query.get_or_404(file_id)
    
    # Delete physical file
    try:
        os.remove(cloud_file.file_path)
    except OSError:
        pass
    
    # Delete database record
    db.session.delete(cloud_file)
    db.session.commit()
    
    return jsonify({'message': 'File deleted successfully'}), 200

@app.route('/api/cloud/share/<int:file_id>', methods=['POST'])
def share_file(file_id):
    """Generate shareable link for a file"""
    cloud_file = CloudFile.query.get_or_404(file_id)
    
    if not cloud_file.shared_link:
        cloud_file.shared_link = uuid.uuid4().hex
        cloud_file.is_shared = True
        db.session.commit()
    
    return jsonify({
        'message': 'File shared successfully',
        'shared_link': cloud_file.shared_link,
        'share_url': f'/api/cloud/shared/{cloud_file.shared_link}'
    }), 200

@app.route('/api/cloud/shared/<string:share_link>', methods=['GET'])
def get_shared_file(share_link):
    """Access file via shared link"""
    cloud_file = CloudFile.query.filter_by(shared_link=share_link, is_shared=True).first_or_404()
    
    directory = os.path.dirname(cloud_file.file_path)
    filename = os.path.basename(cloud_file.file_path)
    
    return send_from_directory(
        directory,
        filename,
        as_attachment=True,
        download_name=cloud_file.original_filename
    )

@app.route('/api/cloud/stats', methods=['GET'])
def get_stats():
    """Get storage statistics"""
    user_id = request.args.get('user_id', type=int)
    
    if not user_id:
        return jsonify({'message': 'user_id required'}), 400
    
    total_files = CloudFile.query.filter_by(owner_id=user_id).count()
    total_folders = Folder.query.filter_by(owner_id=user_id).count()
    total_size = db.session.query(db.func.sum(CloudFile.file_size)).filter_by(owner_id=user_id).scalar() or 0
    
    return jsonify({
        'total_files': total_files,
        'total_folders': total_folders,
        'total_size': total_size,
        'total_size_mb': round(total_size / (1024 * 1024), 2),
        'total_size_gb': round(total_size / (1024 * 1024 * 1024), 2)
    }), 200

# ==================== INITIALIZE DATABASE ====================

def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Cloud storage database tables created")

if __name__ == '__main__':
    print("🚀 Starting Cloud Storage Server...")
    print(f"📊 Database: cloud_db")
    print(f"📁 Storage folder: {app.config['STORAGE_FOLDER']}")
    print(f"🔗 Features: folders, sharing, versioning")
    print(f"🌐 Port: 5002")
    
    # Initialize database tables
    create_tables()
    
    app.run(host='0.0.0.0', port=5012, debug=True)
