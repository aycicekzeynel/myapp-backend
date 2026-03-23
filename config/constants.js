/**
 * Uygulama Sabitler ve Konfigürasyonlar
 */

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Types
const ERROR_TYPES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  CONFLICT_ERROR: 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
};

// JWT Settings
const JWT_CONFIG = {
  ALGORITHM: 'HS256',
  ISSUER: 'cityexplore-api',
};

// User Roles
const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  USER: 'user',
  GUEST: 'guest',
};

// Rate Limiting
const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 dakika
  MAX_REQUESTS: 100, // Süre içinde max istek sayısı
  AUTH_MAX_REQUESTS: 5, // Login için max istek sayısı
  AUTH_WINDOW_MS: 15 * 60 * 1000, // Login için süre
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

// File Upload
const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/mpeg'],
};

// Cache Settings
const CACHE_CONFIG = {
  ENABLED: true,
  DEFAULT_TTL: 3600, // 1 saat
  SHORT_TTL: 300, // 5 dakika
  LONG_TTL: 86400, // 24 saat
};

// Success Messages
const SUCCESS_MESSAGES = {
  OPERATION_SUCCESS: 'İşlem başarıyla tamamlandı',
  LOGIN_SUCCESS: 'Giriş başarılı',
  SIGNUP_SUCCESS: 'Kayıt başarılı',
  UPDATE_SUCCESS: 'Güncelleme başarılı',
  DELETE_SUCCESS: 'Silme başarılı',
  CREATE_SUCCESS: 'Oluşturma başarılı',
};

// Error Messages
const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Geçersiz kimlik bilgileri',
  TOKEN_EXPIRED: 'Token süresi dolmuş',
  INVALID_TOKEN: 'Geçersiz token',
  TOKEN_REQUIRED: 'Token gereklidir',
  UNAUTHORIZED: 'Yetkilendirme başarısız',
  FORBIDDEN: 'Bu işleme izniniz yok',
  PERMISSION_DENIED: 'Bu işlem için yetkiniz yok',
  NOT_FOUND: 'Kayıt bulunamadı',
  ALREADY_EXISTS: 'Bu kayıt zaten mevcut',
  VALIDATION_FAILED: 'Doğrulama başarısız',
  RATE_LIMIT_EXCEEDED: 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.',
  SERVER_ERROR: 'Sunucu hatası oluştu',
  DATABASE_ERROR: 'Veritabanı hatası oluştu',
  INVALID_FILE: 'Geçersiz dosya türü',
  FILE_TOO_LARGE: 'Dosya çok büyük',
};

// Validation Rules
const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 30,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  PHONE_REGEX: /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/,
};

// Database Collections
const COLLECTIONS = {
  USERS: 'users',
  CITIES: 'cities',
  PLACES: 'places',
  CHECK_INS: 'checkins',
  REVIEWS: 'reviews',
  FOLLOWERS: 'followers',
  NOTIFICATIONS: 'notifications',
};

module.exports = {
  HTTP_STATUS,
  ERROR_TYPES,
  JWT_CONFIG,
  USER_ROLES,
  RATE_LIMIT_CONFIG,
  PAGINATION,
  FILE_UPLOAD,
  CACHE_CONFIG,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
  VALIDATION_RULES,
  COLLECTIONS,
};
