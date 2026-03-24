# 🚀 Quick Start Guide

## 📋 Ön Koşullar

- Node.js >= 18.0.0
- npm >= 9.0.0
- MongoDB Atlas hesabı
- Git

---

## ⚡ Hızlı Başlangıç

### 1. Repoyu Klonla

```bash
git clone <repo-url>
cd myapp-backend
```

### 2. Bağımlılıkları Yükle

```bash
npm install
```

**NOT:** `bcrypt` paketini kaldırdık, sadece `bcryptjs` kullanıyoruz.

### 3. Environment Dosyasını Oluştur

```bash
cp .env.example .env
```

`.env` dosyasını düzenle:

```env
# Server
NODE_ENV=development
PORT=5000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myapp?retryWrites=true&w=majority

# JWT Secrets (güvenli rastgele string'ler kullan!)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters

# CORS
CLIENT_URL=http://localhost:8081
ADMIN_URL=http://localhost:3000
WEB_URL=http://localhost:5173

# Cloudinary (opsiyonel, şimdilik)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Google OAuth (opsiyonel, şimdilik)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### 4. Sunucuyu Başlat

```bash
# Development mode (nodemon ile auto-restart)
npm run dev

# Production mode
npm start
```

Sunucu başladı! 🎉
```
✅ Express sunucusu başlatıldı
✅ Port: 5000
✅ MongoDB bağlandı
```

---

## 🧪 API Testi

### Health Check

```bash
curl http://localhost:5000/health
```

**Yanıt:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-03-24T..."
}
```

### Kayıt Ol

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "fullName": "Test User",
    "username": "testuser"
  }'
```

### Giriş Yap

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'
```

---

## 🗄️ Database Management

### Kullanıcıları Listele

```bash
npm run db:list
```

### Kullanıcı Sil

```bash
npm run db:delete test@example.com
```

### Veritabanını Sıfırla

```bash
npm run db:reset -- --confirm
```

**Daha fazla bilgi:** `scripts/README.md`

---

## 🔐 Bcrypt Uyumsuzluğu Sorunu

Eğer login çalışmıyorsa ve "password mismatch" alıyorsan:

**Sebep:** Eski kullanıcı `bcrypt` ile, yeni kod `bcryptjs` ile çalışıyor.

**Çözüm:**

```bash
# 1. Eski kullanıcıyı sil
npm run db:delete old@user.com

# 2. Yeni kullanıcı oluştur (bcryptjs ile hash'lenecek)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "old@user.com",
    "password": "NewPassword123!",
    "fullName": "User Name",
    "username": "username"
  }'
```

**Detaylı açıklama:** `BCRYPT_FIX.md`

---

## 📁 Proje Yapısı

```
myapp-backend/
├── config/
│   └── database.js          # MongoDB bağlantısı
├── controllers/
│   └── authController.js    # Auth endpoint'leri
├── models/
│   ├── User.js              # Kullanıcı modeli
│   ├── Otp.js               # OTP modeli
│   └── RefreshToken.js      # Refresh token modeli
├── routes/
│   └── authRoutes.js        # Auth route'ları
├── middleware/
│   └── errorHandler.js      # Hata yönetimi
├── scripts/
│   ├── listUsers.js         # Kullanıcı listele
│   ├── deleteUser.js        # Kullanıcı sil
│   ├── resetDatabase.js     # DB sıfırla
│   └── README.md            # Script dokümantasyonu
├── server.js                # Ana sunucu dosyası
├── .env                     # Environment variables
├── .env.example             # Örnek env dosyası
├── package.json             # NPM dependencies
└── README.md                # Ana dokümantasyon
```

---

## 🌐 Deploy (Render)

**Production URL:** https://myapp-backend-jxvm.onrender.com

### Render Environment Variables

Render dashboard'da şu değişkenleri ekle:

```
NODE_ENV=production
PORT=5000
MONGODB_URI=<atlas-connection-string>
JWT_SECRET=<güvenli-random-string>
JWT_REFRESH_SECRET=<güvenli-random-string>
CLIENT_URL=exp://192.168.1.100:8081
ADMIN_URL=https://admin.example.com
WEB_URL=https://example.com
```

### Deploy Komutları

```bash
# Render otomatik deploy eder (git push sonrası)
git add .
git commit -m "Update"
git push origin main
```

---

## 🛠️ Geliştirme Komutları

```bash
npm run dev          # Development server (nodemon)
npm start            # Production server
npm run test         # Test suite (coming soon)
npm run test:api     # Test endpoints script
npm run db:list      # Kullanıcıları listele
npm run db:delete    # Kullanıcı sil
npm run db:reset     # DB sıfırla
```

---

## 📚 Daha Fazla Bilgi

- **Backend API:** `README.md`
- **Database Scripts:** `scripts/README.md`
- **Bcrypt Fix:** `BCRYPT_FIX.md`
- **Environment:** `.env.example`

---

## 🐛 Sorun Giderme

### Port zaten kullanımda

```bash
# Port 5000'i kullanan process'i bul
lsof -i :5000

# Process'i öldür
kill -9 <PID>
```

### MongoDB bağlanamıyor

```bash
# Connection string'i kontrol et
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"

# MongoDB Atlas IP whitelist kontrol et:
# - 0.0.0.0/0 (herkese açık - development için)
# - Render IP'leri (production için)
```

### Login çalışmıyor

```bash
# Kullanıcı hash'ini kontrol et
npm run db:list

# Eğer eski bcrypt hash'i varsa sil
npm run db:delete problematic@email.com

# Yeni kullanıcı oluştur
curl -X POST http://localhost:5000/api/auth/register ...
```

### Dependencies hatası

```bash
# node_modules ve package-lock.json'u temizle
rm -rf node_modules package-lock.json

# Yeniden yükle
npm install
```

---

## ✅ Checklist

Başlamadan önce kontrol et:

- [ ] Node.js 18+ yüklü
- [ ] MongoDB Atlas hesabı var
- [ ] `.env` dosyası oluşturuldu
- [ ] `MONGODB_URI` doğru
- [ ] `JWT_SECRET` ve `JWT_REFRESH_SECRET` güçlü
- [ ] `npm install` çalıştırıldı
- [ ] Sunucu başladı (`npm run dev`)
- [ ] Health check başarılı

**Hepsi tamam mı?** Harika! 🎉

Şimdi register ve login endpoint'lerini test edebilirsin.

---

## 💡 İpuçları

1. **Development:** `npm run dev` kullan (auto-restart)
2. **Database:** Sık sık `npm run db:list` ile kontrol et
3. **Logs:** Server log'larını takip et (debug için)
4. **Postman:** API test için Postman collection'ı kullan
5. **Git:** Her önemli değişiklikten sonra commit yap

---

**Başarılar!** 🚀
