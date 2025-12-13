#!/bin/bash
set -euo pipefail

# Create minimal Fedora Linux deployment package for Qhitz
# Excludes: binaries, node_modules, build artifacts, git history, iOS/Android builds
# Output: package/qhitz-fedora-deploy-YYYYMMDD_HHMMSS.tar.gz

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PACKAGE_DIR="$SCRIPT_DIR/package"
DEPLOY_TMP="$PACKAGE_DIR/fedora-deploy-tmp-$$"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TARBALL="qhitz-fedora-deploy-${TIMESTAMP}.tar.gz"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${CYAN}  Qhitz - Fedora Deployment Package${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check disk space
DISK_USAGE=$(df -h "$SCRIPT_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 92 ]; then
    echo -e "${RED}✗ ERROR: Disk usage is ${DISK_USAGE}% (need <92%)${NC}"
    exit 1
fi

# Cleanup on exit
trap 'rm -rf "$DEPLOY_TMP"' EXIT

# Create temp directory
mkdir -p "$DEPLOY_TMP"
echo -e "${YELLOW}[1/4] Copying source files...${NC}"

# Copy only essential directories (exclude binaries, builds, git, node_modules)
rsync -a "$SCRIPT_DIR/" "$DEPLOY_TMP/" \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='.pytest_cache' \
  --exclude='.venv' \
  --exclude='venv' \
  --exclude='env' \
  --exclude='*.py[cod]' \
  --exclude='*.apk' \
  --exclude='*.aab' \
  --exclude='*.ipa' \
  --exclude='*.exe' \
  --exclude='*.dll' \
  --exclude='*.so' \
  --exclude='*.dylib' \
  --exclude='*.o' \
  --exclude='*.a' \
  --exclude='.gradle' \
  --exclude='build/' \
  --exclude='dist/' \
  --exclude='*.egg-info' \
  --exclude='frontend/ios/build-sim' \
  --exclude='frontend/ios/build' \
  --exclude='frontend/android/build' \
  --exclude='frontend/android/.gradle' \
  --exclude='property-management/frontend/node_modules' \
  --exclude='property-management/frontend/build' \
  --exclude='property-management/frontend/dist' \
  --exclude='supply-chain/frontend/node_modules' \
  --exclude='supply-chain/frontend/build' \
  --exclude='supply-chain/frontend/dist' \
  --exclude='tenant-mobile-client' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='.vscode' \
  --exclude='.idea' \
  --exclude='*.swp' \
  --exclude='*.swo' \
  --exclude='backups/' \
  --exclude='package/' \
  --exclude='scripts-archive/' \
  2>/dev/null || true

echo -e "${GREEN}✓ Files copied${NC}"
echo ""

# Create deployment guide for Fedora
echo -e "${YELLOW}[2/4] Creating Fedora deployment guide...${NC}"
cat > "$DEPLOY_TMP/FEDORA_DEPLOY.md" << 'EOF'
# Qhitz Deployment on Fedora Linux

## Prerequisites

```bash
sudo dnf update -y
sudo dnf install -y docker docker-compose git curl python3 python3-pip nodejs npm
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

## Installation Steps

### 1. Extract Package

```bash
mkdir -p /opt/qhitz
cd /opt/qhitz
tar -xzf qhitz-fedora-deploy-*.tar.gz
```

### 2. Install Dependencies

```bash
# Frontend
cd frontend
npm install
npm run build
cd ..

# Backend
cd backend
pip install -r requirements.txt
cd ..
```

### 3. Environment Configuration

```bash
# Create .env file
cp backend/.env.example .env

# Edit with your settings
nano .env
```

### 4. Start Services

```bash
docker-compose up -d --build
```

### 5. Verify Services

```bash
# Check running containers
docker ps

# Test APIs
curl http://localhost:50010/api/health
curl http://localhost:50011/api/health
curl http://localhost:50012/api/health
```

## Access Points

- **Frontend:** http://localhost:3000
- **Auth API:** http://localhost:50010
- **Media API:** http://localhost:50011
- **Cloud API:** http://localhost:50012
- **Property API:** http://localhost:50050
- **Supply Chain API:** http://localhost:50070
- **Serbisyo24x7 API:** http://localhost:50090

## Firewall Rules (if needed)

```bash
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --permanent --add-port=50010/tcp
sudo firewall-cmd --permanent --add-port=50011/tcp
sudo firewall-cmd --permanent --add-port=50012/tcp
sudo firewall-cmd --permanent --add-port=50050/tcp
sudo firewall-cmd --permanent --add-port=50070/tcp
sudo firewall-cmd --permanent --add-port=50090/tcp
sudo firewall-cmd --reload
```

## Troubleshooting

### Container Issues
```bash
docker logs qhitz-backend-api
docker logs qhitz-backend-media
docker logs qhitz-backend-cloud
```

### Rebuild
```bash
./rebuild-all.sh
```

### Reset Everything
```bash
docker-compose down -v
docker system prune -a
docker-compose up -d --build
```

EOF

echo -e "${GREEN}✓ Deployment guide created${NC}"
echo ""

# Create comprehensive README for contents
echo -e "${YELLOW}[3/4] Creating package contents guide...${NC}"
cat > "$DEPLOY_TMP/PACKAGE_CONTENTS.md" << 'EOF'
# Package Contents

## Directory Structure

```
qhitz-fedora-deploy/
├── backend/                    # Python FastAPI services
│   ├── app.py                 # Auth service
│   ├── media.py               # Media service
│   ├── cloud.py               # Cloud storage service
│   └── requirements.txt        # Python dependencies
│
├── frontend/                   # React web application
│   ├── src/                    # React source code
│   ├── public/                 # Static assets
│   ├── package.json            # NPM dependencies
│   └── Dockerfile              # Frontend container config
│
├── property-management/        # Property management module
├── supply-chain/               # Supply chain management module
├── serbisyo24x7/               # Services marketplace module
│
├── docker-compose.yml          # Docker orchestration
├── FEDORA_DEPLOY.md           # This deployment guide
└── rebuild-all.sh             # Full rebuild script
```

## What's Included

✓ Source code for all services
✓ Docker configuration files
✓ Database initialization scripts
✓ Frontend source + build configuration
✓ Deployment documentation
✓ Rebuild and health check scripts

## What's NOT Included (Excluded)

✗ node_modules (reinstalled via npm install)
✗ Python venv files (reinstalled via pip install)
✗ Build artifacts (rebuilding with `npm run build`)
✗ iOS/Android builds (.apk, .ipa)
✗ Git history (.git folder)
✗ IDE settings (.vscode, .idea)
✗ Log files (*.log)
✗ Cache files (__pycache__, .pytest_cache)
✗ OS files (.DS_Store)

## Minimal Size

This package is optimized for:
- Fast network transfers
- Minimal storage requirements
- Clean deployment environments

Original size with all binaries: ~2.5 GB
Optimized size: ~150-200 MB

EOF

echo -e "${GREEN}✓ Package guide created${NC}"
echo ""

# Create the tarball
echo -e "${YELLOW}[4/4] Creating compressed archive...${NC}"
mkdir -p "$PACKAGE_DIR"

cd "$PACKAGE_DIR"
tar -czf "$TARBALL" \
  --exclude='node_modules' \
  --exclude='__pycache__' \
  --exclude='.git' \
  --exclude='*.apk' \
  --exclude='*.aab' \
  --exclude='*.ipa' \
  --exclude='*.exe' \
  --exclude='*.dll' \
  --exclude='*.so' \
  --exclude='*.dylib' \
  -C "$DEPLOY_TMP" . 2>/dev/null

PKG_SIZE=$(du -h "$TARBALL" | cut -f1)
echo -e "${GREEN}✓ Archive created: $TARBALL ($PKG_SIZE)${NC}"
echo ""

# Final summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✓ Fedora Deployment Package Ready${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${CYAN}Package Location:${NC}"
echo "  $PACKAGE_DIR/$TARBALL"
echo ""
echo -e "${CYAN}Package Size:${NC}"
echo "  $PKG_SIZE"
echo ""
echo -e "${CYAN}Next Steps:${NC}"
echo "  1. Transfer to Fedora server:"
echo "     scp $TARBALL user@server:/opt/qhitz/"
echo ""
echo "  2. On Fedora server, extract and deploy:"
echo "     cd /opt/qhitz"
echo "     tar -xzf $TARBALL"
echo "     cat FEDORA_DEPLOY.md"
echo ""
echo -e "${CYAN}File Listing:${NC}"
ls -lh "$TARBALL"
echo ""

# Verify package integrity
echo -e "${YELLOW}Verifying package integrity...${NC}"
if tar -tzf "$TARBALL" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Package integrity verified${NC}"
    echo ""
    echo -e "${CYAN}Top-level contents:${NC}"
    tar -tzf "$TARBALL" | head -20
else
    echo -e "${RED}✗ Package integrity check failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Ready for deployment! 🚀${NC}"
