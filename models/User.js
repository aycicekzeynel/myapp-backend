const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");

/**
 * User Schema
 * Şehir keşif ve sosyal check-in uygulamasının kullanıcı modeli
 */
const userSchema = new mongoose.Schema(
  {
    // Kullanıcı adı ve profil bilgileri
    name: {
      type: String,
      required: [true, "Lütfen adınızı girin"],
      trim: true,
      minlength: [2, "Ad en az 2 karakter olmalıdır"],
      maxlength: [50, "Ad en fazla 50 karakter olabilir"],
    },
    email: {
      type: String,
      required: [true, "Lütfen email adresinizi girin"],
      unique: true,
      lowercase: true,
      index: true,
      sparse: true, // Null değerleri unique check'ten muaf tut
    },
    username: {
      type: String,
      required: [true, "Lütfen kullanıcı adı girin"],
      unique: true,
      lowercase: true,
      trim: true,
      minlength: [3, "Kullanıcı adı en az 3 karakter olmalıdır"],
      maxlength: [30, "Kullanıcı adı en fazla 30 karakter olabilir"],
      match: [
        /^[a-z0-9_.-]+$/,
        "Kullanıcı adı sadece harfler, rakamlar, nokta, alt çizgi ve tire içerebilir",
      ],
      index: true,
    },
    password: {
      type: String,
      minlength: [6, "Şifre en az 6 karakter olmalıdır"],
      select: false, // Güvenlik: şifre sorgudan default olarak seçilmiyor
    },

    // Telefon bilgileri
    phoneNumber: {
      type: String,
      default: null,
      index: true,
      sparse: true,
      description: "Telefon numarası (format: +905551234567)",
    },

    // OAuth entegrasyonları
    googleId: {
      type: String,
      default: null,
      index: true,
      sparse: true,
      description: "Google User ID",
    },
    authProvider: {
      type: String,
      enum: ["email", "google", "phone"],
      default: "email",
      description: "Kullanıcının kayıt olduğu yöntem",
    },

    // Profil bilgileri
    profilePhoto: {
      type: String,
      default: null,
      description: "Cloudinary URL",
    },
    bio: {
      type: String,
      default: null,
      trim: true,
      maxlength: [500, "Bio en fazla 500 karakter olabilir"],
    },
    dateOfBirth: {
      type: Date,
      default: null,
      description: "Kullanıcının doğum tarihi",
    },

    // Premium
    isPremium: {
      type: Boolean,
      default: false,
      description: "Pro abonelik durumu",
    },
    premiumExpiresAt: {
      type: Date,
      default: null,
      description: "Pro abonelik bitiş tarihi",
    },

    // Gizlilik ayarları
    isPrivate: {
      type: Boolean,
      default: false,
      description: "Özel profil: takip etmek için onay gerekir",
    },
    locationVisibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "friends",
      description:
        "Konum görünürlüğü: public (herkese), friends (arkadaşlara), private (gizli)",
    },

    // Sistem bilgileri
    role: {
      type: String,
      enum: ["user", "moderator", "admin"],
      default: "user",
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    // İstatistikler
    followersCount: {
      type: Number,
      default: 0,
    },
    followingCount: {
      type: Number,
      default: 0,
    },
    checkinsCount: {
      type: Number,
      default: 0,
    },

    // Son aktivite
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },

    // Onboarding
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    preferences: {
      city: { type: String, default: null },
      cityIntent: { type: String, enum: ['living', 'exploring', null], default: null },
      venueCategories: [{ type: String }],
      vibe: { type: String, default: null },
      locationConsent: { type: Boolean, default: null },
      contactsConsent: { type: Boolean, default: null },
      notifConsent: { type: Boolean, default: null },
    },

    // Hesap durumu
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },

    // Şifra sıfırlama token'ları (future use)
    resetToken: {
      type: String,
      default: null,
      select: false,
    },
    resetTokenExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt otomatik eklenir
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

/**
 * Middleware: Şifre hashleme
 * Şifre kaydedilmeden veya güncellendiğinde otomatik olarak hashlanır
 * ⚠️ ÖNEMLİ: bcryptjs kullanıyoruz (bcrypt değil!)
 */
userSchema.pre("save", async function (next) {
  // Eğer şifre değiştirilmemişse, middleware'yi atla
  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Şifre 12 salt round ile hashlanır (güvenlik için 12 öneriliyor)
    const salt = await bcryptjs.genSalt(12);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Method: Şifre doğrulama
 * Giriş sırasında kullanıcının girdiği şifre ile hashlanmış şifre karşılaştırılır
 * @param {String} enteredPassword - Kullanıcının girdiği şifre
 * @returns {Promise<Boolean>} - Şifreler eşleşirse true, eşleşmezse false
 */
userSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    return await bcryptjs.compare(enteredPassword, this.password);
  } catch (error) {
    throw new Error("Şifre karşılaştırması başarısız oldu");
  }
};

/**
 * Instance Method: Hassas bilgileri kaldır
 * API yanıtlarında şifre ve diğer hassas bilgileri gizlemek için
 * @returns {Object} - Hassas bilgileri kaldırılmış kullanıcı nesnesi
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetToken;
  delete userObject.resetTokenExpires;
  delete userObject.__v;
  return userObject;
};

/**
 * Static Method: Email ile kullanıcı ara
 * @param {String} email - Aranan email adresi
 * @returns {Promise<Object>} - Bulunan kullanıcı
 */
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

/**
 * Static Method: Username ile kullanıcı ara
 * @param {String} username - Aranan kullanıcı adı
 * @returns {Promise<Object>} - Bulunan kullanıcı
 */
userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: username.toLowerCase() });
};

/**
 * Static Method: Telefon numarası ile kullanıcı ara
 * @param {String} phoneNumber - Telefon numarası
 * @returns {Promise<Object>} - Bulunan kullanıcı
 */
userSchema.statics.findByPhoneNumber = function (phoneNumber) {
  return this.findOne({ phoneNumber });
};

/**
 * Virtual: Kullanıcı adı@instance.com formatında handle
 */
userSchema.virtual("handle").get(function () {
  return `@${this.username}`;
});

/**
 * Virtual: Tam profil tamamlanmış mı
 */
userSchema.virtual("isProfileComplete").get(function () {
  return !!(
    this.name &&
    this.username &&
    (this.isEmailVerified || this.isPhoneVerified)
  );
});

/**
 * Index: Email, username, phoneNumber ve performans için
 */
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ phoneNumber: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ isActive: 1, isDeleted: 1 });
userSchema.index({ lastActive: -1 });

// Model oluştur ve export et
const User = mongoose.model("User", userSchema);

module.exports = User;
