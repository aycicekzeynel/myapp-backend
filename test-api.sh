#!/bin/bash

# 🧪 City Explore Backend API Test Script
# Bu script temel API endpoint'lerini test eder

BASE_URL="http://localhost:5000"

echo "╔════════════════════════════════════════╗"
echo "║   🧪 API Test Script Started           ║"
echo "╚════════════════════════════════════════╝"
echo ""

# 1. Health Check
echo "1️⃣  Testing Health Check..."
curl -s -X GET "$BASE_URL/health" | jq '.'
echo ""
echo "✅ Health check tamamlandı"
echo ""

# 2. Register Test
echo "2️⃣  Testing Register..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "username": "testuser",
    "password": "123456"
  }')

echo "$REGISTER_RESPONSE" | jq '.'

# Access token'ı al
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.tokens.accessToken')
echo ""
echo "✅ Register tamamlandı"
echo "🔑 Access Token: $ACCESS_TOKEN"
echo ""

# 3. Login Test
echo "3️⃣  Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }')

echo "$LOGIN_RESPONSE" | jq '.'
echo ""
echo "✅ Login tamamlandı"
echo ""

# 4. Get Current User (Protected)
if [ ! -z "$ACCESS_TOKEN" ]; then
  echo "4️⃣  Testing Get Current User (Protected)..."
  curl -s -X GET "$BASE_URL/api/auth/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | jq '.'
  echo ""
  echo "✅ Get current user tamamlandı"
  echo ""
else
  echo "⚠️  Access token bulunamadı, protected endpoint test edilemedi"
  echo ""
fi

# 5. Google OAuth Test (Dummy)
echo "5️⃣  Testing Google OAuth..."
curl -s -X POST "$BASE_URL/api/auth/google" \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "1234567890",
    "email": "googleuser@gmail.com",
    "name": "Google User",
    "avatar": "https://example.com/avatar.jpg"
  }' | jq '.'
echo ""
echo "✅ Google OAuth tamamlandı"
echo ""

# 6. Refresh Token Test
if [ ! -z "$ACCESS_TOKEN" ]; then
  REFRESH_TOKEN=$(echo "$REGISTER_RESPONSE" | jq -r '.data.tokens.refreshToken')
  
  echo "6️⃣  Testing Refresh Token..."
  curl -s -X POST "$BASE_URL/api/auth/refresh-token" \
    -H "Content-Type: application/json" \
    -d "{\"refreshToken\": \"$REFRESH_TOKEN\"}" | jq '.'
  echo ""
  echo "✅ Refresh token tamamlandı"
  echo ""
fi

# 7. 404 Test
echo "7️⃣  Testing 404 Not Found..."
curl -s -X GET "$BASE_URL/api/nonexistent" | jq '.'
echo ""
echo "✅ 404 test tamamlandı"
echo ""

echo "╔════════════════════════════════════════╗"
echo "║   ✅ All Tests Completed               ║"
echo "╚════════════════════════════════════════╝"
