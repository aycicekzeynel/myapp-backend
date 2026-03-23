/**
 * Request Logger Middleware
 * Tüm gelen requestleri loglar
 */

const morgan = require('morgan');

/**
 * Custom Morgan Format
 */
const customMorganFormat = ':method :url :status :response-time ms - :res[content-length]';

/**
 * Geliştirme ortamı için logger
 */
const developmentLogger = morgan((tokens, req, res) => {
  const status = tokens.status(req, res);
  const method = tokens.method(req, res);
  const url = tokens.url(req, res);
  const responseTime = tokens['response-time'](req, res);

  let statusColor = '\x1b[32m'; // Green
  if (status >= 400 && status < 500) statusColor = '\x1b[33m'; // Yellow
  if (status >= 500) statusColor = '\x1b[31m'; // Red

  return `${method} ${url} ${statusColor}${status}\x1b[0m ${responseTime}ms`;
});

/**
 * Production ortamı için logger
 */
const productionLogger = morgan(customMorganFormat);

/**
 * Skip logs fonksiyonu
 * Health check vb istekleri loglamayız
 */
const skipLogs = (req, res) => {
  const skipPaths = ['/health', '/api/health', '/metrics'];
  return skipPaths.includes(req.path);
};

/**
 * Request ID Middleware
 * Her request için unique ID oluşturur
 */
const requestIdMiddleware = (req, res, next) => {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

module.exports = {
  developmentLogger,
  productionLogger,
  skipLogs,
  requestIdMiddleware,
};
