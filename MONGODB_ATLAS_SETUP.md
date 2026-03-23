# 🗄️ MongoDB Atlas Setup Guide

## 📋 Adım 1: MongoDB Atlas Hesabı Oluştur

1. **https://www.mongodb.com/cloud/atlas/register** adresine git
2. Ücretsiz hesap oluştur (Google ile giriş yapabilirsin)
3. Email doğrulaması yap

---

## 🚀 Adım 2: Cluster Oluştur

1. **"Build a Database"** butonuna tıkla
2. **FREE tier (M0)** seç
   - 512 MB storage
   - Shared RAM
   - Ücretsiz!
3. **Cloud Provider & Region** seç:
   - AWS veya Google Cloud
   - Region: **Frankfurt (eu-central-1)** (Türkiye'ye yakın)
4. **Cluster Name:** `Cluster0` (varsayılan olarak bırak)
5. **"Create"** butonuna tıkla
6. ⏱️ 1-3 dakika bekle (cluster oluşturuluyor)

---

## 🔐 Adım 3: Database User Oluştur

1. Sol menüden **"Database Access"** sekmesine git
2. **"Add New Database User"** butonuna tıkla
3. **Username:** `myapp-admin` (istediğin bir isim)
4. **Password:** Güçlü bir şifre oluştur (kaydet!)
   - Örnek: `MyApp2024!SecurePass`
5. **Database User Privileges:** `Read and write to any database`
6. **"Add User"** butonuna tıkla

---

## 🌐 Adım 4: Network Access (IP Whitelist)

1. Sol menüden **"Network Access"** sekmesine git
2. **"Add IP Address"** butonuna tıkla
3. İki seçenek:

### Seçenek A: Her yerden erişim (development için)
- **"Allow Access from Anywhere"** butonuna tıkla
- IP: `0.0.0.0/0` otomatik eklenecek
- ⚠️ Production için güvenli değil!

### Seçenek B: Sadece kendi IP'n (daha güvenli)
- **"Add Current IP Address"** butonuna tıkla
- Railway deploy için ayrıca `0.0.0.0/0` eklemen gerekecek

4. **"Confirm"** butonuna tıkla

---

## 📝 Adım 5: Connection String Al

1. Sol menüden **"Database"** sekmesine dön
2. Cluster0'ın yanındaki **"Connect"** butonuna tıkla
3. **"Connect your application"** seç
4. **Driver:** Node.js
5. **Version:** 5.5 or later
6. **Connection String** kopyala:

```
mongodb+srv://myapp-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

7. `<password>` kısmını gerçek şifrenle değiştir
8. `/myapp` ekle:

```
mongodb+srv://myapp-admin:MyApp2024!SecurePass@cluster0.xxxxx.mongodb.net/myapp?retryWrites=true&w=majority
```

---

## 🔧 Adım 6: .env Dosyasını Güncelle

1. `/Users/zeynelaycicek/projects/myapp-backend/.env` dosyasını aç
2. `MONGODB_URI` satırını güncelle:

```env
MONGODB_URI=mongodb+srv://myapp-admin:MyApp2024!SecurePass@cluster0.xxxxx.mongodb.net/myapp?retryWrites=true&w=majority
```

⚠️ **ÖNEMLİ:** 
- Şifrende `@`, `:`, `/` gibi özel karakterler varsa **URL encode** et
- Örnek: `@` → `%40`, `:` → `%3A`
- Tool: https://www.urlencoder.org/

---

## ✅ Adım 7: Bağlantıyı Test Et

Terminalden:

```bash
cd /Users/zeynelaycicek/projects/myapp-backend
node server.js
```

Başarılı bağlantı mesajı:
```
╔════════════════════════════════════════╗
║     🚀 Server Started Successfully     ║
╠════════════════════════════════════════╣
║ Environment: development               ║
║ Host: http://0.0.0.0:5000              ║
║ WebSocket: ws://0.0.0.0:5000           ║
╚════════════════════════════════════════╝

✅ MongoDB bağlantısı başarılı!
```

Health check:
```bash
curl http://localhost:5000/health
```

Başarılı cevap:
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

---

## 🐛 Sorun Giderme

### Hata: "Authentication failed"
- ✅ Şifre doğru mu kontrol et
- ✅ URL encode edilmiş mi kontrol et
- ✅ Database user oluşturuldu mu kontrol et

### Hata: "IP not whitelisted"
- ✅ Network Access'te `0.0.0.0/0` eklenmiş mi kontrol et
- ✅ 1-2 dakika bekle (IP whitelist güncellemesi zaman alabilir)

### Hata: "Connection timeout"
- ✅ Cluster oluşturuldu mu kontrol et
- ✅ Internet bağlantın var mı kontrol et
- ✅ Connection string doğru kopyalandı mı kontrol et

---

## 📊 MongoDB Compass ile Görselleştir (Opsiyonel)

1. **MongoDB Compass** indir: https://www.mongodb.com/products/compass
2. Connection string'i yapıştır
3. Database'i görsel olarak yönet
4. Collection'ları browse et
5. Query çalıştır

---

## 🎯 Sonraki Adımlar

✅ MongoDB Atlas cluster oluşturuldu  
✅ Connection string .env'e eklendi  
✅ Backend başarıyla bağlandı  

🚀 Şimdi yapılacaklar:
1. API endpoint'leri test et
2. Mobil app backend'e bağlan
3. Railway'e deploy et
4. Production credentials ekle

---

**Hazırlandı:** 2024-03-19  
**Proje:** MyApp Backend  
**Database:** MongoDB Atlas Free Tier (M0)
