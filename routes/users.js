const express = require('express');
const router = express.Router();
const {
  updateOnboarding, getMe, updateMe, getUserById,
  toggleFollow, searchUsers, getLeaderboard,
} = require('../controllers/userController');
const { authenticate, optionalAuth } = require('../middleware/auth');

router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);
router.patch('/me/onboarding', authenticate, updateOnboarding);
router.get('/search', optionalAuth, searchUsers);
router.get('/leaderboard', authenticate, getLeaderboard);
router.get('/:id', optionalAuth, getUserById);
router.post('/:id/follow', authenticate, toggleFollow);

module.exports = router;
