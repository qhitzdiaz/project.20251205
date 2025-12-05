#!/bin/bash
echo "🛑 Stopping services..."
pkill -f "python app.py"
pkill -f "python media_server.py"
pkill -f "python cloud_server.py"
pkill -f "python dental_app.py"
cd backend && docker-compose down
echo "✅ Stopped"
