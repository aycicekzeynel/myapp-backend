/**
 * Validasyon Fonksiyonları
 * Input validation ve sanitization için yardımcı fonksiyonlar
 */

/**
 * Email doğrulama
 * @param {String} email - Email adresi
 * @returns {Boolean} - Geçerli email ise true
 */
const validateEmail = (email) => {
  const emailRegex = /^[\\w([\\.-]?\\w+)*@\\w+([\\.-]?\\w+)*(\\.\\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Şifre doğrulama
 * - En az 6 karakter
 * - En az 1 harf ve 1 rakam (opsiyonel: güvenlik için)
 * @param {String} password - Şifre
 * @returns {Boolean} - Geçerli şifre ise true
 */
const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return false;
  }

  // Güvenlik: en az 1 harf, 1 rakam ve 1 özel karakter
  // const strongRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/.test(password);
  // return strongRegex;

  // Basit: 6+ karakter
  return true;
};

/**
 * Telefon numarası doğrulama (Türkiye)
 * Accepts: +905551234567, 05551234567, 5551234567
 * @param {String} phoneNumber - Telefon numarası
 * @returns {Boolean} - Geçerli telefon ise true
 */
const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return false;

  // Tüm boşluk ve karakterleri kaldır
  const cleaned = phoneNumber.replace(/[^0-9]/g, '');

  // Türkiye: +90 veya 0 ile başlayan 10 haneli
  if (cleaned.startsWith('90')) {
    return cleaned.length === 12; // 90 + 10 hane
  }

  if (cleaned.startsWith('0')) {
    return cleaned.length === 11; // 0 + 10 hane
  }

  return cleaned.length === 10; // Sadece 10 hane
};

/**
 * Kullanıcı adı doğrulama
 * - 3-30 karakter
 * - Sadece a-z, 0-9, ., -, _ karakterleri
 * @param {String} username - Kullanıcı adı
 * @returns {Boolean} - Geçerli username ise true
 */
const validateUsername = (username) => {
  if (!username || username.length < 3 || username.length > 30) {
    return false;
  }

  return /^[a-z0-9_.-]+$/.test(username);
};

/**
 * Ad/Soyad doğrulama
 * - 2-50 karakter
 * - Sadece harfler, boşluk ve bazı karakterler
 * @param {String} name - Ad/Soyad
 * @returns {Boolean} - Geçerli name ise true
 */
const validateName = (name) => {
  if (!name || name.length < 2 || name.length > 50) {
    return false;
  }

  // Sadece harfler, boşluk, tire ve apostrof
  return /^[a-zA-Zçğıöşüß\\s\\-']+$/.test(name);
};

/**
 * URL doğrulama
 * @param {String} url - URL
 * @returns {Boolean} - Geçerli URL ise true
 */
const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * OTP kodu doğrulama
 * - 6 haneli rakam
 * @param {String} code - OTP kodu
 * @returns {Boolean} - Geçerli OTP ise true
 */
const validateOTPCode = (code) => {
  return /^[0-9]{6}$/.test(code);
};

/**
 * UUID doğrulama
 * @param {String} uuid - UUID
 * @returns {Boolean} - Geçerli UUID ise true
 */
const validateUUID = (uuid) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Konum koordinatları doğrulama (lat/lng)
 * @param {Number} lat - Enlem (-90 ile 90 arası)
 * @param {Number} lng - Boylam (-180 ile 180 arası)
 * @returns {Boolean} - Geçerli konum ise true
 */
const validateCoordinates = (lat, lng) => {
  return (
    typeof lat === 'number' &&
    typeof lng === 'number' &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Biyografi (bio) doğrulama
 * - En fazla 500 karakter
 * - XSS saldırılarına karşı temizleme
 * @param {String} bio - Biyografi
 * @returns {Boolean} - Geçerli bio ise true
 */
const validateBio = (bio) => {
  if (!bio) return true; // Opsiyonel
  if (bio.length > 500) return false;

  // Tehlikeli HTML tag'ları içermiyorum mu kontrol et
  const dangerousPatterns = /<script|<iframe|javascript:|onerror|onload/gi;
  return !dangerousPatterns.test(bio);
};

module.exports = {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateUsername,
  validateName,
  validateURL,
  validateOTPCode,
  validateUUID,
  validateCoordinates,
  validateBio,
};
