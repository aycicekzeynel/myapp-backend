# 🚀 Server Başlatma Rehberi

## ⚡ Hızlı Başlangıç

### 1️⃣ MongoDB Atlas Kurulumu (Tek Sefer)

Eğer henüz MongoDB Atlas connection string eklemediysen:

📖 **Detaylı talimatlar:** `MONGODB_ATLAS_SETUP.md` dosyasına bak

**Özet:**
1. https://mongodb.com/cloud/atlas/register → Hesap oluştur
2. Free cluster oluştur (M0)
3. Database user oluştur
4. Network Access → `0.0.0.0/0` ekle
5. Connection string kopyala
6. `.env` dosyasına yapıştır:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/myapp?retryWrites=true&w=majority
```

---

### 2️⃣ Server'ı Başlat

```bash
cd /Users/zeynelaycicek/projects/myapp-backend
node server.js
```

**Beklenen çıktı:**
```
✅ MongoDB bağlantısı başarılı!

╔════════════════════════════════════════╗
║     🚀 Server Started Successfully     ║
╠════════════════════════════════════════╣
║ Environment: development               ║
║ Host: http://0.0.0.0:5000              ║
║ WebSocket: ws://0.0.0.0:5000           ║
╚════════════════════════════════════════╝
```

---

## 🧪 Server Test Et

### Health Check
```bash
curl http://localhost:5000/health
```

**Başarılı cevap:**
```json
{
  "success": true,
  "message": "Server is running",
  "status": {
    "server": "online",
    "database": "connected",
    "timestamp": "2024-03-19T10:30:00.000Z"
  },
  "version": "1.0.0"
}
```

---

### Test Route
```bash
curl http://localhost:5000/api/test
```

---

### Auth Endpoint Test

#### 1. Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "fullName": "Test User",
    "username": "testuser"
  }'
```

#### 2. Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

---

## 🛠️ Development Mode

Değişikliklerde otomatik yeniden başlatma için **nodemon** kullan:

```bash
npm run dev
```

---

## 🐛 Sorun Giderme

### ❌ MongoDB bağlanamıyor
```
MongooseError: Authentication failed
```

**Çözüm:**
1. `.env` dosyasındaki `MONGODB_URI` kontrol et
2. Şifrede özel karakter varsa URL encode et
3. MongoDB Atlas → Network Access → `0.0.0.0/0` ekli mi kontrol et

---

### ❌ Port zaten kullanımda
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Çözüm:**
```bash
# Port 5000'i kullanan process'i bul
lsof -ti:5000

# Process'i kapat
kill -9 $(lsof -ti:5000)

# Server'ı tekrar başlat
node server.js
```

---

### ❌ Module bulunamıyor
```
Error: Cannot find module 'express'
```

**Çözüm:**
```bash
# Tüm dependencies yükle
npm install
```

---

## 📡 API Endpoints

### Auth Endpoints
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Email/şifre ile giriş
- `POST /api/auth/phone-login` - Telefon ile giriş (OTP)
- `POST /api/auth/google` - Google OAuth giriş
- `POST /api/auth/refresh-token` - Token yenile
- `POST /api/auth/logout` - Çıkış yap

### User Endpoints (Coming Soon)
- `GET /api/users/me` - Profil bilgisi
- `PUT /api/users/me` - Profil güncelle
- `POST /api/users/avatar` - Avatar yükle

### Venue Endpoints (Coming Soon)
- `GET /api/venues` - Mekanları listele
- `GET /api/venues/:id` - Mekan detayı
- `POST /api/venues` - Yeni mekan ekle

### Check-in Endpoints (Coming Soon)
- `POST /api/checkins` - Check-in yap
- `GET /api/checkins/user/:userId` - Kullanıcı check-in'leri
- `GET /api/checkins/venue/:venueId` - Mekan check-in'leri

---

## 🔄 Git Workflow

### Değişiklikleri kaydet
```bash
git add .
git commit -m "feat: new feature added"
git push origin main
```

---

## 🚢 Railway Deploy (Production)

```bash
# Railway CLI kur
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

**Railway environment variables ekle:**
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Production secret
- `NODE_ENV` - production

---

## 📚 Faydalı Komutlar

```bash
# Package yükle
npm install <package-name>

# Dev dependency yükle
npm install -D <package-name>

# Tüm packages güncelle
npm update

# Güvenlik açığı kontrolü
npm audit

# Güvenlik açıklarını düzelt
npm audit fix

# Test çalıştır (yakında)
npm test

# Linter çalıştır (yakında)
npm run lint
```

---

**Son Güncelleme:** 2024-03-19  
**Backend Durum:** ✅ Çalışıyor  
**Database:** MongoDB Atlas
