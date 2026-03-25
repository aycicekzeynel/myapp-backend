const mongoose = require('mongoose');

const followSchema = new mongoose.Schema(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Özel hesaplarda bekleyen onay
    status: {
      type: String,
      enum: ['pending', 'accepted'],
      default: 'accepted',
    },
  },
  { timestamps: true }
);

// Aynı çiftten iki kayıt olmasın
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

const Follow = mongoose.model('Follow', followSchema);
module.exports = Follow;
