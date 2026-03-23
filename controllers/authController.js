const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * Email + Şifre ile Kayıt
 */
const register = async (req, res) => {
  try {
    console.log('📝 Register request başladı:', req.body);
    
    const { email, password, fullName, username, dateOfBirth } = req.body;

    // Validasyon
    if (!email || !password || !fullName || !username) {
      console.log('❌ Validasyon hatası: Eksik alanlar');
      return res.status(400).json({
        success: false,
        message: 'Email, şifre, ad soyad ve kullanıcı adı zorunludur'
      });
    }

    console.log('✅ Validasyon başarılı');

    // Email kontrolü
    console.log('🔍 Email kontrolü yapılıyor...');
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      console.log('❌ Email zaten kullanımda');
      return res.status(400).json({
        success: false,
        message: 'Bu email zaten kullanılıyor'
      });
    }

    // Username kontrolü
    console.log('🔍 Username kontrolü yapılıyor...');
    const existingUsername = await User.findOne({ username: username.toLowerCase() });
    if (existingUsername) {
      console.log('❌ Username zaten kullanımda');
      return res.status(400).json({
        success: false,
        message: 'Bu kullanıcı adı zaten kullanılıyor'
      });
    }

    console.log('✅ Email ve username müsait');

    // Şifre hash
    console.log('🔐 Şifre hash ediliyor...');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('✅ Şifre hash edildi');

    // Yeni kullanıcı oluştur
    console.log('👤 Yeni kullanıcı oluşturuluyor...');
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      fullName,
      username: username.toLowerCase(),
      dateOfBirth: dateOfBirth || null,
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
          fullName: user.fullName,
          username: user.username,
          profilePhoto: user.profilePhoto
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
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validasyon
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre zorunludur'
      });
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
    }

    // Şifre kontrolü
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email veya şifre hatalı'
      });
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

    // Son giriş zamanını güncelle
    user.lastLoginAt = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          username: user.username,
          profilePhoto: user.profilePhoto,
          isPremium: user.isPremium
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Giriş sırasında bir hata oluştu',
      error: error.message
    });
  }
};

/**
 * Google OAuth Giriş/Kayıt
 */
const googleAuth = async (req, res) => {
  try {
    const { googleToken, fullName, username } = req.body;

    // Validasyon
    if (!googleToken) {
      return res.status(400).json({
        success: false,
        message: 'Google token zorunludur'
      });
    }

    // TODO: Google token doğrulama
    // const { OAuth2Client } = require('google-auth-library');
    // const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    // const ticket = await client.verifyIdToken({ idToken: googleToken });
    // const payload = ticket.getPayload();

    // Geçici - Mock Google payload
    const payload = {
      sub: 'google_' + Date.now(), // Google User ID
      email: req.body.email || 'test@gmail.com',
      name: fullName || 'Test User',
      picture: req.body.picture || null
    };

    // Kullanıcıyı bul veya oluştur
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      // Email ile varsa birleştir
      user = await User.findOne({ email: payload.email.toLowerCase() });

      if (user) {
        user.googleId = payload.sub;
        user.isEmailVerified = true;
        await user.save();
      } else {
        // Yeni kullanıcı oluştur
        if (!username) {
          return res.status(400).json({
            success: false,
            message: 'Yeni kullanıcılar için kullanıcı adı zorunludur'
          });
        }

        // Username kontrolü
        const existingUsername = await User.findOne({ username: username.toLowerCase() });
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: 'Bu kullanıcı adı zaten kullanılıyor'
          });
        }

        user = await User.create({
          googleId: payload.sub,
          email: payload.email.toLowerCase(),
          fullName: payload.name,
          username: username.toLowerCase(),
          profilePhoto: payload.picture,
          authProvider: 'google',
          isEmailVerified: true
        });
      }
    } else {
      // Mevcut kullanıcı - son giriş zamanını güncelle
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
      message: 'Google ile giriş başarılı',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          username: user.username,
          profilePhoto: user.profilePhoto,
          isPremium: user.isPremium
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

// EXPORT EDİLEN FONKSİYONLAR
module.exports = {
  register,
  login,
  googleAuth,
  refreshAccessToken,
  logout
};
