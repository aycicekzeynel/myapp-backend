# 📝 Komut Referansı - Hızlı Erişim

## 🚀 SERVER KOMUTLARI

```bash
# Tek komutla başlat (otomatik kontrol + başlatma)
./quick-start.sh

# Development mode (auto-reload)
npm run dev

# Production mode
npm start

# Dependencies yükle
npm install

# Dependencies temizle ve yeniden yükle
rm -rf node_modules package-lock.json && npm install

# bcrypt rebuild
npm rebuild bcrypt
```

---

## 🗄️ MONGODB KOMUTLARI

```bash
# MongoDB başlat (macOS)
brew services start mongodb-community@7.0

# MongoDB durdur
brew services stop mongodb-community@7.0

# MongoDB yeniden başlat
brew services restart mongodb-community@7.0

# MongoDB durumunu kontrol et
brew services list | grep mongodb

# MongoDB shell'e bağlan
mongosh

# Manuel başlatma
mongod --config /usr/local/etc/mongod.conf

# MongoDB kurulumu (macOS)
brew tap mongodb/brew
brew install mongodb-community@7.0
```

---

## 🧪 TEST KOMUTLARI

```bash
# Otomatik test script
./test-api.sh

# Health check
curl http://localhost:5000/health

# API test
curl http://localhost:5000/api/test

# Register test
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "username": "testuser",
    "fullName": "Test User"
  }'

# Login test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!"
  }'

# Pretty print JSON (jq ile)
curl -s http://localhost:5000/health | jq '.'
```

---

## 🔧 SORUN GİDERME KOMUTLARI

```bash
# Port 5000'i kullanan process'i bul
lsof -i :5000

# Port 5000'i kullanan process'i öldür
lsof -ti:5000 | xargs kill -9

# Node.js versiyonunu kontrol et
node --version

# npm versiyonunu kontrol et
npm --version

# MongoDB process'ini kontrol et
pgrep -x mongod

# MongoDB log'larını görüntüle (macOS)
tail -f /usr/local/var/log/mongodb/mongo.log

# Tüm node process'lerini öldür (dikkatli kullan!)
killall node

# Network üzerindeki IP'ni bul (macOS/Linux)
ifconfig | grep "inet " | grep -v 127.0.0.1

# Network üzerindeki IP'ni bul (alternatif)
ipconfig getifaddr en0
```

---

## 📦 PACKAGE YÖNETİMİ

```bash
# Dependency ekle
npm install package-name

# Dev dependency ekle
npm install --save-dev package-name

# Package kaldır
npm uninstall package-name

# Outdated package'leri kontrol et
npm outdated

# Package'leri güncelle
npm update

# Security audit
npm audit

# Security fix
npm audit fix

# Cache temizle
npm cache clean --force
```

---

## 🐛 DEBUG KOMUTLARI

```bash
# Debug mode ile başlat
DEBUG=* npm run dev

# Specific debug
DEBUG=express:* npm run dev

# Node.js inspect mode
node --inspect server.js

# Verbose npm log
npm run dev --verbose

# Server log'larını dosyaya kaydet
npm run dev > logs/server.log 2>&1

# Real-time log takibi
tail -f logs/server.log
```

---

## 🌐 GIT KOMUTLARI

```bash
# Status kontrolü
git status

# Değişiklikleri stage'e al
git add .

# Commit
git commit -m "commit message"

# Push
git push origin main

# Pull
git pull origin main

# Branch oluştur
git checkout -b feature/new-feature

# Branch'ler arası geçiş
git checkout main

# Son commit'i geri al (soft)
git reset --soft HEAD~1

# Tüm değişiklikleri geri al (dikkat!)
git reset --hard HEAD
```

---

## 🚀 DEPLOYMENT KOMUTLARI

### Railway
```bash
# Railway CLI yükle
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# Logs
railway logs

# Environment variables
railway variables
```

### Heroku
```bash
# Heroku CLI yükle (macOS)
brew tap heroku/brew && brew install heroku

# Login
heroku login

# App oluştur
heroku create myapp-backend

# Deploy
git push heroku main

# Logs
heroku logs --tail

# Environment variables
heroku config:set VAR_NAME=value
```

---

## 📊 SİSTEM BİLGİSİ

```bash
# Sistem bilgisi
uname -a

# CPU bilgisi
sysctl -n machdep.cpu.brand_string

# Memory kullanımı
top -l 1 | grep PhysMem

# Disk kullanımı
df -h

# Proje boyutu
du -sh /Users/zeynelaycicek/projects/myapp-backend

# node_modules boyutu
du -sh node_modules
```

---

## 🔐 GÜVENLİK

```bash
# Random secret key oluştur
openssl rand -base64 32

# Random hex key
openssl rand -hex 32

# UUID oluştur
uuidgen

# .env dosyasını kontrol et (sensitive bilgi kontrolü)
cat .env | grep -E "SECRET|PASSWORD|KEY"
```

---

## 💾 YEDEKLEME

```bash
# Proje yedeği (node_modules hariç)
tar -czf myapp-backup-$(date +%Y%m%d).tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  /Users/zeynelaycicek/projects/myapp-backend

# MongoDB dump
mongodump --db myapp --out backup/

# MongoDB restore
mongorestore --db myapp backup/myapp
```

---

## 📱 MOBİL TEST İÇİN

```bash
# Local IP'ni bul
ifconfig | grep "inet " | grep -v 127.0.0.1

# Expo dev server ile test et
# Mobil cihaz ve bilgisayar aynı Wi-Fi'de olmalı
# API_URL = http://YOUR_LOCAL_IP:5000
```

---

## 🎯 HIZLI REFERANS

```bash
# Proje dizinine git
cd /Users/zeynelaycicek/projects/myapp-backend

# Kombo: Temizle, yükle, başlat
rm -rf node_modules && npm install && npm run dev

# Kombo: MongoDB + Server başlat
brew services start mongodb-community@7.0 && npm run dev

# Kombo: Port temizle + başlat
lsof -ti:5000 | xargs kill -9; npm run dev

# Kombo: Test çalıştır
curl -s http://localhost:5000/health | jq '.'
```

---

**💡 İpucu:** Bu dosyayı favorilerine ekle, sık kullanılan komutlara hızlı erişim için!

**🔖 Kopyala-yapıştır için:** Tüm komutlar direkt çalışır durumda!
