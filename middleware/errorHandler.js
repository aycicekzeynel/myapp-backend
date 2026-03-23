/**
 * Global Error Handler Middleware
 * Tüm hataları merkezi bir yerden yönetir
 */

const { HTTP_STATUS, ERROR_TYPES, ERROR_MESSAGES } = require('../config/constants');

/**
 * Custom Error Class
 */
class AppError extends Error {
  constructor(message, statusCode, errorType = ERROR_TYPES.INTERNAL_SERVER_ERROR) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Global Error Handler Middleware
 * @param {Error} err - Error nesnesi
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 */
const errorHandler = (err, req, res, next) => {
  // Default hata değerleri
  let error = {
    message: err.message || ERROR_MESSAGES.SERVER_ERROR,
    statusCode: err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errorType: err.errorType || ERROR_TYPES.INTERNAL_SERVER_ERROR,
    timestamp: new Date(),
  };

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    error = {
      message: messages,
      statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY,
      errorType: ERROR_TYPES.VALIDATION_ERROR,
      timestamp: new Date(),
      errors: Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {}),
    };
  }

  // Mongoose Cast Error (Invalid ID)
  if (err.name === 'CastError') {
    error = {
      message: 'Geçersiz ID formatı',
      statusCode: HTTP_STATUS.BAD_REQUEST,
      errorType: ERROR_TYPES.VALIDATION_ERROR,
      timestamp: new Date(),
    };
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      message: `${field} zaten mevcut`,
      statusCode: HTTP_STATUS.CONFLICT,
      errorType: ERROR_TYPES.CONFLICT_ERROR,
      timestamp: new Date(),
      field,
    };
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      message: ERROR_MESSAGES.INVALID_TOKEN,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      errorType: ERROR_TYPES.AUTHENTICATION_ERROR,
      timestamp: new Date(),
    };
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      message: ERROR_MESSAGES.TOKEN_EXPIRED,
      statusCode: HTTP_STATUS.UNAUTHORIZED,
      errorType: ERROR_TYPES.AUTHENTICATION_ERROR,
      timestamp: new Date(),
    };
  }

  // Development ortamında detaylı hata bilgisi
  if (process.env.NODE_ENV === 'development') {
    error.stack = err.stack;
    error.originalError = err;
  }

  // Hata loglama
  console.error(`
  ❌ Error Occurred
  ├─ Type: ${error.errorType}
  ├─ Status: ${error.statusCode}
  ├─ Message: ${error.message}
  ├─ Method: ${req.method}
  ├─ Path: ${req.path}
  └─ Timestamp: ${error.timestamp}
  `);

  // Response gönder
  res.status(error.statusCode).json({
    success: false,
    error: {
      type: error.errorType,
      message: error.message,
      ...(error.errors && { fields: error.errors }),
      ...(error.field && { field: error.field }),
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
    timestamp: error.timestamp,
    requestId: req.id,
  });
};

/**
 * Not Found Handler
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 */
const notFoundHandler = (req, res) => {
  const error = new AppError(
    `${req.method} ${req.path} endpoint'i bulunamadı`,
    HTTP_STATUS.NOT_FOUND,
    ERROR_TYPES.NOT_FOUND_ERROR
  );
  errorHandler(error, req, res);
};

/**
 * Async Error Wrapper
 * Async fonksiyonlardaki hataları catch etmek için kullanılır
 * @param {Function} fn - Wrap edilecek async fonksiyon
 * @returns {Function}
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
};
