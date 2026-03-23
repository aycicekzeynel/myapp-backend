const mongoose = require('mongoose');

/**
 * OTP Schema
 * Telefon numarası doğrulaması için bir kerelik şifreler (OTP)
 */
const otpSchema = new mongoose.Schema(
  {
    // OTP kendisi
    code: {
      type: String,
      required: [true, 'OTP kodu gereklidir'],
      length: 6,
    },

    // Telefon numarası
    phoneNumber: {
      type: String,
      required: [true, 'Telefon numarası gereklidir'],
      index: true,
    },

    // OTP türü (signup, login, reset-password vb.)
    type: {
      type: String,
      enum: ['signup', 'login', 'reset-password', 'email-verify'],
      default: 'signup',
    },

    // Doğrulama durumu
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Hatalı deneme sayısı (brute force koruması)
    attemptCount: {
      type: Number,
      default: 0,
      max: [5, 'Çok fazla hatalı deneme, lütfen daha sonra tekrar deneyin'],
    },

    // Son deneme zamanı
    lastAttemptAt: {
      type: Date,
      default: null,
    },

    // İlişkili kullanıcı (opsiyonel)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Sona erme zamanı (5 dakika)
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 5 * 60 * 1000),
      index: { expireAfterSeconds: 0 }, // TTL index
    },
  },
  {
    timestamps: true,
  }
);

/**
 * OTP verifikasyonu kontrol et
 * @param {String} code - Girilen OTP kodu
 * @returns {Boolean} - Doğrulama başarılı mı
 */
otpSchema.methods.verifyCode = function (code) {
  // Süresi dolmadı mı kontrol et
  if (this.expiresAt < new Date()) {
    return false;
  }

  // Kod eşleşiyor mu kontrol et
  if (this.code !== code) {
    this.attemptCount += 1;
    return false;
  }

  return true;
};

/**
 * Hatalı denemeye karşı korunmuş mu kontrol et
 * @returns {Boolean}
 */
otpSchema.methods.isBlocked = function () {
  // 3 hatalı deneme sonrası 30 dakika blokla
  if (this.attemptCount >= 5) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    return this.lastAttemptAt > thirtyMinutesAgo;
  }
  return false;
};

/**
 * Index: Cihazda sadece bir aktif OTP
 */
otpSchema.index({ phoneNumber: 1, type: 1, isVerified: 1 });
otpSchema.index({ userId: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OTP = mongoose.model('OTP', otpSchema);

module.exports = OTP;
