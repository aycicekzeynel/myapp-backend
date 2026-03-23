# 🚀 Backend Başlatma Rehberi

## ✅ Ön Gereksinimler

1. **Node.js** (v18 veya üzeri)
   ```bash
   node --version
   ```

2. **MongoDB** 
   - Seçenek 1: Local MongoDB (önerilen development için)
   - Seçenek 2: MongoDB Atlas (cloud)

3. **npm** veya **yarn**

---

## 📦 1. Kurulum

### Bağımlılıkları Yükle
```bash
cd /Users/zeynelaycicek/projects/myapp-backend
npm install
```

### Alternatif (cache temizleme gerekirse)
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🗄️ 2. MongoDB Kurulumu

### Option A: Local MongoDB (Önerilen)

**macOS Kurulumu:**
```bash
# Homebrew ile MongoDB yükle
brew tap mongodb/brew
brew install mongodb-community@7.0

# MongoDB'yi başlat
brew services start mongodb-community@7.0

# Durumu kontrol et
brew services list
```

**MongoDB'nin çalıştığını test et:**
```bash
mongosh
# MongoDB shell açılıyorsa başarılı
# Çıkmak için: exit
```

### Option B: MongoDB Atlas (Cloud)

1. https://www.mongodb.com/cloud/atlas adresine git
2. Free tier hesap oluştur
3. Cluster oluştur
4. Database User oluştur
5. Network Access'e kendi IP'ni ekle (0.0.0.0/0 tüm IP'lere açar)
6. Connection string'i kopyala
7. `.env` dosyasındaki `MONGODB_URI`'yi güncelle:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myapp?retryWrites=true&w=majority
   ```

---

## ⚙️ 3. Environment Variables

`.env` dosyası zaten oluşturuldu. Gerekirse düzenle:

```bash
nano .env
```

**Minimum Gereksinimler:**
- `MONGODB_URI` - Database bağlantı string'i
- `JWT_SECRET` - JWT token için secret key
- `PORT` - Server portu (default: 5000)

---

## 🎯 4. Sunucuyu Başlat

### Development Mode (Auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

---

## ✅ 5. Test Etme

### Health Check
```bash
curl http://localhost:5000/health
```

**Beklenen Çıktı:**
```json
{
  "success": true,
  "message": "Server is running",
  "status": {
    "server": "online",
    "database": "connected",
    "timestamp": "2024-03-19T..."
  }
}
```

### Test Endpoint
```bash
curl http://localhost:5000/api/test
```

### Register Test
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "username": "testuser",
    "fullName": "Test User"
  }'
```

### Login Test
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

---

## 🔧 Sorun Giderme

### Hata: `Cannot find module 'bcrypt'`
```bash
npm install bcrypt bcryptjs --save
```

### Hata: `ECONNREFUSED MongoDB`
```bash
# MongoDB'nin çalıştığından emin ol
brew services restart mongodb-community@7.0

# Veya manuel başlat
mongod --config /usr/local/etc/mongod.conf
```

### Hata: `Port 5000 already in use`
```bash
# Portu kullanan process'i bul ve öldür
lsof -ti:5000 | xargs kill -9

# Veya .env'de PORT değiştir
PORT=5001
```

### Hata: `JWT_SECRET is not defined`
```bash
# .env dosyasında JWT_SECRET'in tanımlı olduğundan emin ol
cat .env | grep JWT_SECRET
```

---

## 📊 Başarılı Başlatma Çıktısı

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

## 📁 Proje Yapısı

```
myapp-backend/
├── config/           # Konfigürasyon dosyaları
│   ├── constants.js
│   └── database.js
├── controllers/      # Business logic
│   └── authController.js
├── middleware/       # Express middleware'ler
│   ├── auth.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── requestLogger.js
├── models/          # Mongoose modelleri
│   ├── User.js
│   ├── OTP.js
│   └── RefreshToken.js
├── routes/          # API route tanımları
│   └── auth.js
├── utils/           # Yardımcı fonksiyonlar
│   ├── helpers.js
│   ├── validators.js
│   └── sms.js
├── .env            # Environment variables
├── .env.example    # Environment template
├── server.js       # Ana server dosyası
└── package.json    # NPM dependencies
```

---

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Yeni kullanıcı kaydı
- `POST /api/auth/login` - Email/şifre ile giriş
- `POST /api/auth/phone/send-otp` - Telefon OTP gönder
- `POST /api/auth/phone/verify-otp` - Telefon OTP doğrula
- `POST /api/auth/google` - Google OAuth
- `POST /api/auth/refresh` - Access token yenile
- `POST /api/auth/logout` - Çıkış yap

### Health & Test
- `GET /health` - Sunucu durumu
- `GET /api/test` - API test endpoint

---

## 🌍 Production Deployment

### Railway Deploy
```bash
# Railway CLI yükle
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Environment Variables (Production)
Production'da mutlaka değiştir:
- `JWT_SECRET` - Güçlü random key
- `JWT_REFRESH_SECRET` - Güçlü random key
- `MONGODB_URI` - MongoDB Atlas URI
- `NODE_ENV=production`

---

## 📞 Yardım

Sorun yaşarsan:
1. Terminal çıktısını kontrol et
2. MongoDB'nin çalıştığından emin ol
3. .env dosyasını kontrol et
4. node_modules'i sil ve `npm install` yap

---

**✅ Hazırsın! Backend API çalışıyor.**
