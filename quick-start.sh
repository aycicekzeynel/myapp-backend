#!/bin/bash

# ============================================
# MyApp Backend - Quick Start Script
# ============================================

echo "🚀 MyApp Backend Quick Start"
echo "====================================="
echo ""

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Node.js kontrolü
echo -e "${BLUE}📋 1. Node.js kontrolü...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js yüklü: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js bulunamadı! Lütfen Node.js v18+ yükleyin.${NC}"
    exit 1
fi

# 2. MongoDB kontrolü
echo ""
echo -e "${BLUE}📋 2. MongoDB kontrolü...${NC}"
if command -v mongod &> /dev/null; then
    echo -e "${GREEN}✅ MongoDB yüklü${NC}"
    
    # MongoDB servisinin çalışıp çalışmadığını kontrol et
    if pgrep -x "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB zaten çalışıyor${NC}"
    else
        echo -e "${YELLOW}⚠️  MongoDB çalışmıyor, başlatılıyor...${NC}"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            brew services start mongodb-community@7.0
        else
            # Linux
            sudo systemctl start mongod
        fi
        sleep 2
        echo -e "${GREEN}✅ MongoDB başlatıldı${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  MongoDB yüklü değil${NC}"
    echo -e "${BLUE}ℹ️  MongoDB Atlas kullanacaksan .env'deki MONGODB_URI'yi güncelle${NC}"
fi

# 3. node_modules kontrolü
echo ""
echo -e "${BLUE}📋 3. Dependencies kontrolü...${NC}"
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules bulunamadı, yükleniyor...${NC}"
    npm install
    echo -e "${GREEN}✅ Dependencies yüklendi${NC}"
else
    echo -e "${GREEN}✅ node_modules mevcut${NC}"
fi

# 4. .env kontrolü
echo ""
echo -e "${BLUE}📋 4. Environment variables kontrolü...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env dosyası mevcut${NC}"
else
    echo -e "${YELLOW}⚠️  .env dosyası bulunamadı, .env.example'dan kopyalanıyor...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env dosyası oluşturuldu (düzenlemeyi unutma!)${NC}"
fi

# 5. Port kontrolü
echo ""
echo -e "${BLUE}📋 5. Port 5000 kontrolü...${NC}"
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 5000 kullanımda${NC}"
    echo -e "${BLUE}Kullanımdan kaldırmak ister misin? (y/n)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        lsof -ti:5000 | xargs kill -9
        echo -e "${GREEN}✅ Port 5000 temizlendi${NC}"
    fi
else
    echo -e "${GREEN}✅ Port 5000 müsait${NC}"
fi

# 6. Server başlat
echo ""
echo -e "${GREEN}====================================="
echo -e "🎯 Hazırsın! Server başlatılıyor...${NC}"
echo -e "${GREEN}=====================================${NC}"
echo ""
echo -e "${BLUE}ℹ️  Durdurmak için: CTRL+C${NC}"
echo ""

# Development mode ile başlat
if command -v nodemon &> /dev/null; then
    npm run dev
else
    echo -e "${YELLOW}⚠️  nodemon bulunamadı, normal mode ile başlatılıyor...${NC}"
    npm start
fi
