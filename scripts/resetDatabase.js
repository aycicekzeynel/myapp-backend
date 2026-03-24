/**
 * MongoDB'deki TÜM kullanıcıları ve token'ları silen script
 * ⚠️ DİKKAT: Bu işlem geri alınamaz!
 * Kullanım: node scripts/resetDatabase.js --confirm
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const OTP = require('../models/Otp');

// Güvenlik kontrolü
const confirmArg = process.argv[2];

if (confirmArg !== '--confirm') {
  console.error('⚠️  DİKKAT: Bu script TÜM kullanıcıları ve verilerini silecek!');
  console.log('');
  console.log('📖 Devam etmek için --confirm parametresi ekleyin:');
  console.log('   node scripts/resetDatabase.js --confirm');
  process.exit(1);
}

/**
 * Veritabanını sıfırla
 */
async function resetDatabase() {
  try {
    console.log('🔌 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    console.log('⚠️  VERİTABANI SIFIRLANIYOR...\n');

    // Kullanıcı sayısını kontrol et
    const userCount = await User.countDocuments();
    const tokenCount = await RefreshToken.countDocuments();
    const otpCount = await OTP.countDocuments();

    console.log(`📊 Mevcut veriler:`);
    console.log(`   Kullanıcılar: ${userCount}`);
    console.log(`   Refresh Token'lar: ${tokenCount}`);
    console.log(`   OTP'ler: ${otpCount}`);
    console.log('');

    // 3 saniye bekle
    console.log('⏳ 3 saniye içinde silme başlayacak...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('⏳ 2...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('⏳ 1...');
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');

    // Refresh token'ları sil
    console.log('🗑️  Refresh token\'lar siliniyor...');
    await RefreshToken.deleteMany({});
    console.log('✅ Tüm refresh token\'lar silindi');

    // OTP'leri sil
    console.log('🗑️  OTP\'ler siliniyor...');
    await OTP.deleteMany({});
    console.log('✅ Tüm OTP\'ler silindi');

    // Kullanıcıları sil
    console.log('🗑️  Kullanıcılar siliniyor...');
    await User.deleteMany({});
    console.log('✅ Tüm kullanıcılar silindi');

    console.log('');
    console.log('🎉 Veritabanı başarıyla sıfırlandı!');
    console.log('💡 Artık temiz bir veritabanı ile başlayabilirsiniz.');

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB bağlantısı kapatıldı');
    process.exit(0);
  }
}

// Script'i çalıştır
resetDatabase();
