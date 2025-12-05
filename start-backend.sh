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
