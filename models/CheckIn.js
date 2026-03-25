const mongoose = require('mongoose');

const checkInSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    venueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Venue',
      required: true,
      index: true,
    },
    note: {
      type: String,
      default: null,
      maxlength: [280, 'Not en fazla 280 karakter olabilir'],
      trim: true,
    },
    photos: [{ type: String }], // Cloudinary URL'leri

    // Görünürlük: 3h, 6h, 12h, 24h, forever, private
    visibility: {
      type: String,
      enum: ['3h', '6h', '12h', '24h', 'forever', 'private'],
      default: '3h',
    },
    visibleUntil: {
      type: Date,
      default: null,
      index: true,
    },

    // Etkileşimler (denormalized)
    likesCount: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 },

    // Beğenenler
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Kullanıcının bu mekandaki kaçıncı check-in'i
    userVenueCount: { type: Number, default: 1 },

    // Kazanılan coin
    coinsEarned: { type: Number, default: 0 },

    // Konum snapshot (check-in anındaki konum)
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: undefined,
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Feed sorguları için
checkInSchema.index({ userId: 1, createdAt: -1 });
checkInSchema.index({ venueId: 1, createdAt: -1 });
checkInSchema.index({ createdAt: -1 });
checkInSchema.index({ visibleUntil: 1 }, { sparse: true });

const CheckIn = mongoose.model('CheckIn', checkInSchema);
module.exports = CheckIn;
