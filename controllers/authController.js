const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendPasswordResetEmail } = require('../utils/email');

// Çift bcrypt desteği için - eski kullanıcılar için bcrypt, yeni için bcryptjs
let bcrypt = null;
try {
  bcrypt = require('bcrypt');
  console.log('✅ bcrypt (native) yüklendi - eski kullanıcı desteği aktif');
} catch (err) {
  console.log('⚠️ bcrypt (native) yüklenemedi - sadece bcryptjs kullanılacak');
}

/**
 * Email + Şifre ile Kayıt
 */
const register = async (req, res) => {
  try {
    let { email, password, fullName, username, phone, dateOfBirth } = req.body;

    if (email) email = email.toString().replace(/"/g, '').trim().toLowerCase();
    if (username) username = username.toString().replace(/"/g, '').trim().toLowerCase();
    if (phone) phone = phone.toString().trim();

    console.log('📝 Register request başladı:', { email, fullName, username, phone, dateOfBirth });

    // Validasyon
    if (!email || !password || !fullName || !username || !phone || !dateOfBirth) {
      console.log('❌ Validasyon hatası: Eksik alanlar');
      return res.status(400).json({
        success: false,
        message: 'Email, şifre, ad soyad, kullanıcı adı, telefon ve doğum tarihi zorunludur'
      });
    }

    console.log('✅ Validasyon başarılı');

    // Email kontrolü
    console.log('🔍 Email kontrolü yapılıyor...');
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      console.log('❌ Email zaten kullanımda');
      return res.status(400).json({
        success: false,
        message: 'Bu email zaten kullanılıyor'
      });
    }

    // Username kontrolü
    console.log('🔍 Username kontrolü yapılıyor...');
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      console.log('❌ Username zaten kullanımda');
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı adı zaten kullanılıyor'
      });
    }

    console.log('✅ Email ve username müsait');

    // Şifre hash - Model'in pre('save') hook'u hallediyor, burada ham şifre gönderiyoruz
    // Yeni kullanıcı oluştur - fullName alanını name'e map et
    console.log('👤 Yeni kullanıcı oluşturuluyor...');
    const user = await User.create({
      email,
      password,
      name: fullName,
      username,
      phoneNumber: phone || null,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      authProvider: 'email',
      isEmailVerified: false
    });

    console.log('✅ Kullanıcı oluşturuldu:', user._id);

    // Token oluştur
    console.log('🎫 Token oluşturuluyor...');
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Tokenlar oluşturuldu');

    // Refresh token'ı veritabanına kaydet
    console.log('💾 Refresh token kaydediliyor...');
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    console.log('✅ Refresh token kaydedildi');
    console.log('🎉 Register işlemi başarılı');

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.name,
          username: user.username,
          profilePhoto: user.profilePhoto,
          onboardingCompleted: user.onboardingCompleted
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('❌❌❌ Register error DETAY:', error);
    console.error('Hata mesajı:', error.message);
    console.error('Hata stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Kayıt sırasında bir hata oluştu',
      error: error.message,
      errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Email + Şifre ile Giriş
 * 🔧 Email temizleme ve çift bcrypt desteği eklendi
 */
const login = async (req, res) => {
  try {
    let { email, password } = req.body;
    
    // 🔧 Email temizleme - JSON parse hatası düzeltmesi
    if (email) {
      email = email.toString().replace(/"/g, '').trim().toLowerCase();
    }

    console.log('🔐 Login request başladı:', { email, cleanedEmail: email });

    // Validasyon
    if (!email || !password) {
      console.log('❌ Validasyon hatası: Email veya şifre eksik');
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre zorunludur'
      });
    }

    console.log('🔍 Kullanıcı aranıyor...');
    // Kullanıcıyı bul - password alanını da getir (select: false olduğu için +password)
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı');
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    console.log('✅ Kullanıcı bulundu:', user._id);
    console.log('🔐 Password var mı?', !!user.password);
    console.log('🔐 Password hash (ilk 30 karakter):', user.password ? user.password.substring(0, 30) + '...' : 'YOK');

    // 🔧 Çift bcrypt desteği - önce bcryptjs, sonra bcrypt (eski kullanıcılar için)
    console.log('🔐 Şifre kontrol ediliyor...');
    let isPasswordValid = false;

    // Önce bcryptjs ile dene (yeni kullanıcılar)
    try {
      console.log('🔐 bcryptjs ile deneniyor...');
      isPasswordValid = await bcryptjs.compare(password, user.password);
      console.log('🔐 bcryptjs sonucu:', isPasswordValid);
    } catch (err) {
      console.log('⚠️ bcryptjs compare hatası:', err.message);
    }

    // Eğer bcryptjs başarısız olursa ve bcrypt mevcutsa, bcrypt ile dene (eski kullanıcılar)
    if (!isPasswordValid && bcrypt) {
      try {
        console.log('🔐 bcrypt (native) ile deneniyor...');
        isPasswordValid = await bcrypt.compare(password, user.password);
        console.log('🔐 bcrypt (native) sonucu:', isPasswordValid);

        // Eğer bcrypt ile başarılıysa, şifreyi bcryptjs ile yeniden hash'le (migration)
        if (isPasswordValid) {
          console.log('🔄 Eski kullanıcı tespit edildi - şifre bcryptjs ile güncelleniyor...');
          const newHash = await bcryptjs.hash(password, 12);
          user.password = newHash;
          await user.save();
          console.log('✅ Şifre bcryptjs ile güncellendi');
        }
      } catch (err) {
        console.log('⚠️ bcrypt (native) compare hatası:', err.message);
      }
    }
    
    if (!isPasswordValid) {
      console.log('❌ Şifre yanlış (hem bcryptjs hem bcrypt denendi)');
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    console.log('✅ Şifre doğru');

    // Token oluştur
    console.log('🎫 Token oluşturuluyor...');
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    console.log('✅ Tokenlar oluşturuldu');

    // Refresh token'ı veritabanına kaydet
    console.log('💾 Refresh token kaydediliyor...');
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    // Son giriş zamanını güncelle
    user.lastLoginAt = new Date();
    await user.save();

    console.log('🎉 Login işlemi başarılı');

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.name,
          username: user.username,
          profilePhoto: user.profilePhoto,
          isPremium: user.isPremium,
          onboardingCompleted: user.onboardingCompleted
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('❌❌❌ Login error DETAY:', error);
    console.error('Hata mesajı:', error.message);
    console.error('Hata stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu',
      error: error.message,
      errorDetails: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

/**
 * Google OAuth Giriş/Kayıt
 */
const googleAuth = async (req, res) => {
  try {
    const { googleToken } = req.body;

    if (!googleToken) {
      return res.status(400).json({ success: false, message: 'Google token zorunludur' });
    }

    // Google access token ile kullanıcı bilgilerini al
    const googleRes = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${googleToken}`
    );

    if (!googleRes.ok) {
      return res.status(401).json({ success: false, message: 'Geçersiz Google token' });
    }

    const payload = await googleRes.json();
    // payload: { sub, email, name, picture, email_verified }

    if (!payload.email) {
      return res.status(400).json({ success: false, message: 'Google hesabından email alınamadı' });
    }

    // Kullanıcıyı bul veya oluştur
    let isNewUser = false;
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      // Email ile daha önce kayıt olduysa hesapları birleştir
      user = await User.findOne({ email: payload.email.toLowerCase() });

      if (user) {
        user.googleId = payload.sub;
        user.isEmailVerified = true;
        if (!user.profilePhoto && payload.picture) user.profilePhoto = payload.picture;
        await user.save();
      } else {
        // Email'den otomatik username üret
        let baseUsername = payload.email
          .split('@')[0]
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '')
          .substring(0, 20);

        if (baseUsername.length < 3) baseUsername = 'user' + baseUsername;

        // Benzersiz username bul
        let finalUsername = baseUsername;
        let suffix = 1;
        while (await User.findOne({ username: finalUsername })) {
          finalUsername = `${baseUsername}${suffix++}`;
        }

        user = await User.create({
          googleId: payload.sub,
          email: payload.email.toLowerCase(),
          name: payload.name || payload.email.split('@')[0],
          username: finalUsername,
          profilePhoto: payload.picture || null,
          authProvider: 'google',
          isEmailVerified: true
        });
        isNewUser = true;
      }
    } else {
      user.lastLoginAt = new Date();
      await user.save();
    }

    // Token oluştur
    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Refresh token'ı veritabanına kaydet
    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    res.status(200).json({
      success: true,
      message: isNewUser ? 'Hesabın oluşturuldu, hoş geldin!' : 'Hoş geldin!',
      data: {
        isNewUser,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.name,
          username: user.username,
          profilePhoto: user.profilePhoto,
          isPremium: user.isPremium,
          onboardingCompleted: user.onboardingCompleted
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      message: 'Google giriş sırasında bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Refresh Token ile Yeni Access Token Al
 */
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token zorunludur'
      });
    }

    // Token'ı doğrula
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz refresh token'
      });
    }

    // Veritabanında kontrol et
    const tokenRecord = await RefreshToken.findOne({
      token: refreshToken,
      userId: decoded.userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() }
    });

    if (!tokenRecord) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token bulunamadı veya geçersiz'
      });
    }

    // Yeni access token oluştur
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Token yenileme sırasında bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Çıkış Yap (Refresh Token'ı Revoke Et)
 */
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await RefreshToken.updateOne(
        { token: refreshToken },
        { isRevoked: true }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Çıkış başarılı'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Çıkış sırasında bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Şifre Sıfırlama E-postası Gönder
 * POST /api/auth/forgot-password
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'E-posta adresi zorunludur' });
    }

    const user = await User.findOne({ email: email.toLowerCase(), isDeleted: false });

    // Güvenlik: kullanıcı bulunsun ya da bulunmasın aynı yanıtı ver
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.resetToken = hashedToken;
      user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika
      await user.save({ validateBeforeSave: false });

      try {
        await sendPasswordResetEmail(user.email, resetToken, user.name);
      } catch (emailError) {
        // E-posta gönderilemese de token'ı temizle
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save({ validateBeforeSave: false });
        console.error('E-posta gönderme hatası:', emailError);
        return res.status(500).json({ success: false, message: 'E-posta gönderilemedi, lütfen tekrar dene' });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Eğer bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * Şifre Sıfırla
 * POST /api/auth/reset-password
 */
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token ve yeni şifre zorunludur' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Şifre en az 6 karakter olmalıdır' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpires: { $gt: Date.now() },
      isDeleted: false,
    }).select('+resetToken +resetTokenExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Geçersiz veya süresi dolmuş sıfırlama bağlantısı' });
    }

    user.password = password;
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    // Tüm refresh token'ları iptal et (güvenlik için)
    await RefreshToken.deleteMany({ userId: user._id });

    res.status(200).json({ success: true, message: 'Şifren başarıyla güncellendi. Giriş yapabilirsin.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

// EXPORT EDİLEN FONKSİYONLAR
module.exports = {
  register,
  login,
  googleAuth,
  refreshAccessToken,
  logout,
  forgotPassword,
  resetPassword,
};
