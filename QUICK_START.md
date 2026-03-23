# 🚀 Quick Start Guide - MyApp Backend

MyApp Backend'i hızlı bir şekilde başlatmak için bu adımları izleyin.

## 📋 Ön Gereksinimler

- **Node.js** >= 16.0.0
- **npm** >= 8.0.0
- **MongoDB Atlas** account (ücretsiz tier yeterli)
- **Redis** (isteğe bağlı, rate limiting için)
- **SMS Provider** (Twilio, NetGSM, vb.)

## ⚡ 5 Dakikalık Kurulum

### 1. Repo Klonla & Dependencies Yükle

```bash
cd /Users/zeynelaycicek/projects/myapp-backend

# Dependencies yükle
npm install
```

### 2. Environment Variables Ayarla

```bash
# .env.example'ı .env'ye kopyala
cp .env.example .env

# .env dosyasını edit et
nano .env
```

**En az gerekli ayarlar:**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/myapp
JWT_SECRET=your_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Server Başlat

```bash
# Development mode (auto-restart)
npm run dev

# Veya production mode
npm start
```

**Başarılı başlangıç mesajı:**
```
✅ Server http://localhost:5000 başladı
✅ MongoDB bağlantısı kuruldu
```

### 4. API'yi Test Et

```bash
# Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ahmet Yılmaz",
    "email": "ahmet@example.com",
    "username": "ahmet_yilmaz",
    "password": "password123"
  }'

# Response:
# {
#   "success": true,
#   "message": "Kayıt başarılı",
#   "data": {
#     "user": { ... },
#     "tokens": {
#       "accessToken": "...",
#       "refreshToken": "...",
#       "expiresIn": 900
#     }
#   }
# }
```

## 🔐 Authentication Test

### Email + Şifre Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmet@example.com",
    "password": "password123"
  }'
```

### Protected Endpoint'e Erişim

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Token Yenile

```bash
curl -X POST http://localhost:5000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## 📱 OTP Testing (Development Mode)

Development mode'da, OTP kodu API yanıtında döner:

```bash
# OTP Gönder
curl -X POST http://localhost:5000/api/auth/phone/send-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+905551234567",
    "type": "signup"
  }'

# Response:
# {
#   "success": true,
#   "message": "OTP gönderildi",
#   "data": {
#     "phoneNumber": "+905551234567",
#     "type": "signup",
#     "expiresIn": 300,
#     "code": "123456"  <- Dev mode'da döner
#   }
# }

# OTP Doğrula
curl -X POST http://localhost:5000/api/auth/phone/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+905551234567",
    "code": "123456",
    "type": "signup",
    "name": "Ahmet Yılmaz",
    "username": "ahmet_yilmaz"
  }'
```

## 📁 Proje Yapısı

```
myapp-backend/
├── controllers/
│   └── authController.js       # Authentication logic
├── middleware/
│   ├── auth.js                 # JWT & Authorization
│   └── rateLimiter.js          # Rate limiting
├── models/
│   ├── User.js                 # User schema
│   └── OTP.js                  # OTP schema
├── routes/
│   └── auth.js                 # Auth endpoints
├── utils/
│   ├── validators.js           # Input validation
│   ├── errorHandler.js         # Error handling
│   └── sms.js                  # SMS service
├── server.js                   # Express app
├── package.json                # Dependencies
├── .env                        # Environment variables
└── .env.example                # Environment template
```

## 🛠️ Geliştirme Araçları

### VS Code Extensions
- REST Client (HTTP requests test)
- Thunder Client (Postman alternative)
- MongoDB for VS Code

### Postman Collection
Backend klasöründe Postman collection import et:
```
AUTHENTICATION.md içindeki API Endpoints bölümüne bak
```

### Database Management
```bash
# MongoDB Compass ile bağlan
mongodb+srv://username:password@cluster.mongodb.net/myapp
```

## 🔧 Troubleshooting

### "MongoDB bağlantısı başarısız"
```bash
# Kontrol et:
1. MONGODB_URI doğru mu?
2. IP whitelist'e eklendik mi?
3. Network connectivity var mı?

# MongoDB Atlas Dashboard'da:
- Network Access → Add IP Address
```

### "SMS gönderilemedi"
```bash
# Development mode'da kontrol:
NODE_ENV=development npm run dev

# Konsola bakarak OTP kodunu al
# Production'da SMS provider credentials'ı kontrol et
```

### "Rate limit hatası"
```bash
# Rate limit'ten muaf kılmak (admin IP):
ADMIN_IPS=127.0.0.1

# Veya Redis'i disable et:
# utils/rateLimiter.js'de store değerini null yap
```

### "JWT Token hatası"
```bash
# Secrets length yeterli mi?
openssl rand -base64 32

# .env'de update et:
JWT_SECRET=new_secret_min_32_chars
JWT_REFRESH_SECRET=new_refresh_secret_min_32_chars
```

## 📝 Sonraki Adımlar

1. **Kullanıcı Profil Endpoints'i Yaz**
   - GET /api/users/:id
   - PUT /api/users/:id
   - DELETE /api/users/:id

2. **Arkadaş Sistemi Implemente Et**
   - POST /api/friends/add
   - POST /api/friends/remove
   - GET /api/friends

3. **Check-in Features Ekle**
   - POST /api/checkins
   - GET /api/checkins
   - Konum-based filtering

4. **WebSocket Real-time Features**
   - Socket.io integration
   - Live location tracking
   - Real-time notifications

5. **Testing**
   - Unit tests (Jest)
   - Integration tests
   - API tests (Supertest)

## 📚 İlgili Dokümantasyon

- [AUTHENTICATION.md](./AUTHENTICATION.md) - Auth sistemi detaylı
- [AUTH_IMPLEMENTATION_SUMMARY.md](./AUTH_IMPLEMENTATION_SUMMARY.md) - Implementasyon özeti
- [README.md](./README.md) - Genel proje bilgileri

## 💡 Tips & Tricks

### Development Mode Console Logging
```javascript
// controllers/authController.js'de
console.log('[AUTH] Logging:', data);

// Run
NODE_ENV=development npm run dev
```

### Database Query Logging
```javascript
// mongoose ayarları
mongoose.set('debug', true);
```

### Rate Limit Debugging
```bash
# Redis CLI'de rate limit keys'i kontrol et
redis-cli
> KEYS rate-limit:*
> GET rate-limit:127.0.0.1
```

### JWT Decode
```bash
# Online JWT Decoder: https://jwt.io
# Veya Node.js'de:
const jwt = require('jsonwebtoken');
const decoded = jwt.decode(token);
console.log(decoded);
```

## 🎯 Common Use Cases

### Postman'da Request Gönder

1. **Postman aç** → New Request
2. **Method:** POST
3. **URL:** `http://localhost:5000/api/auth/login`
4. **Headers:** `Content-Type: application/json`
5. **Body:**
```json
{
  "email": "ahmet@example.com",
  "password": "password123"
}
```
6. **Send** → Yanıtı al

### cURL ile Rapid Testing

```bash
#!/bin/bash
# test.sh

TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmet@example.com",
    "password": "password123"
  }' | jq -r '.data.tokens.accessToken')

echo "Token: $TOKEN"

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/auth/me
```

### Docker ile Çalıştır

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

```bash
docker build -t myapp-backend .
docker run -p 5000:5000 --env-file .env myapp-backend
```

## 📞 Support

Sorun mu var?
1. Docs'u oku (AUTHENTICATION.md)
2. Konsolu kontrol et (error messages)
3. GitHub issues'ı kontrol et
4. Team'e sor

---

**Happy Coding! 🎉**

Sorular? → Docs/AUTHENTICATION.md
Issues? → .env ve NODE_ENV kontrol et
Help? → Team'e slack'da sor
