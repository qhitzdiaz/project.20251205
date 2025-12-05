#!/bin/bash
echo "📊 Services Status:"
lsof -i :5000 -i :5001 -i :5002 -i :5003 -i :3000 | grep LISTEN || echo "No services running"
echo ""
cd backend && docker-compose ps
