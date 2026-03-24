/**
 * MongoDB'den belirli kullanıcıyı silen script
 * Kullanım: node scripts/deleteUser.js zeynel2@test.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

// Email argümanını al
const emailToDelete = process.argv[2];

if (!emailToDelete) {
  console.error('❌ Hata: Email parametresi gerekli!');
  console.log('📖 Kullanım: node scripts/deleteUser.js <email>');
  console.log('📖 Örnek: node scripts/deleteUser.js zeynel2@test.com');
  process.exit(1);
}

/**
 * Kullanıcıyı ve ilgili verilerini sil
 */
async function deleteUser(email) {
  try {
    console.log('🔌 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    // Kullanıcıyı bul
    console.log(`🔍 Kullanıcı aranıyor: ${email}`);
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ Kullanıcı bulunamadı!');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log('✅ Kullanıcı bulundu:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Kayıt tarihi: ${user.createdAt}`);
    console.log('');

    // Refresh token'ları sil
    console.log('🗑️  Refresh token\'lar siliniyor...');
    const deletedTokens = await RefreshToken.deleteMany({ userId: user._id });
    console.log(`✅ ${deletedTokens.deletedCount} adet refresh token silindi`);

    // Kullanıcıyı sil
    console.log('🗑️  Kullanıcı siliniyor...');
    await User.deleteOne({ _id: user._id });
    console.log('✅ Kullanıcı başarıyla silindi!');

    console.log('');
    console.log('🎉 Temizleme işlemi tamamlandı!');
    console.log('💡 Artık aynı email ile yeni kayıt yapabilirsiniz.');

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
deleteUser(emailToDelete);
