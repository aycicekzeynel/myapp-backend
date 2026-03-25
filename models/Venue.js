const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Mekan adı zorunludur'],
      trim: true,
      maxlength: [100, 'Mekan adı en fazla 100 karakter olabilir'],
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Kategori zorunludur'],
      enum: ['Kahve', 'Restoran', 'Bar', 'Kültür', 'Müzik', 'Spor', 'Alışveriş', 'Diğer'],
      index: true,
    },
    area: {
      type: String,
      required: [true, 'Semt/Alan zorunludur'],
      trim: true,
    },
    city: {
      type: String,
      default: 'İstanbul',
      index: true,
    },
    address: {
      type: String,
      default: null,
    },
    // GeoJSON point for location-based queries
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [28.9784, 41.0082], // İstanbul default
      },
    },
    description: {
      type: String,
      default: null,
      maxlength: 500,
    },
    phone: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    openingHours: {
      type: String,
      default: null,
      description: 'Örn: "09:00 – 22:00, Her gün"',
    },
    photos: [{ type: String }], // Cloudinary URL'leri
    coverPhoto: {
      type: String,
      default: null,
    },

    // İstatistikler (denormalized, performans için)
    checkinsCount: { type: Number, default: 0 },
    savesCount: { type: Number, default: 0 },
    uniqueVisitorsCount: { type: Number, default: 0 },

    // Belediye başkanı (en fazla check-in yapan)
    mayorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    mayorCheckins: { type: Number, default: 0 },

    // Durum
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },

    // Ekleyen kullanıcı
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Konum bazlı sorgular için 2dsphere index
venueSchema.index({ location: '2dsphere' });
venueSchema.index({ name: 'text', area: 'text', city: 'text' });
venueSchema.index({ category: 1, city: 1 });
venueSchema.index({ checkinsCount: -1 });

const Venue = mongoose.model('Venue', venueSchema);
module.exports = Venue;
