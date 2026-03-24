# Backend Scripts

Bu klasör veritabanı bakım ve yönetim scriptlerini içerir.

## Cleanup Test Users

Test kullanıcılarını MongoDB'den temizler.

### Kullanım

```bash
# Development ortamında çalıştır
NODE_ENV=development node scripts/cleanupTestUsers.js

# Veya .env'de NODE_ENV=development varsa
node scripts/cleanupTestUsers.js
```

### Hangi Kullanıcılar Silinir?

Script aşağıdaki pattern'lere uyan kullanıcıları siler:

- Email: `test@*`, `demo@*`, `example@*`
- Email: `*@test.*`, `*@example.*`, `*@gmail.test`
- Username: `test*`, `demo*`

### Güvenlik

- **Production Koruması**: `NODE_ENV=production` ise script otomatik durur
- **Onay Gerekli**: Silinecek kullanıcılar listelenir
- **Cascade Delete**: Kullanıcının refresh token'ları da silinir

### Örnek Çıktı

```
🔗 MongoDB'ye bağlanılıyor...
✅ MongoDB bağlantısı başarılı

🔍 Test kullanıcıları aranıyor...

📋 2 test kullanıcısı bulundu:
   1. test@test.com (@test123) - email
   2. demo@test.com (@demo456) - email

🗑️  Test kullanıcıları siliniyor...
   ✅ 4 refresh token silindi
   ✅ 2 kullanıcı silindi

🎉 Cleanup tamamlandı!
✅ Artık test kullanıcılarını yeniden oluşturabilirsiniz

🔌 MongoDB bağlantısı kapatıldı
```

## Önerilen Workflow

1. **Login sorunu yaşıyorsanız** önce cleanup çalıştırın
2. **Yeni register** yapın
3. **Test edin**

Bu sayede eski bcrypt vs bcryptjs karışıklığı ortadan kalkar.
