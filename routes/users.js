const express = require('express');
const router = express.Router();
const { updateOnboarding } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   PATCH /api/users/me/onboarding
 * @desc    Onboarding tercihlerini kaydet
 * @access  Private
 */
router.patch('/me/onboarding', authenticate, updateOnboarding);

module.exports = router;
