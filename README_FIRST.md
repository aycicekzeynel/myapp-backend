# 👋 README FIRST!

Bu dosya backend'i ilk kez başlatacaklar için hazırlandı.

---

## ⚡ 3 Adımda Başla

### 1️⃣ MongoDB Atlas Kur (5 dakika)
Backend çalışması için **MongoDB Atlas** gerekli.

```bash
# Detaylı talimatları oku
cat MONGODB_ATLAS_SETUP.md
```

**Özet:**
1. https://mongodb.com/cloud/atlas → Hesap aç
2. Free cluster oluştur
3. Database user + IP whitelist ekle
4. Connection string'i `.env` dosyasına yapıştır

---

### 2️⃣ Dependencies Yükle
```bash
npm install
```

---

### 3️⃣ Server'ı Başlat
```bash
npm start
# veya development mode için:
npm run dev
```

**Başarılı çıktı:**
```
✅ MongoDB bağlantısı başarılı!
🚀 Server Started Successfully
Host: http://0.0.0.0:5000
```

---

## ✅ Test Et

### Health Check
```bash
curl http://localhost:5000/health
```

### API Test
```bash
npm run test:api
```

---

## 📚 Faydalı Dosyalar

| Dosya | Açıklama |
|-------|----------|
| `MONGODB_ATLAS_SETUP.md` | MongoDB Atlas kurulum rehberi |
| `START_SERVER.md` | Server başlatma ve sorun giderme |
| `CURRENT_STATUS.md` | Proje durumu ve yapılacaklar |
| `AUTHENTICATION.md` | Auth sistemi dokümantasyonu |
| `.env.example` | Environment variables örneği |

---

## 🆘 Sorun mu var?

### MongoDB bağlanamıyor
➡️ `MONGODB_ATLAS_SETUP.md` dosyasını oku  
➡️ `.env` dosyasındaki `MONGODB_URI` kontrol et

### Port zaten kullanımda
```bash
# Port 5000'i kapat
kill -9 $(lsof -ti:5000)
```

### Module bulunamıyor
```bash
# Dependencies yükle
npm install
```

---

## 🚀 Sonraki Adımlar

1. ✅ Server başarıyla çalışıyor mu?
2. ✅ API test'leri geçiyor mu?
3. 📱 Mobil app backend'e bağlanabilir mi?
4. 🌐 Railway'e deploy et
5. 📊 Admin panel bağlan

---

**Hazırlandı:** 2024-03-19  
**İlk Çalıştırma:** Başarılı olduğunda bu dosyayı silebilirsin 🎉
