/**
 * Helper Functions
 * Yaygın olarak kullanılan fonksiyonlar
 */

const bcrypt = require('bcryptjs');

/**
 * Hash password
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
  try {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Şifre hashleme hatası: ' + error.message);
  }
};

/**
 * Compare password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error('Şifre karşılaştırma hatası: ' + error.message);
  }
};

/**
 * Generate random string
 * @param {number} length - String length
 * @returns {string}
 */
const generateRandomString = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Generate OTP (One Time Password)
 * @param {number} length - OTP length
 * @returns {string}
 */
const generateOTP = (length = 6) => {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1))
    .toString()
    .slice(0, length);
};

/**
 * Truncate text
 * @param {string} text - Text to truncate
 * @param {number} length - Max length
 * @returns {string}
 */
const truncateText = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

/**
 * Format date
 * @param {Date} date - Date to format
 * @param {string} format - Format string
 * @returns {string}
 */
const formatDate = (date, format = 'DD-MM-YYYY') => {
  if (!date) return '';

  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  const formats = {
    'YYYY-MM-DD': `${year}-${month}-${day}`,
    'DD-MM-YYYY': `${day}-${month}-${year}`,
    'DD/MM/YYYY': `${day}/${month}/${year}`,
    'YYYY-MM-DD HH:MM:SS': `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`,
    'DD-MM-YYYY HH:MM:SS': `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`,
  };

  return formats[format] || formats['YYYY-MM-DD'];
};

/**
 * Time ago
 * @param {Date} date - Date to compare
 * @returns {string}
 */
const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + ' yıl önce';

  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + ' ay önce';

  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + ' gün önce';

  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + ' saat önce';

  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + ' dakika önce';

  return Math.floor(seconds) + ' saniye önce';
};

/**
 * Clean object
 * @param {Object} obj - Object to clean
 * @returns {Object}
 */
const cleanObject = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach((key) => {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      cleaned[key] = obj[key];
    }
  });
  return cleaned;
};

/**
 * Deep merge objects
 * @param {Object} target - Target object
 * @param {...Object} sources - Source objects
 * @returns {Object}
 */
const deepMerge = (target, ...sources) => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (typeof target === 'object' && typeof source === 'object') {
    for (const key in source) {
      if (typeof source[key] === 'object') {
        if (!target[key]) Object.assign(target, { [key]: {} });
        deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return deepMerge(target, ...sources);
};

/**
 * Paginate array
 * @param {Array} array - Array to paginate
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Object}
 */
const paginate = (array, page = 1, limit = 20) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const items = array.slice(startIndex, endIndex);

  return {
    items,
    pagination: {
      page,
      limit,
      total: array.length,
      pages: Math.ceil(array.length / limit),
      hasNextPage: endIndex < array.length,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Extract coordinates from string
 * @param {string} coordsString - "lat,lng" format
 * @returns {Object|null}
 */
const parseCoordinates = (coordsString) => {
  if (!coordsString) return null;

  const parts = coordsString.split(',');
  if (parts.length !== 2) return null;

  const lat = parseFloat(parts[0]);
  const lng = parseFloat(parts[1]);

  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

  return { lat, lng };
};

/**
 * Calculate distance between two points (Haversine formula)
 * @param {number} lat1 - Latitude 1
 * @param {number} lon1 - Longitude 1
 * @param {number} lat2 - Latitude 2
 * @param {number} lon2 - Longitude 2
 * @returns {number} Distance in kilometers
 */
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Dünya yarıçapı km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomString,
  generateOTP,
  truncateText,
  formatDate,
  timeAgo,
  cleanObject,
  deepMerge,
  paginate,
  parseCoordinates,
  calculateDistance,
};
