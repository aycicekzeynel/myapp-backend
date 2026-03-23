# 🚀 HIZLI ÇALIŞTIRMA TALİMATI

## ⚡ TEK KOMUTLA BAŞLAT

```bash
cd /Users/zeynelaycicek/projects/myapp-backend
chmod +x quick-start.sh
./quick-start.sh
```

---

## 📋 ADIM ADIM (Manuel)

### 1. Dependencies Yükle
```bash
cd /Users/zeynelaycicek/projects/myapp-backend
npm install
```

### 2. MongoDB'yi Başlat (Local)
```bash
# macOS
brew services start mongodb-community@7.0

# MongoDB'nin çalıştığını kontrol et
mongosh
# Çalışıyorsa 'exit' yazıp çık
```

**MongoDB yoksa:**
```bash
# macOS Kurulum
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

**MongoDB yerine Atlas kullanacaksan:**
- `.env` dosyasındaki `MONGODB_URI`'yi MongoDB Atlas connection string ile değiştir

### 3. Server'ı Başlat
```bash
# Development mode (auto-reload)
npm run dev

# Veya normal mode
npm start
```

### 4. Test Et
Yeni terminal aç:
```bash
cd /Users/zeynelaycicek/projects/myapp-backend
chmod +x test-api.sh
./test-api.sh
```

Veya manuel:
```bash
# Health check
curl http://localhost:5000/health

# Register test
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","username":"testuser","fullName":"Test User"}'
```

---

## ✅ BAŞARILI ÇIKTI

```
🔗 MongoDB'ye bağlanıldı: myapp
✅ Database bağlantısı başarılı

╔════════════════════════════════════════╗
║     🚀 Server Started Successfully     ║
╠════════════════════════════════════════╣
║ Environment: development               ║
║ Host: http://0.0.0.0:5000              ║
║ WebSocket: ws://0.0.0.0:5000           ║
╚════════════════════════════════════════╝
```

---

## 🔧 SORUN GİDERME

### Hata: Cannot find module
```bash
rm -rf node_modules package-lock.json
npm install
```

### Hata: MongoDB connection refused
```bash
# MongoDB'yi yeniden başlat
brew services restart mongodb-community@7.0

# Veya Manuel
mongod --config /usr/local/etc/mongod.conf
```

### Hata: Port 5000 kullanımda
```bash
# Portu temizle
lsof -ti:5000 | xargs kill -9

# Veya .env'de farklı port kullan
PORT=5001
```

### Hata: bcrypt hatası
```bash
npm rebuild bcrypt
# Veya
npm uninstall bcrypt && npm install bcrypt
```

---

## 🌐 ENDPOINTS

Sunucu çalıştıktan sonra:

- **Health Check:** http://localhost:5000/health
- **API Test:** http://localhost:5000/api/test
- **Register:** POST http://localhost:5000/api/auth/register
- **Login:** POST http://localhost:5000/api/auth/login

---

## 📱 MOBİL UYGULAMADAN BAĞLANMAK İÇİN

`.env` dosyasında:
```env
HOST=0.0.0.0
CORS_ORIGIN=http://localhost:3000,http://localhost:19006,http://localhost:8081
```

Mobil uygulamada (Expo):
```typescript
const API_URL = 'http://YOUR_LOCAL_IP:5000';
// Örnek: http://192.168.1.10:5000
```

Local IP'ni bul:
```bash
# macOS/Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# Windows
ipconfig
```

---

**🎯 Artık hazırsın! Backend API çalışıyor.**

Detaylı dökümantasyon için:
- [README.md](./README.md)
- [START_GUIDE.md](./START_GUIDE.md)
