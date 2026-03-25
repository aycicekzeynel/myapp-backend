/**
 * Authentication Middleware
 * JWT token doğrulama ve yetkilendirme
 */

const jwt = require('jsonwebtoken');
const { HTTP_STATUS, ERROR_MESSAGES } = require('../config/constants');

/**
 * authenticateToken - JWT token doğrulama middleware'i
 * Authorization header'dan token'ı okur ve doğrular
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Token'ı header'dan al
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_REQUIRED,
      });
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key-change-this');

    // User bilgilerini request'e ekle
    // authController'dan gelen token yapısına uygun
    req.user = {
      userId: decoded.userId || decoded.id, // Backward compatibility
      id: decoded.userId || decoded.id,
      email: decoded.email,
      role: decoded.role,
      type: decoded.type,
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
      });
    }

    return res.status(HTTP_STATUS.SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * optionalAuthenticateToken - Opsiyonel authentication
 * Token varsa doğrula, yoksa devam et
 */
const optionalAuthenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key-change-this');
      req.user = {
        userId: decoded.userId || decoded.id,
        id: decoded.userId || decoded.id,
        email: decoded.email,
        role: decoded.role,
        type: decoded.type,
      };
    }

    next();
  } catch (error) {
    // Token varsa ama geçersizse error, yoksa devam et
    next();
  }
};

/**
 * authorize - Role bazlı yetkilendirme
 * @param {...string} roles - İzin verilen roller
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_REQUIRED,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.PERMISSION_DENIED,
      });
    }

    next();
  };
};

/**
 * authenticate - Alias for authenticateToken
 * Backward compatibility için
 */
const authenticate = authenticateToken;

const optionalAuth = optionalAuthenticateToken;

module.exports = {
  authenticateToken,
  optionalAuthenticateToken,
  authorize,
  authenticate,
  optionalAuth,
};
