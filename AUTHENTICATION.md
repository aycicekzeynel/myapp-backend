# Authentication Sistemi Dokümantasyonu

MyApp Backend'inde kimlik doğrulama ve yetkilendirme sisteminin tam dokümantasyonu.

## İçindekiler

1. [Giriş](#giriş)
2. [Kimlik Doğrulama Yöntemleri](#kimlik-doğrulama-yöntemleri)
3. [API Endpoints](#api-endpoints)
4. [Token Yapısı](#token-yapısı)
5. [Middleware Kullanımı](#middleware-kullanımı)
6. [Rate Limiting](#rate-limiting)
7. [Hata Yönetimi](#hata-yönetimi)
8. [Kurulum](#kurulum)

## Giriş

MyApp Backend'inde 4 farklı kimlik doğrulama yöntemi desteklenir:

- **Email + Şifre**: Geleneksel email/şifre kayıt ve giriş
- **Telefon OTP**: SMS üzerinden bir kerelik şifre ile doğrulama
- **Google OAuth**: Google hesabı ile 3. parti giriş
- **JWT Tokens**: Access + Refresh token sistemi

## Kimlik Doğrulama Yöntemleri

### 1. Email + Şifre

#### Kayıt (Register)

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "username": "ahmet_yilmaz",
  "password": "securePassword123"
}
```

**Yanıt (201 Created):**
```json
{
  "success": true,
  "message": "Kayıt başarılı",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Ahmet Yılmaz",
      "email": "ahmet@example.com",
      "username": "ahmet_yilmaz",
      "avatar": null,
      "bio": null,
      "isPrivate": false,
      "locationVisibility": "friends",
      "role": "user",
      "isEmailVerified": false,
      "isPhoneVerified": false,
      "createdAt": "2024-03-19T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

**Validasyon Kuralları:**
- `name`: 2-50 karakter
- `email`: Geçerli email adresi, unique
- `username`: 3-30 karakter, unique, sadece `a-z`, `0-9`, `.`, `-`, `_`
- `password`: En az 6 karakter

**Hata Kodları:**
- `400`: Eksik veya geçersiz alan
- `409`: Email veya username zaten kullanılıyor

---

#### Giriş (Login)

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmet@example.com",
  "password": "securePassword123"
}
```

**Yanıt (200 OK):**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

**Hata Kodları:**
- `400`: Email veya şifre eksik
- `401`: Email veya şifre hatalı
- `403`: Hesap devre dışı
- `429`: Çok fazla başarısız deneme

---

### 2. Telefon OTP

#### OTP Gönder

```http
POST /api/auth/phone/send-otp
Content-Type: application/json

{
  "phoneNumber": "+905551234567",
  "type": "signup"
}
```

**OTP Türleri:**
- `signup`: Yeni hesap oluşturma
- `login`: Giriş yapma
- `reset-password`: Şifre sıfırlama
- `email-verify`: Email doğrulama

**Yanıt (200 OK):**
```json
{
  "success": true,
  "message": "OTP gönderildi",
  "data": {
    "phoneNumber": "+905551234567",
    "type": "signup",
    "expiresIn": 300,
    "code": "123456"
  }
}
```

**Not:** `code` sadece development mode'da döner. Production'da SMS gönderilir.

---

#### OTP Doğrula ve Giriş/Kayıt Yap

```http
POST /api/auth/phone/verify-otp
Content-Type: application/json

{
  "phoneNumber": "+905551234567",
  "code": "123456",
  "type": "signup",
  "name": "Ahmet Yılmaz",
  "username": "ahmet_yilmaz"
}
```

**Yanıt (200 OK):**
```json
{
  "success": true,
  "message": "Kayıt başarılı",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

**Hata Kodları:**
- `400`: Geçersiz OTP isteği
- `401`: Geçersiz OTP kodu
- `404`: Telefon numarası ile kayıtlı kullanıcı yok (login için)
- `409`: Username zaten alınmış
- `429`: Çok fazla hatalı deneme veya çok sık istek

**Kurallar:**
- OTP 5 dakika geçerliliğe sahip
- 5 hatalı deneme sonrası 30 dakika bloklanır
- 1 dakikanın içinde çoklu istek kabul edilmez

---

### 3. Google OAuth

```http
POST /api/auth/google
Content-Type: application/json

{
  "googleToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ...",
  "googleId": "115401826143851719476",
  "email": "ahmet@gmail.com",
  "name": "Ahmet Yılmaz",
  "avatar": "https://lh3.googleusercontent.com/a/default-user=s96-c"
}
```

**Yanıt (200 OK):**
```json
{
  "success": true,
  "message": "Giriş başarılı",
  "data": {
    "user": { ... },
    "tokens": { ... }
  }
}
```

**Not:** 
- Google token doğrulama henüz implement edilmedi (TODO)
- Mevcut kullanıcı varsa giriş, yoksa yeni kullanıcı oluşturulur
- Email Google tarafından doğrulanmış kabul edilir

---

### 4. Token Yenileme

```http
POST /api/auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Yanıt (200 OK):**
```json
{
  "success": true,
  "message": "Token yenilendi",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 900
    }
  }
}
```

---

## API Endpoints

### Tüm Endpoint'ler

| Yöntem | Route | Açıklama | Auth | Rate Limit |
|--------|-------|----------|------|-----------|
| POST | `/api/auth/register` | Email ile kayıt | ✗ | 3/15min |
| POST | `/api/auth/login` | Email ile giriş | ✗ | 5/15min |
| POST | `/api/auth/phone/send-otp` | OTP gönder | ✗ | 10/15min |
| POST | `/api/auth/phone/verify-otp` | OTP doğrula | ✗ | 10/15min |
| POST | `/api/auth/google` | Google OAuth | ✗ | 3/15min |
| POST | `/api/auth/refresh-token` | Token yenile | ✗ | 100/15min |
| GET | `/api/auth/me` | Profil bilgileri | ✓ | 1000/15min |
| POST | `/api/auth/logout` | Çıkış yap | ✓ | 100/15min |
| POST | `/api/auth/change-password` | Şifre değiştir | ✓ | 5/1hour |
| POST | `/api/auth/forgot-password` | Şifre sıfırlama | ✗ | 5/1hour |
| POST | `/api/auth/reset-password/:token` | Şifre sıfırla | ✗ | 5/1hour |

---

## Token Yapısı

### Access Token (15 dakika)

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "access",
  "iat": 1710854400,
  "exp": 1710855300
}
```

**Kullanım:** API request'lerinde `Authorization: Bearer {token}` header'ında

### Refresh Token (7 gün)

```json
{
  "userId": "507f1f77bcf86cd799439011",
  "type": "refresh",
  "iat": 1710854400,
  "exp": 1711459200
}
```

**Kullanım:** Access token süresi dolduğunda yeni token almak için

---

## Middleware Kullanımı

### 1. authenticateToken

Giriş gerekli endpoint'ler için:

```javascript
router.get('/profile', authenticateToken, controller.getProfile);
```

**Davranış:**
- Authorization header'ından token çıkar
- Token doğrular ve JWT dekode eder
- `req.user.userId` olarak userId atar
- Geçersiz/süresi dolmuş token'de 401 hatasını fırlatır

---

### 2. optionalAuthenticateToken

Token varsa doğrula, yoksa devam et:

```javascript
router.get('/posts', optionalAuthenticateToken, controller.getPosts);
```

**Davranış:**
- Token varsa doğrular ve `req.user.userId` atar
- Token yoksa veya geçersizse devam eder (`req.user` tanımlanmaz)

---

### 3. requireAdmin

Admin yetkilendirmesi:

```javascript
router.delete('/users/:id', authenticateToken, requireAdmin, controller.deleteUser);
```

**Davranış:**
- `authenticateToken`'dan sonra kullanılmalı
- Kullanıcının `role === 'admin'` olması gerekir
- Admin değilse 403 hatasını fırlatır

---

### 4. requireModerator

Moderator yetkilendirmesi:

```javascript
router.post('/reports', authenticateToken, requireModerator, controller.handleReport);
```

---

### 5. checkAccountStatus

Hesap durumu kontrol et:

```javascript
router.post('/action', authenticateToken, checkAccountStatus, controller.doAction);
```

**Kontroller:**
- Hesap `isActive === true`
- Hesap `isDeleted !== true`

---

### 6. requireEmailVerification

Email doğrulama zorunlu:

```javascript
router.post('/sensitive', authenticateToken, requireEmailVerification, controller.sensitiveAction);
```

---

### 7. requirePhoneVerification

Telefon doğrulama zorunlu:

```javascript
router.post('/payment', authenticateToken, requirePhoneVerification, controller.processPayment);
```

---

## Rate Limiting

### Limitlerin Özeti

| İşlem | Limit | Pencere |
|-------|-------|---------|
| Genel API | 100 | 15 dakika |
| Giriş | 5 | 15 dakika |
| Kayıt | 3 | 15 dakika |
| OTP | 10 | 15 dakika |
| Şifre işlemleri | 5 | 1 saat |
| Giriş yapanlar | 1000 | 15 dakika |
| Dosya yükleme | 50 | 1 saat |
| Arama | 30 | 1 dakika |

### Rate Limit Yanıtı (429 Too Many Requests)

```json
{
  "success": false,
  "error": {
    "message": "Çok fazla istek yaptınız. Lütfen biraz sonra tekrar deneyin.",
    "code": 429,
    "retryAfter": 900
  }
}
```

---

## Hata Yönetimi

### Standart Hata Yanıtı

```json
{
  "success": false,
  "error": {
    "message": "Hata mesajı",
    "code": 400,
    "field": "email"
  }
}
```

### Yaygın Hata Kodları

| Kod | Anlamı | Örnek |
|-----|--------|-------|
| 400 | Bad Request | Eksik alan, geçersiz input |
| 401 | Unauthorized | Geçersiz token, yanlış şifre |
| 403 | Forbidden | Devre dışı hesap, yetki yok |
| 404 | Not Found | Kaynak bulunamadı |
| 409 | Conflict | Email/username zaten kullanılıyor |
| 429 | Too Many Requests | Rate limit aşıldı |
| 500 | Internal Server Error | Sunucu hatası |

---

## Kurulum

### 1. Environment Variables

`.env` dosyasını aşağıdaki ayarlarla oluştur:

```env
# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# SMS Provider (twilio, aws-sns, netgsm, iyzico)
SMS_PROVIDER=twilio

# Twilio (örnek)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=+1234567890

# NetGSM (Türkiye için)
NETGSM_USERNAME=your_username
NETGSM_PASSWORD=your_password
NETGSM_HEADER=MyApp

# iyzico (Türkiye için)
IYZICO_API_KEY=your_api_key
IYZICO_SENDER_ID=MyApp

# Redis (Rate Limiting için, opsiyonel)
REDIS_URL=redis://localhost:6379

# Admin IP'leri (Rate limit'ten muaf)
ADMIN_IPS=127.0.0.1,192.168.1.1

# Node Environment
NODE_ENV=development
```

### 2. Dependencies

```bash
npm install jsonwebtoken bcrypt express-rate-limit rate-limit-redis redis
npm install twilio axios # SMS provider'lar için
```

### 3. Server Entegrasyonu

`server.js` dosyasında:

```javascript
const express = require('express');
const authRoutes = require('./routes/auth');
const { errorHandler } = require('./utils/errorHandler');

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Error Handler (son olarak)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} başladı`);
});
```

---

## Güvenlik En İyi Uygulamaları

### 1. Şifre Güvenliği

✓ **Yapılanlar:**
- bcrypt ile 10 salt round'unda hashleme
- Minimum 6 karakter zorunluluğu
- Şifre sorgudan default olarak seçilmiyor

⚠️ **Yapılması Gereken:**
- Daha güçlü şifre gereksinimleri (büyük harf, rakam, özel karakter)
- Önceki şifreleri sakla, tekrar kullanılmasını engelle

### 2. Token Güvenliği

✓ **Yapılanlar:**
- Access token kısa ömürlü (15 dakika)
- Refresh token uzun ömürlü (7 gün), ayrı secret ile
- Token doğrulama header'dan yapılır

⚠️ **Yapılması Gereken:**
- Token blacklist sistemi (logout'da invalidate etme)
- Token rotation (her refresh'te yeni refresh token)
- HTTPS only cookies (refresh token için)

### 3. Brute Force Koruması

✓ **Yapılanlar:**
- Giriş için 15 dakikada 5 deneme limiti
- OTP için 5 hatalı deneme sonrası 30 dakika bloklanma
- Email + IP kombinasyonu ile tracking

### 4. Rate Limiting

✓ **Yapılanlar:**
- Redis ile dağıtılmış rate limiting (production)
- Endpoint'e göre farklı limitler
- Spesifik hata kodları (429)

### 5. Veri Doğrulama

✓ **Yapılanlar:**
- Email format doğrulama
- Telefon numarası format doğrulama
- Username pattern doğrulama

⚠️ **Yapılması Gereken:**
- OWASP validation kuralları
- XSS/SQL Injection koruması

---

## Debugging

### Development Mode'da

```env
NODE_ENV=development
```

- OTP kodları JSON yanıtında döner
- SMS'ler konsolda loglanır
- Detaylı hata stacktrace

### Production Mode'da

```env
NODE_ENV=production
```

- OTP kodları gizlenir
- SMS gerçekten gönderilir
- Hata stacktrace gizlenir

---

## Troubleshooting

### "Çok fazla başarısız giriş denemesi"

Çözüm: 15 dakika bekle veya Redis'i kontrol et

### "Token süresi dolmuş"

Çözüm: `/refresh-token` endpoint'ini çağır

### "SMS gönderilemedi"

Kontrol Et:
- SMS provider ayarları (TWILIO, NETGSM, vb.)
- Telefon numarası formatı
- SMS provider kredileri

### OTP kodu gelmedi

Kontrol Et:
- Telefon numarasının doğru olması
- SMS provider bağlantısı
- Development mode'da konsolda kontrol et

---

## API Response Örnekleri

Tüm yanıtlar aşağıdaki format'ları takip eder:

### Başarılı (Success)

```json
{
  "success": true,
  "message": "İşlem açıklaması",
  "data": { ... }
}
```

### Hatalı (Error)

```json
{
  "success": false,
  "error": {
    "message": "Hata mesajı",
    "code": 400
  }
}
```

---

**Sürüm:** 1.0.0  
**Son Güncelleme:** 2024-03-19  
**Yazar:** Backend Team
