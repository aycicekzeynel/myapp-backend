const express = require('express');
const router = express.Router();
const { createCheckIn, getFeed, getUserCheckIns, toggleLike } = require('../controllers/checkInController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.post('/', authenticate, createCheckIn);
router.get('/feed', authenticate, getFeed);
router.get('/user/:userId', optionalAuth, getUserCheckIns);
router.post('/:id/like', authenticate, toggleLike);

module.exports = router;
