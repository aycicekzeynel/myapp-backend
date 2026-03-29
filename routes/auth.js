const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   GET /api/auth/test
 * @desc    Auth route test endpoint
 * @access  Public
 */
router.get('/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth route çalışıyor',
    availableEndpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/google',
      'POST /api/auth/refresh',
      'POST /api/auth/logout',
    ],
    timestamp: new Date(),
  });
});

/**
 * @route   POST /api/auth/register
 * @desc    Email + Şifre ile kayıt
 * @access  Public
 */
router.post('/register', authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Email + Şifre ile giriş
 * @access  Public
 */
router.post('/login', authController.login);

/**
 * @route   POST /api/auth/google
 * @desc    Google OAuth ile giriş/kayıt
 * @access  Public
 */
router.post('/google', authController.googleAuth);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh token ile yeni access token al
 * @access  Public
 */
router.post('/refresh', authController.refreshAccessToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Çıkış yap (refresh token revoke)
 * @access  Public
 */
router.post('/logout', authController.logout);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Şifre sıfırlama e-postası gönder
 * @access  Public
 */
router.post('/forgot-password', authController.forgotPassword);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Token ile şifre sıfırla
 * @access  Public
 */
router.post('/reset-password', authController.resetPassword);

/**
 * @route   POST /api/auth/change-password
 * @desc    Giriş yapılıyken şifre değiştir
 * @access  Private
 */
router.post('/change-password', authenticate, authController.changePassword);

module.exports = router;
