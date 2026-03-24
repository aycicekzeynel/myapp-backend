/**
 * MongoDB'deki tüm kullanıcıları listeleyen script
 * Kullanım: node scripts/listUsers.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Tüm kullanıcıları listele
 */
async function listUsers() {
  try {
    console.log('🔌 MongoDB\'ye bağlanıyor...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB bağlantısı başarılı\n');

    console.log('🔍 Kullanıcılar listeleniyor...\n');
    const users = await User.find({}).select('+password');

    if (users.length === 0) {
      console.log('❌ Hiç kullanıcı bulunamadı!');
    } else {
      console.log(`✅ ${users.length} adet kullanıcı bulundu:\n`);
      console.log('━'.repeat(80));
      
      users.forEach((user, index) => {
        console.log(`\n👤 Kullanıcı #${index + 1}`);
        console.log(`   ID: ${user._id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Password hash: ${user.password ? user.password.substring(0, 30) + '...' : 'YOK'}`);
        console.log(`   Auth Provider: ${user.authProvider || 'N/A'}`);
        console.log(`   Email Verified: ${user.isEmailVerified ? '✅' : '❌'}`);
        console.log(`   Kayıt tarihi: ${user.createdAt}`);
        console.log(`   Son giriş: ${user.lastLoginAt || 'Hiç giriş yapmamış'}`);
      });
      
      console.log('\n' + '━'.repeat(80));
      console.log(`\n📊 Toplam: ${users.length} kullanıcı`);
    }

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
listUsers();
