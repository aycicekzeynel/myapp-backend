/**
 * Error Handler Utilities
 * Custom error class ve async error wrapper
 */

/**
 * Custom Application Error Class
 * HTTP hatalarını standart bir yapıda yönetmek için
 */
class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // Bu hatanın operasyonel (beklenen) olduğunu belirtir
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Catch Async Wrapper
 * Async route handler'ları wrap eder ve hataları next()'e iletir
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  AppError,
  catchAsync,
};
