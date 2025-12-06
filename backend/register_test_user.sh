#!/bin/bash
# Script to register a test user via the API
# Usage: ./register_test_user.sh

API_URL="${1:-http://localhost:5010/api}"

echo "Registering test user via API at: $API_URL/auth/register"
echo ""

response=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "qhitz",
    "email": "qhitz@test.com",
    "password": "teng"
  }')

echo "Response:"
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
echo ""

# Try to login to verify
echo "Testing login..."
login_response=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "qhitz@test.com",
    "password": "teng"
  }')

echo "Login Response:"
echo "$login_response" | python3 -m json.tool 2>/dev/null || echo "$login_response"
