/**
 * MongoDB Database Configuration
 * Mongoose bağlantı ayarlarının merkezi yönetimi
 */

const mongoose = require('mongoose');

/**
 * MongoDB'ye bağlanma fonksiyonu
 * @returns {Promise<void>}
 */
const connectDB = async () => {
  try {
    // MongoDB URI'sı environment variables'dan alınır
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('📡 MongoDB bağlantısı kurulmaya çalışılıyor...');

    // Mongoose bağlantı seçenekleri
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    // MongoDB'ye bağlan
    const connection = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB başarıyla bağlandı`);
    console.log(`   - Host: ${connection.connection.host}`);
    console.log(`   - Veritabanı: ${connection.connection.name}`);

    // Bağlantı event listeners
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB bağlantısı kesildi');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB bağlantı hatası:', err.message);
      // Bağlantı tekrar kurmaya çalış
      setTimeout(() => {
        connectDB().catch((error) => {
          console.error('Yeniden bağlantı başarısız:', error.message);
        });
      }, 5000);
    });

    return connection;
  } catch (error) {
    console.error('❌ MongoDB bağlantı başarısız:', error.message);
    console.error('   - Lütfen MONGODB_URI environment variable\'ını kontrol edin');
    console.error('   - MongoDB Atlas cluster\'ın erişilebilir olduğunu kontrol edin');
    process.exit(1);
  }
};

/**
 * MongoDB'den bağlantıyı kes
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('✅ MongoDB bağlantısı kapatıldı');
    }
  } catch (error) {
    console.error('❌ MongoDB bağlantı kesme hatası:', error.message);
    process.exit(1);
  }
};

/**
 * MongoDB sağlık kontrolü
 * @returns {Promise<boolean>}
 */
const checkDBHealth = async () => {
  try {
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error('Database health check failed:', error.message);
    return false;
  }
};

module.exports = {
  connectDB,
  disconnectDB,
  checkDBHealth,
};
