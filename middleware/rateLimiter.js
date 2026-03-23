/**
 * Rate Limiter Middleware
 * API endpoint'leri için rate limiting
 */

const rateLimit = require('express-rate-limit');

/**
 * Genel API Limiter
 * 15 dakikada 100 istek
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100,
  message: {
    success: false,
    message: 'Çok fazla istek. Lütfen 15 dakika sonra tekrar deneyin.',
    error: 'TOO_MANY_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login Limiter
 * 15 dakikada 10 giriş denemesi
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 10,
  message: {
    success: false,
    message: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
    error: 'TOO_MANY_LOGIN_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Signup Limiter
 * 1 saatte 5 kayıt
 */
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5,
  message: {
    success: false,
    message: 'Çok fazla kayıt denemesi. Lütfen 1 saat sonra tekrar deneyin.',
    error: 'TOO_MANY_SIGNUP_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP Limiter
 * 10 dakikada 5 OTP isteği
 */
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 dakika
  max: 5,
  message: {
    success: false,
    message: 'Çok fazla OTP isteği. Lütfen 10 dakika sonra tekrar deneyin.',
    error: 'TOO_MANY_OTP_REQUESTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Password Reset Limiter
 * 1 saatte 3 şifre sıfırlama isteği
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3,
  message: {
    success: false,
    message: 'Çok fazla şifre sıfırlama isteği. Lütfen 1 saat sonra tekrar deneyin.',
    error: 'TOO_MANY_PASSWORD_RESET_ATTEMPTS'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth Limiter (Generic - backward compatibility)
 */
const authLimiter = loginLimiter;

module.exports = {
  generalLimiter,
  loginLimiter,
  signupLimiter,
  otpLimiter,
  passwordResetLimiter,
  authLimiter,
};
