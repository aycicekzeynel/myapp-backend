# 🛠️ Database Management Scripts

Bu klasördeki scriptler MongoDB veritabanı yönetimi için kullanılır.

## 📋 Kullanılabilir Scriptler

### 1. 📃 Kullanıcıları Listele
Tüm kullanıcıları detaylı bilgileriyle listeler.

```bash
npm run db:list
# veya
node scripts/listUsers.js
```

**Gösterilen Bilgiler:**
- ID, email, username, name
- Password hash (ilk 30 karakter)
- Auth provider
- Email doğrulama durumu
- Kayıt tarihi ve son giriş

---

### 2. 🗑️ Belirli Kullanıcıyı Sil
Email adresine göre tek kullanıcıyı ve ilgili refresh token'larını siler.

```bash
npm run db:delete <email>
# veya
node scripts/deleteUser.js <email>
```

**Örnek:**
```bash
npm run db:delete zeynel2@test.com
node scripts/deleteUser.js test@example.com
```

**Ne yapar?**
- Kullanıcıyı bulur ve bilgilerini gösterir
- Kullanıcının refresh token'larını siler
- Kullanıcıyı siler

---

### 3. ⚠️ Veritabanını Sıfırla
**DİKKAT: Bu işlem geri alınamaz!**

TÜM kullanıcıları, refresh token'ları ve OTP'leri siler.

```bash
npm run db:reset -- --confirm
# veya
node scripts/resetDatabase.js --confirm
```

**Güvenlik:**
- `--confirm` parametresi zorunludur
- 3 saniye bekleme süresi vardır
- Silmeden önce veri sayılarını gösterir

---

## 🔧 Kullanım Senaryoları

### Senaryo 1: Bcrypt Uyumsuzluğu
Eski kullanıcı `bcrypt` ile, yeni kod `bcryptjs` kullanıyorsa:

```bash
# 1. Önce listeleyip kontrol et
npm run db:list

# 2. Problematik kullanıcıyı sil
npm run db:delete zeynel2@test.com

# 3. Yeni kullanıcı oluştur (API üzerinden)
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"zeynel2@test.com","password":"Test123!","fullName":"Zeynel Test","username":"zeyneltest"}'
```

### Senaryo 2: Temiz Başlangıç
Geliştirme sırasında veritabanını sıfırlamak istiyorsan:

```bash
npm run db:reset -- --confirm
```

### Senaryo 3: Test Kullanıcısı Temizleme
Test sonrası oluşan verileri temizle:

```bash
npm run db:delete test@example.com
npm run db:delete testuser2@test.com
```

---

## 🔐 Güvenlik Notları

1. **Production'da dikkatli kullan:** Bu scriptler local/staging için tasarlandı
2. **Backup al:** Önemli verileri silmeden önce backup al
3. **Environment kontrol:** `MONGODB_URI` doğru environment'i gösterdiğinden emin ol
4. **--confirm zorunlu:** `db:reset` için ekstra güvenlik katmanı

---

## 🐛 Sorun Giderme

### "Cannot find module" hatası
```bash
# Backend klasöründe olduğundan emin ol
cd /Users/zeynelaycicek/projects/myapp-backend

# Dependencies yüklü mü kontrol et
npm install
```

### "Connection failed" hatası
```bash
# .env dosyasını kontrol et
cat .env | grep MONGODB_URI

# MongoDB Atlas bağlantısı çalışıyor mu test et
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
```

### "User not found" mesajı
```bash
# Önce kullanıcıları listele
npm run db:list

# Email adresini doğru yazdığından emin ol (küçük harf!)
```

---

## 📝 Notlar

- Tüm email adresleri otomatik olarak küçük harfe çevrilir
- Username'ler de otomatik olarak küçük harfe çevrilir
- Password hash'leri `bcryptjs` ile 12 salt round kullanır
- Scriptler `.env` dosyasından `MONGODB_URI` okur

---

## 🎯 Hızlı Referans

```bash
npm run db:list              # Kullanıcıları listele
npm run db:delete <email>    # Kullanıcı sil
npm run db:reset -- --confirm # Veritabanını sıfırla
```

**Daha fazla bilgi için:**
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
