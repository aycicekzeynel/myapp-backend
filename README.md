# 🚀 City Explore Backend API

Şehir keşif ve sosyal check-in platformu için backend API.

## 📋 Özellikler

- ✅ Email + Şifre ile kayıt/giriş
- ✅ Telefon OTP ile kayıt/giriş (Hazır - SMS entegrasyonu bekleniyor)
- ✅ Google OAuth ile kayıt/giriş
- ✅ JWT Access/Refresh Token sistemi
- ✅ Şifre değiştirme ve sıfırlama
- ✅ Rate limiting
- ✅ Request logging
- ✅ Error handling
- ✅ WebSocket desteği (Socket.io)

## 🛠 Tech Stack

- **Runtime:** Node.js v18+
- **Framework:** Express.js
- **Database:** MongoDB
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Mongoose schema validation
- **WebSocket:** Socket.io
- **Security:** Helmet, CORS, Rate limiting

## 📦 Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. MongoDB'yi Başlat

Local MongoDB:
```bash
mongod
```

Veya MongoDB Atlas kullan (`.env` dosyasında `MONGODB_URI` düzenle).

### 3. Environment Variables

`.env` dosyasını oluştur (`.env.example` dosyasından kopyala):

```bash
cp .env.example .env
```

### 4. Sunucuyu Başlat

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📡 API Endpoints

### Health Check
```http
GET /health
```

### Authentication

#### Kayıt Ol (Email + Şifre)
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "username": "ahmetyilmaz",
  "password": "123456"
}
```

#### Giriş Yap (Email + Şifre)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmet@example.com",
  "password": "123456"
}
```

#### Google OAuth Giriş
```http
POST /api/auth/google
Content-Type: application/json

{
  "googleId": "1234567890",
  "email": "ahmet@gmail.com",
  "name": "Ahmet Yılmaz",
  "avatar": "https://..."
}
```

#### Token Yenile
```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Profil Bilgisi (Protected)
```http
GET /api/auth/me
Authorization: Bearer {accessToken}
```

#### Şifre Değiştir (Protected)
```http
POST /api/auth/change-password
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "currentPassword": "123456",
  "newPassword": "654321"
}
```

#### Çıkış Yap (Protected)
```http
POST /api/auth/logout
Authorization: Bearer {accessToken}
```

#### Şifre Sıfırlama İste
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "ahmet@example.com"
}
```

#### Şifre Sıfırla (Reset Token ile)
```http
POST /api/auth/reset-password/:token
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

## 🔐 JWT Token Yapısı

### Access Token (15 dakika)
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "access"
}
```

### Refresh Token (7 gün)
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "refresh"
}
```

## 🗂 Proje Yapısı

```
myapp-backend/
├── config/
│   ├── constants.js         # Sabitler ve mesajlar
│   └── database.js          # MongoDB bağlantısı
├── controllers/
│   └── authController.js    # Auth işlemleri
├── middleware/
│   ├── auth.js              # JWT doğrulama
│   ├── errorHandler.js      # Hata yönetimi
│   ├── rateLimiter.js       # Rate limiting
│   └── requestLogger.js     # Log middleware
├── models/
│   ├── User.js              # User modeli
│   ├── OTP.js               # OTP modeli
│   └── RefreshToken.js      # Refresh token modeli
├── routes/
│   └── auth.js              # Auth route'ları
├── utils/
│   ├── errorHandler.js      # Error utilities
│   ├── helpers.js           # Yardımcı fonksiyonlar
│   ├── sms.js               # SMS servis
│   └── validators.js        # Validasyon fonksiyonları
├── .env                     # Environment variables
├── .env.example             # Environment template
├── server.js                # Ana server dosyası
└── package.json
```

## 🧪 Test

```bash
# Health check
curl http://localhost:5000/health

# Test endpoint
curl http://localhost:5000/api/test
```

## 🚀 Deployment

### Railway Deployment

1. Railway hesabı oluştur
2. GitHub repo'yu bağla
3. Environment variables'ları ayarla
4. Deploy et

```bash
railway up
```

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
MONGODB_URI=mongodb+srv://...
JWT_SECRET=production-secret-key
JWT_REFRESH_SECRET=production-refresh-key
CORS_ORIGIN=https://yourdomain.com
```

## 📝 To-Do

- [ ] SMS OTP entegrasyonu (Netgsm/Twilio)
- [ ] Email servis entegrasyonu (SendGrid)
- [ ] Cloudinary image upload
- [ ] Redis caching
- [ ] Place, CheckIn, Review model'leri
- [ ] Follower sistemi
- [ ] Notification sistemi
- [ ] Search ve filtreleme
- [ ] Leaderboard sistemi
- [ ] Admin panel API'leri

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası

```bash
# MongoDB'nin çalıştığından emin ol
mongod --dbpath /path/to/data

# Veya MongoDB Atlas kullan
```

### Port Zaten Kullanımda

```bash
# .env dosyasında PORT'u değiştir
PORT=5001
```

### JWT Token Hataları

- Token'ın `Bearer {token}` formatında gönderildiğinden emin ol
- Token süresini kontrol et (15 dakika)
- Refresh token kullanarak yeniden token al

## 📞 İletişim

Sorularınız için: [your-email@example.com]

## 📄 Lisans

MIT License
# myapp-backend
# myapp-backend
