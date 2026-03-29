const Venue = require('../models/Venue');
const CheckIn = require('../models/CheckIn');
const mongoose = require('mongoose');

/**
 * GET /api/venues
 * Mekan listesi (filtre: category, city, search, sort)
 */
const getVenues = async (req, res) => {
  try {
    const { category, city, search, sort = 'popular', page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (category) filter.category = category;
    if (city) filter.city = city;
    if (search) filter.$text = { $search: search };

    const sortMap = {
      popular: { checkinsCount: -1 },
      newest: { createdAt: -1 },
      name: { name: 1 },
    };

    const venues = await Venue.find(filter)
      .sort(sortMap[sort] || sortMap.popular)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('mayorId', 'name username')
      .lean();

    const total = await Venue.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: { venues, total, page: parseInt(page), pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('getVenues error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * GET /api/venues/nearby
 * Yakındaki mekanlar (konum bazlı)
 */
const getNearbyVenues = async (req, res) => {
  try {
    const { lat, lng, radius = 1000, limit = 20 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'lat ve lng zorunludur' });
    }

    const venues = await Venue.find({
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius),
        },
      },
    })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({ success: true, data: { venues } });
  } catch (error) {
    console.error('getNearbyVenues error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * GET /api/venues/:id
 * Mekan detayı
 */
const getVenueById = async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id)
      .populate('mayorId', 'name username')
      .lean();

    if (!venue) {
      return res.status(404).json({ success: false, message: 'Mekan bulunamadı' });
    }

    // Son check-in'ler
    const recentCheckins = await CheckIn.find({ venueId: venue._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name username')
      .lean();

    // Kaydeden kullanıcı sayısı + mevcut kullanıcı kaydetmiş mi?
    let isSaved = false;
    if (req.user) {
      const SavedVenue = require('../models/SavedVenue');
      const saved = await SavedVenue.exists({ userId: req.user.userId, venueId: venue._id });
      isSaved = !!saved;
    }

    res.status(200).json({
      success: true,
      data: { venue, recentCheckins, isSaved },
    });
  } catch (error) {
    console.error('getVenueById error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * POST /api/venues
 * Yeni mekan ekle (authenticated)
 */
const createVenue = async (req, res) => {
  try {
    const { name, category, area, city, address, location, description, openingHours, phone, website } = req.body;

    if (!name || !category || !area) {
      return res.status(400).json({ success: false, message: 'name, category ve area zorunludur' });
    }

    const venue = await Venue.create({
      name,
      category,
      area,
      city: city || 'İstanbul',
      address,
      location: location || undefined,
      description,
      openingHours,
      phone,
      website,
      createdBy: req.user.userId,
    });

    res.status(201).json({ success: true, data: { venue } });
  } catch (error) {
    console.error('createVenue error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * POST /api/venues/:id/save   (toggle)
 * Mekanı kaydet / kayıttan çıkar
 */
const toggleSaveVenue = async (req, res) => {
  try {
    const SavedVenue = require('../models/SavedVenue');
    const venueId = req.params.id;
    const userId = req.user.userId;

    const existing = await SavedVenue.findOne({ userId, venueId });
    if (existing) {
      await existing.deleteOne();
      await Venue.findByIdAndUpdate(venueId, { $inc: { savesCount: -1 } });
      return res.status(200).json({ success: true, data: { saved: false } });
    }

    await SavedVenue.create({ userId, venueId });
    await Venue.findByIdAndUpdate(venueId, { $inc: { savesCount: 1 } });
    res.status(200).json({ success: true, data: { saved: true } });
  } catch (error) {
    console.error('toggleSaveVenue error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * GET /api/venues/saved
 * Kullanıcının kaydettiği mekanlar
 */
const getSavedVenues = async (req, res) => {
  try {
    const saved = await SavedVenue.find({ userId: req.user.userId })
      .populate('venueId', 'name category area city')
      .sort({ createdAt: -1 })
      .lean();
    const venues = saved.map(s => s.venueId).filter(Boolean);
    res.status(200).json({ success: true, data: { venues } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

module.exports = { getVenues, getNearbyVenues, getVenueById, createVenue, toggleSaveVenue, getSavedVenues };
