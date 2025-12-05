#!/bin/bash
# Qhitz Development Environment Setup for macOS
# Version: 2.0.0
# Assumes: Docker Desktop, Homebrew, and Docker Compose already installed

set -e

echo "🍎 Qhitz Development Setup for macOS"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_info() { echo "ℹ️  $1"; }

# Verify prerequisites
echo "🔍 Verifying prerequisites..."
if ! command -v docker &> /dev/null; then
    print_error "Docker not found. Please install Docker Desktop for Mac."
    exit 1
fi
print_success "Docker found"

if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi
print_success "Docker is running"

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose not found. Please install docker-compose."
    exit 1
fi
print_success "Docker Compose found"

# Check Node.js (install if missing)
if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Installing via Homebrew..."
    brew install node@18
    print_success "Node.js installed"
else
    print_success "Node.js found ($(node -v))"
fi

# Check Python (install if missing)
if ! command -v python3 &> /dev/null; then
    print_warning "Python 3 not found. Installing via Homebrew..."
    brew install python@3.11
    print_success "Python installed"
else
    print_success "Python found ($(python3 --version))"
fi

# Setup Backend
echo ""
echo "🔧 Setting up Backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    print_info "Creating Python virtual environment..."
    python3 -m venv venv
fi
print_success "Virtual environment ready"

# Activate and install dependencies
print_info "Installing Python dependencies..."
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
print_success "Backend dependencies installed"

# Create .env file
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=dev_secret_key
POSTGRES_USER=qhitz_user
POSTGRES_PASSWORD=devpass123
POSTGRES_HOST=localhost
CORS_ORIGINS=http://localhost:3000
UPLOAD_FOLDER=./uploads
EOF
    print_success ".env file created"
fi

cd ..

# Setup Frontend
echo ""
echo "⚛️  Setting up Frontend..."
cd frontend

print_info "Installing Node.js dependencies..."
npm install -q
print_success "Frontend dependencies installed"

if [ ! -f ".env.development" ]; then
    cat > .env.development << 'EOF'
REACT_APP_AUTH_API_URL=http://localhost:5000/api
REACT_APP_MEDIA_API_URL=http://localhost:5001/api
REACT_APP_CLOUD_API_URL=http://localhost:5002/api
REACT_APP_DENTAL_API_URL=http://localhost:5003/api
EOF
    print_success ".env.development created"
fi

cd ..

# Start Docker containers
echo ""
echo "🐳 Starting Docker containers..."
cd backend
docker-compose up -d
print_info "Waiting for databases..."
sleep 10
print_success "Databases ready"
cd ..

# Create convenience scripts
echo ""
echo "📝 Creating convenience scripts..."

cat > start-backend.sh << 'EOF'
#!/bin/bash
cd backend
docker-compose up -d
sleep 3
source venv/bin/activate
mkdir -p ../logs

echo "🚀 Starting Backend Services..."
python app.py > ../logs/auth.log 2>&1 &
python media_server.py > ../logs/media.log 2>&1 &
python cloud_server.py > ../logs/cloud.log 2>&1 &
python dental_app.py > ../logs/dental.log 2>&1 &

sleep 2
echo ""
echo "✅ Backend services started!"
echo "   Auth:   http://localhost:5000"
echo "   Media:  http://localhost:5001"
echo "   Cloud:  http://localhost:5002"
echo "   Dental: http://localhost:5003"
EOF

cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "⚛️  Starting Frontend..."
cd frontend
npm start
EOF

cat > stop-all.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping services..."
pkill -f "python app.py"
pkill -f "python media_server.py"
pkill -f "python cloud_server.py"
pkill -f "python dental_app.py"
cd backend && docker-compose down
echo "✅ Stopped"
EOF

cat > status.sh << 'EOF'
#!/bin/bash
echo "📊 Services Status:"
lsof -i :5000 -i :5001 -i :5002 -i :5003 -i :3000 | grep LISTEN || echo "No services running"
echo ""
cd backend && docker-compose ps
EOF

chmod +x start-backend.sh start-frontend.sh stop-all.sh status.sh
mkdir -p logs
print_success "Scripts created"

# Summary
echo ""
echo "=============================================="
echo "🎉 Setup Complete!"
echo "=============================================="
echo ""
echo "🚀 Quick Start:"
echo "   ./start-backend.sh    # Start backend"
echo "   ./start-frontend.sh   # Start frontend (new terminal)"
echo "   ./stop-all.sh         # Stop everything"
echo "   ./status.sh           # Check status"
echo ""
echo "🌐 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000-5003"
echo ""
print_success "Ready to develop! 🎊"
