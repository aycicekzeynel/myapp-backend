const express = require('express');
const router = express.Router();
const { getVenues, getNearbyVenues, getVenueById, createVenue, toggleSaveVenue, getSavedVenues } = require('../controllers/venueController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getVenues);
router.get('/nearby', optionalAuth, getNearbyVenues);
router.get('/saved', authenticate, getSavedVenues);
router.get('/:id', optionalAuth, getVenueById);
router.post('/', authenticate, createVenue);
router.post('/:id/save', authenticate, toggleSaveVenue);

module.exports = router;
