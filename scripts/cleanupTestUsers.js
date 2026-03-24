/**
 * Test Kullanıcılarını Temizleme Script'i
 * Kullanım: node scripts/cleanupTestUsers.js
 * 
 * ⚠️ DİKKAT: Bu script MongoDB'deki TÜM test kullanıcılarını siler!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const cleanupTestUsers = async () => {
  try {
    console.log('🔗 MongoDB\'ye bağlanılıyor...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı');

    // Test email pattern'leri
    const testEmailPatterns = [
      /^test@/i,           // test@test.com gibi
      /^demo@/i,           // demo@test.com gibi
      /^example@/i,        // example@test.com gibi
      /@test\./i,          // xxx@test.com gibi
      /@example\./i,       // xxx@example.com gibi
      /@gmail\.test/i      // xxx@gmail.test gibi
    ];

    // Test kullanıcılarını bul
    console.log('\n🔍 Test kullanıcıları aranıyor...');
    const testUsers = await User.find({
      $or: [
        { email: { $regex: /^test@/i } },
        { email: { $regex: /^demo@/i } },
        { email: { $regex: /^example@/i } },
        { email: { $regex: /@test\./i } },
        { email: { $regex: /@example\./i } },
        { email: { $regex: /@gmail\.test/i } },
        { username: { $regex: /^test/i } },
        { username: { $regex: /^demo/i } }
      ]
    });

    if (testUsers.length === 0) {
      console.log('✅ Silinecek test kullanıcısı bulunamadı');
      await mongoose.connection.close();
      return;
    }

    console.log(`\n📋 ${testUsers.length} test kullanıcısı bulundu:`);
    testUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (@${user.username}) - ${user.authProvider}`);
    });

    // Onay iste (production ortamında)
    if (process.env.NODE_ENV === 'production') {
      console.log('\n⚠️  PRODUCTION ortamındasınız!');
      console.log('⚠️  Script güvenlik için durduruluyor.');
      console.log('⚠️  Silmek için NODE_ENV=development olarak çalıştırın.');
      await mongoose.connection.close();
      return;
    }

    console.log('\n🗑️  Test kullanıcıları siliniyor...');

    // User ID'lerini topla
    const userIds = testUsers.map(user => user._id);

    // RefreshToken'ları sil
    const deletedTokens = await RefreshToken.deleteMany({ userId: { $in: userIds } });
    console.log(`   ✅ ${deletedTokens.deletedCount} refresh token silindi`);

    // Kullanıcıları sil
    const deletedUsers = await User.deleteMany({ _id: { $in: userIds } });
    console.log(`   ✅ ${deletedUsers.deletedCount} kullanıcı silindi`);

    console.log('\n🎉 Cleanup tamamlandı!');
    console.log('✅ Artık test kullanıcılarını yeniden oluşturabilirsiniz\n');

    await mongoose.connection.close();
    console.log('🔌 MongoDB bağlantısı kapatıldı');
  } catch (error) {
    console.error('❌ Cleanup hatası:', error);
    process.exit(1);
  }
};

// Script'i çalıştır
cleanupTestUsers();
