const CheckIn = require('../models/CheckIn');
const Venue = require('../models/Venue');
const Follow = require('../models/Follow');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Görünürlük süresini hesapla
function calcVisibleUntil(visibility) {
  const map = { '3h': 3, '6h': 6, '12h': 12, '24h': 24 };
  if (map[visibility]) return new Date(Date.now() + map[visibility] * 60 * 60 * 1000);
  if (visibility === 'forever') return null;
  if (visibility === 'private') return new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // ~100 yıl
  return new Date(Date.now() + 3 * 60 * 60 * 1000);
}

// Coin hesapla
function calcCoins(userVenueCount, isMayor) {
  let coins = 10; // base
  if (userVenueCount === 1) coins += 5; // ilk check-in bonus
  if (isMayor) coins += 10; // mayor bonus
  return coins;
}

/**
 * POST /api/checkins
 * Check-in oluştur
 */
const createCheckIn = async (req, res) => {
  try {
    const { venueId, note, visibility = '3h', location, photos } = req.body;
    const userId = req.user.userId;

    if (!venueId) {
      return res.status(400).json({ success: false, message: 'venueId zorunludur' });
    }

    const venue = await Venue.findById(venueId);
    if (!venue) {
      return res.status(404).json({ success: false, message: 'Mekan bulunamadı' });
    }

    // Bu kullanıcının bu mekandaki toplam check-in sayısı
    const userVenueCount = await CheckIn.countDocuments({ userId, venueId }) + 1;

    // Mayor kontrolü: mevcut mayor'dan fazla mı?
    const isMayor = userVenueCount > (venue.mayorCheckins || 0);

    const coinsEarned = calcCoins(userVenueCount, isMayor);
    const visibleUntil = calcVisibleUntil(visibility);

    const checkIn = await CheckIn.create({
      userId,
      venueId,
      note,
      visibility,
      visibleUntil,
      userVenueCount,
      coinsEarned,
      photos: Array.isArray(photos) ? photos.slice(0, 5) : [],
      location: location ? { type: 'Point', coordinates: [location.lng, location.lat] } : undefined,
    });

    // Venue istatistiklerini güncelle
    const updateData = { $inc: { checkinsCount: 1 } };
    if (isMayor) {
      updateData.$set = { mayorId: userId, mayorCheckins: userVenueCount };
    }
    await Venue.findByIdAndUpdate(venueId, updateData);

    // Kullanıcı check-in sayısını güncelle
    await User.findByIdAndUpdate(userId, { $inc: { checkinsCount: 1 } });

    // Takipçilere bildirim oluştur (arka planda, hata olursa devam et)
    checkInNotifyFollowers(userId, checkIn._id, venue.name).catch(console.error);

    const populated = await checkIn.populate([
      { path: 'userId', select: 'name username' },
      { path: 'venueId', select: 'name category area' },
    ]);

    res.status(201).json({
      success: true,
      data: { checkIn: populated, coinsEarned, isMayor, userVenueCount },
    });
  } catch (error) {
    console.error('createCheckIn error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

async function checkInNotifyFollowers(userId, checkInId, venueName) {
  // Kullanıcının takipçilerini bul
  const follows = await Follow.find({ followingId: userId, status: 'accepted' }).select('followerId');
  if (!follows.length) return;

  const user = await User.findById(userId).select('name');
  const notifications = follows.map(f => ({
    recipientId: f.followerId,
    senderId: userId,
    type: 'checkin',
    refId: checkInId,
    refModel: 'CheckIn',
    message: `${user.name} ${venueName}'da check-in yaptı.`,
  }));

  await Notification.insertMany(notifications, { ordered: false });
}

/**
 * GET /api/checkins/feed
 * Takip edilen kullanıcıların check-in'leri
 */
const getFeed = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20 } = req.query;

    // Takip edilenlerin ID'leri
    const follows = await Follow.find({ followerId: userId, status: 'accepted' }).select('followingId');
    const followingIds = follows.map(f => f.followingId);
    followingIds.push(userId); // kendi check-in'leri de dahil

    const now = new Date();
    const checkIns = await CheckIn.find({
      userId: { $in: followingIds },
      visibility: { $ne: 'private' },
      $or: [{ visibleUntil: null }, { visibleUntil: { $gt: now } }],
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('userId', 'name username')
      .populate('venueId', 'name category area city')
      .lean();

    // Beğenilmiş mi?
    const checkInIds = checkIns.map(c => c._id);
    const likedCheckins = await CheckIn.find({ _id: { $in: checkInIds }, likes: userId }).select('_id');
    const likedSet = new Set(likedCheckins.map(c => c._id.toString()));

    const result = checkIns.map(c => ({
      ...c,
      liked: likedSet.has(c._id.toString()),
    }));

    res.status(200).json({ success: true, data: { checkIns: result, page: parseInt(page) } });
  } catch (error) {
    console.error('getFeed error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * GET /api/checkins/user/:userId
 * Kullanıcının check-in geçmişi
 */
const getUserCheckIns = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const requesterId = req.user?.userId;

    const filter = { userId };
    if (requesterId !== userId) {
      filter.visibility = { $ne: 'private' };
      filter.$or = [{ visibleUntil: null }, { visibleUntil: { $gt: new Date() } }];
    }

    const checkIns = await CheckIn.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('venueId', 'name category area')
      .lean();

    res.status(200).json({ success: true, data: { checkIns, page: parseInt(page) } });
  } catch (error) {
    console.error('getUserCheckIns error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * POST /api/checkins/:id/like   (toggle)
 */
const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const checkIn = await CheckIn.findById(id);
    if (!checkIn) return res.status(404).json({ success: false, message: 'Check-in bulunamadı' });

    const alreadyLiked = checkIn.likes.includes(userId);
    if (alreadyLiked) {
      checkIn.likes.pull(userId);
      checkIn.likesCount = Math.max(0, checkIn.likesCount - 1);
    } else {
      checkIn.likes.push(userId);
      checkIn.likesCount += 1;

      // Bildirim gönder (kendi check-in'ini beğenmiyorsa)
      if (checkIn.userId.toString() !== userId) {
        const liker = await User.findById(userId).select('name');
        await Notification.create({
          recipientId: checkIn.userId,
          senderId: userId,
          type: 'like',
          refId: checkIn._id,
          refModel: 'CheckIn',
          message: `${liker.name} check-in'ini beğendi.`,
        });
      }
    }

    await checkIn.save();
    res.status(200).json({ success: true, data: { liked: !alreadyLiked, likesCount: checkIn.likesCount } });
  } catch (error) {
    console.error('toggleLike error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

module.exports = { createCheckIn, getFeed, getUserCheckIns, toggleLike };
