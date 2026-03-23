#!/bin/bash

# ============================================
# MyApp Backend - API Test Script
# ============================================

BASE_URL="http://localhost:5000"

echo "🧪 MyApp Backend API Test Suite"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ============================================
# 1. Health Check
# ============================================
echo -e "${YELLOW}1️⃣  Health Check${NC}"
echo "GET $BASE_URL/health"
echo ""

curl -s -X GET "$BASE_URL/health" | json_pp
echo ""
echo "---"
echo ""

# ============================================
# 2. Test Route
# ============================================
echo -e "${YELLOW}2️⃣  Test Route${NC}"
echo "GET $BASE_URL/api/test"
echo ""

curl -s -X GET "$BASE_URL/api/test" | json_pp
echo ""
echo "---"
echo ""

# ============================================
# 3. Register User
# ============================================
echo -e "${YELLOW}3️⃣  Register New User${NC}"
echo "POST $BASE_URL/api/auth/register"
echo ""

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@myapp.com",
    "password": "Test123456",
    "fullName": "Test User",
    "username": "testuser123"
  }')

echo "$REGISTER_RESPONSE" | json_pp
echo ""

# Token'ı kaydet
ACCESS_TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ -z "$ACCESS_TOKEN" ]; then
  echo -e "${RED}❌ Token alınamadı - kayıt başarısız olabilir${NC}"
else
  echo -e "${GREEN}✅ Access Token alındı${NC}"
fi

echo ""
echo "---"
echo ""

# ============================================
# 4. Login
# ============================================
echo -e "${YELLOW}4️⃣  Login${NC}"
echo "POST $BASE_URL/api/auth/login"
echo ""

LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@myapp.com",
    "password": "Test123456"
  }')

echo "$LOGIN_RESPONSE" | json_pp
echo ""

# Token'ı güncelle
NEW_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*' | sed 's/"accessToken":"//')

if [ ! -z "$NEW_TOKEN" ]; then
  ACCESS_TOKEN=$NEW_TOKEN
  echo -e "${GREEN}✅ Login başarılı - Token güncellendi${NC}"
fi

echo ""
echo "---"
echo ""

# ============================================
# 5. Test Authentication (Yakında)
# ============================================
echo -e "${YELLOW}5️⃣  Protected Route Test (Yakında)${NC}"
echo "GET $BASE_URL/api/users/me"
echo ""

if [ ! -z "$ACCESS_TOKEN" ]; then
  curl -s -X GET "$BASE_URL/api/users/me" \
    -H "Authorization: Bearer $ACCESS_TOKEN" | json_pp || echo "Endpoint henüz eklenmedi"
else
  echo -e "${RED}❌ Token yok - protected route test edilemiyor${NC}"
fi

echo ""
echo "---"
echo ""

# ============================================
# 6. Test Invalid Login
# ============================================
echo -e "${YELLOW}6️⃣  Invalid Login (Error Handling Test)${NC}"
echo "POST $BASE_URL/api/auth/login"
echo ""

curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@email.com",
    "password": "wrongpassword"
  }' | json_pp

echo ""
echo "---"
echo ""

# ============================================
# Summary
# ============================================
echo ""
echo "================================"
echo -e "${GREEN}✅ Test suite tamamlandı${NC}"
echo ""
echo "💡 Not: Bazı endpoint'ler henüz eklenmedi"
echo ""
echo "📝 Saved Token:"
echo "$ACCESS_TOKEN"
echo ""
echo "🔧 Bu token'ı test etmek için:"
echo "curl -H 'Authorization: Bearer $ACCESS_TOKEN' http://localhost:5000/api/users/me"
echo ""
