"""
Media Server - Port 5011 (changed from 5001)
Image/Video/File Upload and Management
Database: media_db
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid
from music_metadata import MusicMetadataService

app = Flask(__name__)

# ==================== CONFIGURATION ====================

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'MEDIA_DATABASE_URL',
    'postgresql://qhitz_user:devpass123@postgres-media:5432/media_db'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max
app.config['UPLOAD_FOLDER'] = '/app/uploads'

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    'images': {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'},
    'videos': {'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'},
    'documents': {'pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'},
    'audio': {'mp3', 'wav', 'ogg', 'flac'}
}

# CORS Configuration
cors_origin = os.getenv('CORS_ORIGIN', '*')
CORS(app, resources={r"/api/*": {"origins": cors_origin}})

# Database
db = SQLAlchemy(app)

# Create upload directory
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# ==================== MODELS ====================

class MediaFile(db.Model):
    """Media file model"""
    __tablename__ = 'media_files'
    
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    original_filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)  # image, video, document, audio
    file_extension = db.Column(db.String(10), nullable=False)
    file_size = db.Column(db.Integer, nullable=False)  # Size in bytes
    file_path = db.Column(db.String(500), nullable=False)
    mime_type = db.Column(db.String(100))
    uploaded_by = db.Column(db.Integer)  # User ID from auth service
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    description = db.Column(db.Text)
    tags = db.Column(db.String(500))
    is_public = db.Column(db.Boolean, default=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'filename': self.filename,
            'original_filename': self.original_filename,
            'file_type': self.file_type,
            'file_extension': self.file_extension,
            'file_size': self.file_size,
            'mime_type': self.mime_type,
            'uploaded_by': self.uploaded_by,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None,
            'description': self.description,
            'tags': self.tags.split(',') if self.tags else [],
            'is_public': self.is_public,
            'download_url': f'/api/media/download/{self.id}'
        }

# ==================== HELPER FUNCTIONS ====================

def allowed_file(filename):
    """Check if file extension is allowed"""
    if '.' not in filename:
        return False, None
    
    ext = filename.rsplit('.', 1)[1].lower()
    
    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return True, file_type
    
    return False, None

def get_file_type(extension):
    """Get file type from extension"""
    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if extension in extensions:
            return file_type
    return 'other'

# ==================== HEALTH CHECK ====================

@app.route('/', methods=['GET'])
def index():
    """Root endpoint"""
    return jsonify({
        'service': 'Media Server',
        'version': '1.0.0',
        'port': 5001,
        'database': 'media_db',
        'endpoints': {
            'health': '/api/health',
            'upload': '/api/media/upload',
            'files': '/api/media/files',
            'stats': '/api/media/stats'
        }
    }), 200

@app.route('/api', methods=['GET'])
def api_info():
    """API information endpoint"""
    return jsonify({
        'service': 'Media Server API',
        'version': '1.0.0',
        'endpoints': {
            'upload': 'POST /api/media/upload',
            'files': 'GET /api/media/files',
            'file': 'GET /api/media/file/<id>',
            'download': 'GET /api/media/download/<id>',
            'delete': 'DELETE /api/media/file/<id>',
            'stats': 'GET /api/media/stats'
        }
    }), 200

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        db.session.execute(db.text('SELECT 1'))
        return jsonify({
            'status': 'healthy',
            'service': 'media-server',
            'port': 5001,
            'database': 'connected',
            'upload_folder': app.config['UPLOAD_FOLDER'],
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    except Exception as e:
        return jsonify({
            'status': 'unhealthy',
            'service': 'media-server',
            'database': 'disconnected',
            'error': str(e)
        }), 500

# ==================== MEDIA ROUTES ====================

@app.route('/api/media/upload', methods=['POST'])
def upload_file():
    """Upload media file(s) - supports single or multiple files"""
    # Support both single file and multiple files
    files = request.files.getlist('files') or ([request.files['file']] if 'file' in request.files else [])

    if not files or len(files) == 0:
        return jsonify({'message': 'No files provided'}), 400

    # Get additional metadata from form (shared across all files)
    description = request.form.get('description', '')
    tags = request.form.get('tags', '')
    is_public = request.form.get('is_public', 'false').lower() == 'true'
    uploaded_by = request.form.get('user_id')

    # Process each file
    uploaded_files = []
    errors = []

    for idx, file in enumerate(files):
        try:
            if file.filename == '':
                errors.append({'file': f'File {idx + 1}', 'error': 'No filename'})
                continue

            is_allowed, file_type = allowed_file(file.filename)
            if not is_allowed:
                errors.append({'file': file.filename, 'error': 'File type not allowed'})
                continue

            # Generate unique filename
            original_filename = secure_filename(file.filename)
            file_extension = original_filename.rsplit('.', 1)[1].lower()
            unique_filename = f"{uuid.uuid4().hex}.{file_extension}"

            # Save file
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
            file.save(file_path)

            # Get file size
            file_size = os.path.getsize(file_path)

            # Create database record
            media_file = MediaFile(
                filename=unique_filename,
                original_filename=original_filename,
                file_type=file_type,
                file_extension=file_extension,
                file_size=file_size,
                file_path=file_path,
                mime_type=file.content_type,
                uploaded_by=int(uploaded_by) if uploaded_by else None,
                description=description,
                tags=tags,
                is_public=is_public
            )

            db.session.add(media_file)
            uploaded_files.append({
                'filename': original_filename,
                'file': media_file.to_dict()
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

@app.route('/api/media/files', methods=['GET'])
def get_files():
    """Get all media files"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    file_type = request.args.get('type')
    user_id = request.args.get('user_id', type=int)
    
    query = MediaFile.query
    
    if file_type:
        query = query.filter_by(file_type=file_type)
    
    if user_id:
        query = query.filter_by(uploaded_by=user_id)
    
    query = query.order_by(MediaFile.uploaded_at.desc())
    
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'files': [file.to_dict() for file in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'pages': pagination.pages
    }), 200

@app.route('/api/media/file/<int:file_id>', methods=['GET'])
def get_file(file_id):
    """Get file details"""
    media_file = MediaFile.query.get_or_404(file_id)
    return jsonify(media_file.to_dict()), 200

@app.route('/api/media/download/<int:file_id>', methods=['GET'])
def download_file(file_id):
    """Stream or download a file"""
    media_file = MediaFile.query.get_or_404(file_id)

    # Determine MIME type based on file extension
    mime_types = {
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'flac': 'audio/flac',
        'wav': 'audio/wav',
        'ogg': 'audio/ogg',
        'webm': 'video/webm',
        'avi': 'video/x-msvideo',
        'mkv': 'video/x-matroska',
        'm4a': 'audio/mp4',
        'aac': 'audio/aac'
    }

    # Remove leading dot if present
    ext = media_file.file_extension.lower().lstrip('.')
    mime_type = mime_types.get(ext, 'application/octet-stream')

    # Stream for playback (not as attachment)
    return send_from_directory(
        app.config['UPLOAD_FOLDER'],
        media_file.filename,
        mimetype=mime_type,
        as_attachment=False
    )

@app.route('/api/media/file/<int:file_id>', methods=['DELETE'])
def delete_file(file_id):
    """Delete a file"""
    media_file = MediaFile.query.get_or_404(file_id)
    
    # Delete physical file
    try:
        os.remove(media_file.file_path)
    except OSError:
        pass
    
    # Delete database record
    db.session.delete(media_file)
    db.session.commit()
    
    return jsonify({'message': 'File deleted successfully'}), 200

@app.route('/api/media/stats', methods=['GET'])
def get_stats():
    """Get media statistics"""
    total_files = MediaFile.query.count()
    total_size = db.session.query(db.func.sum(MediaFile.file_size)).scalar() or 0
    
    stats_by_type = {}
    for file_type in ['images', 'videos', 'documents', 'audio']:
        count = MediaFile.query.filter_by(file_type=file_type).count()
        size = db.session.query(db.func.sum(MediaFile.file_size)).filter_by(file_type=file_type).scalar() or 0
        stats_by_type[file_type] = {
            'count': count,
            'size': size,
            'size_mb': round(size / (1024 * 1024), 2)
        }
    
    return jsonify({
        'total_files': total_files,
        'total_size': total_size,
        'total_size_mb': round(total_size / (1024 * 1024), 2),
        'stats_by_type': stats_by_type
    }), 200

@app.route('/api/media/videos', methods=['GET'])
def get_videos():
    """Get all video files"""
    try:
        videos = MediaFile.query.filter_by(file_type='videos').order_by(MediaFile.uploaded_at.desc()).all()
        return jsonify({
            'videos': [{
                'id': v.id,
                'title': v.original_filename.rsplit('.', 1)[0],
                'filename': v.original_filename,
                'format': v.file_extension.upper(),
                'url': f'/media/download/{v.id}',
                'size': v.file_size,
                'uploaded_at': v.uploaded_at.isoformat() if v.uploaded_at else None
            } for v in videos]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/media/music', methods=['GET'])
def get_music():
    """Get all audio/music files"""
    try:
        music = MediaFile.query.filter_by(file_type='audio').order_by(MediaFile.uploaded_at.desc()).all()
        return jsonify({
            'music': [{
                'id': m.id,
                'title': m.original_filename.rsplit('.', 1)[0],
                'artist': m.description or 'Unknown Artist',
                'album': m.tags or 'Unknown Album',
                'filename': m.original_filename,
                'format': m.file_extension.upper(),
                'url': f'/media/download/{m.id}',
                'size': m.file_size,
                'uploaded_at': m.uploaded_at.isoformat() if m.uploaded_at else None
            } for m in music]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/media/album-art', methods=['GET'])
def get_album_artwork():
    """Fetch album artwork from online sources"""
    try:
        artist = request.args.get('artist', '')
        album = request.args.get('album', '')
        track = request.args.get('track', '')

        if not artist or not album:
            return jsonify({'error': 'Artist and album are required'}), 400

        metadata = MusicMetadataService.get_album_artwork(artist, album, track)

        if metadata:
            return jsonify(metadata), 200
        else:
            return jsonify({'error': 'Album artwork not found'}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== INITIALIZE DATABASE ====================

def create_tables():
    """Create database tables"""
    with app.app_context():
        db.create_all()
        print("✅ Media database tables created")

if __name__ == '__main__':
    print("🚀 Starting Media Server...")
    print(f"📊 Database: media_db")
    print(f"📁 Upload folder: {app.config['UPLOAD_FOLDER']}")
    print(f"📷 Allowed types: images, videos, documents, audio")
    print(f"🌐 Port: 5001")
    
    # Initialize database tables
    create_tables()
    
    app.run(host='0.0.0.0', port=5011, debug=True)
