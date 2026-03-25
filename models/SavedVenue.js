const mongoose = require('mongoose');

const savedVenueSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    venueId: { type: mongoose.Schema.Types.ObjectId, ref: 'Venue', required: true },
  },
  { timestamps: true }
);

savedVenueSchema.index({ userId: 1, venueId: 1 }, { unique: true });
savedVenueSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('SavedVenue', savedVenueSchema);
