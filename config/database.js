/**
 * MongoDB Database Configuration
 */

const mongoose = require('mongoose');

let reconnectTimer = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30000;

function scheduleReconnect() {
  if (reconnectTimer) return; // zaten bekliyor

  const delay = Math.min(1000 * 2 ** reconnectAttempts, MAX_RECONNECT_DELAY);
  reconnectAttempts++;
  console.log(`🔄 MongoDB yeniden bağlanılıyor... (${reconnectAttempts}. deneme, ${delay / 1000}s sonra)`);

  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    try {
      await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
    } catch (err) {
      console.error('❌ Yeniden bağlantı başarısız:', err.message);
      scheduleReconnect();
    }
  }, delay);
}

const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
};

const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;
  if (!mongoURI) throw new Error('MONGODB_URI environment variable is not defined');

  console.log('📡 MongoDB bağlantısı kuruluyor...');

  // Listener'ları bir kere kaydet (reconnect'te tekrar kayıt olmasın)
  if (mongoose.connection.listenerCount('disconnected') === 0) {
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB bağlantısı kesildi — yeniden bağlanılıyor...');
      scheduleReconnect();
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB yeniden bağlandı');
      reconnectAttempts = 0;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB bağlantı hatası:', err.message);
      // disconnected event zaten reconnect tetikler
    });
  }

  const connection = await mongoose.connect(mongoURI, mongooseOptions);
  reconnectAttempts = 0;

  console.log(`✅ MongoDB bağlandı: ${connection.connection.host} / ${connection.connection.name}`);
  return connection;
};

const disconnectDB = async () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('✅ MongoDB bağlantısı kapatıldı');
  }
};

const checkDBHealth = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return false;
    await mongoose.connection.db.admin().ping();
    return true;
  } catch {
    return false;
  }
};

module.exports = { connectDB, disconnectDB, checkDBHealth };
