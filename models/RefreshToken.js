const mongoose = require('mongoose');

/**
 * RefreshToken Schema
 * Access token'lar kısa ömürlü, refresh token'lar daha uzun ömürlüdür
 * Refresh token'lar veritabanında tutularak revoke edilebilir
 */
const refreshTokenSchema = new mongoose.Schema(
  {
    // Refresh token değeri
    token: {
      type: String,
      required: [true, 'Token gereklidir'],
      unique: true,
      index: true,
    },

    // Hangi kullanıcıya ait
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Token'ın süresi bitme zamanı
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // TTL index: süresi dolan token'lar otomatik silinir
    },

    // Cihaz bilgisi (isteğe bağlı)
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      deviceName: String, // "iPhone", "Samsung Galaxy", vb.
    },

    // Token türü
    type: {
      type: String,
      enum: ['web', 'mobile', 'desktop'],
      default: 'mobile',
    },

    // İptal edildi mi
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },

    // İptal edilme sebebi
    revokeReason: {
      type: String,
      enum: ['logout', 'device-change', 'security', 'admin-action', null],
      default: null,
    },

    // İptal edilme zamanı
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Index: Kullanıcıya göre aktif token'lar (en son oluşturulanlar)
 */
refreshTokenSchema.index({ userId: 1, isRevoked: 1, expiresAt: -1 });
refreshTokenSchema.index({ createdAt: -1 });

/**
 * Static Method: Tüm eski refresh token'ları iptal et
 * @param {String} userId - Kullanıcı ID'si
 * @param {String} exceptTokenId - Hariç tutulacak token ID'si
 * @returns {Promise}
 */
refreshTokenSchema.statics.revokeOldTokens = async function (userId, exceptTokenId = null) {
  const query = {
    userId,
    isRevoked: false,
  };

  if (exceptTokenId) {
    query._id = { $ne: exceptTokenId };
  }

  return this.updateMany(query, {
    isRevoked: true,
    revokeReason: 'device-change',
    revokedAt: new Date(),
  });
};

/**
 * Static Method: Kullanıcının tüm cihazlardan token'larını iptal et
 * @param {String} userId - Kullanıcı ID'si
 * @returns {Promise}
 */
refreshTokenSchema.statics.revokeAllUserTokens = async function (userId) {
  return this.updateMany(
    { userId, isRevoked: false },
    {
      isRevoked: true,
      revokeReason: 'security',
      revokedAt: new Date(),
    }
  );
};

/**
 * Instance Method: Token'ı iptal et
 * @param {String} reason - İptal sebebi
 * @returns {Promise}
 */
refreshTokenSchema.methods.revoke = function (reason = 'logout') {
  this.isRevoked = true;
  this.revokeReason = reason;
  this.revokedAt = new Date();
  return this.save();
};

/**
 * Instance Method: Token'ın geçerli olup olmadığını kontrol et
 * @returns {Boolean}
 */
refreshTokenSchema.methods.isValid = function () {
  return !this.isRevoked && this.expiresAt > new Date();
};

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
