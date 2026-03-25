const User = require('../models/User');
const Follow = require('../models/Follow');
const CheckIn = require('../models/CheckIn');
const Notification = require('../models/Notification');

/**
 * PATCH /api/users/me/onboarding
 */
const updateOnboarding = async (req, res) => {
  try {
    const { city, cityIntent, venueCategories, vibe, locationConsent, contactsConsent, notifConsent } = req.body;
    const userId = req.user.userId;

    await User.findByIdAndUpdate(
      userId,
      {
        onboardingCompleted: true,
        preferences: { city, cityIntent, venueCategories, vibe, locationConsent, contactsConsent, notifConsent },
      },
      { new: true }
    );

    res.status(200).json({ success: true, data: { onboardingCompleted: true } });
  } catch (error) {
    console.error('updateOnboarding error:', error);
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * GET /api/users/me
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * PATCH /api/users/me
 */
const updateMe = async (req, res) => {
  try {
    const { fullName, username, bio } = req.body;
    const updates = {};
    if (fullName) updates.name = fullName;
    if (username) updates.username = username.toLowerCase();
    if (bio !== undefined) updates.bio = bio;

    if (updates.username) {
      const existing = await User.findOne({ username: updates.username, _id: { $ne: req.user.userId } });
      if (existing) return res.status(400).json({ success: false, message: 'Bu kullanıcı adı zaten alınmış' });
    }

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true }).lean();
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * GET /api/users/:id
 */
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user || user.isDeleted) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });

    let isFollowing = false;
    let followStatus = null;
    if (req.user) {
      const follow = await Follow.findOne({ followerId: req.user.userId, followingId: req.params.id });
      isFollowing = !!follow;
      followStatus = follow?.status || null;
    }

    const recentCheckins = await CheckIn.find({ userId: user._id, visibility: { $ne: 'private' } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('venueId', 'name category area')
      .lean();

    res.status(200).json({
      success: true,
      data: { user: { ...user, password: undefined }, isFollowing, followStatus, recentCheckins },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * POST /api/users/:id/follow  (toggle)
 */
const toggleFollow = async (req, res) => {
  try {
    const followingId = req.params.id;
    const followerId = req.user.userId;

    if (followerId === followingId) {
      return res.status(400).json({ success: false, message: 'Kendinizi takip edemezsiniz' });
    }

    const targetUser = await User.findById(followingId);
    if (!targetUser) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });

    const existing = await Follow.findOne({ followerId, followingId });
    if (existing) {
      await existing.deleteOne();
      await User.findByIdAndUpdate(followerId, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(followingId, { $inc: { followersCount: -1 } });
      return res.status(200).json({ success: true, data: { following: false } });
    }

    const status = targetUser.isPrivate ? 'pending' : 'accepted';
    await Follow.create({ followerId, followingId, status });

    if (status === 'accepted') {
      await User.findByIdAndUpdate(followerId, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(followingId, { $inc: { followersCount: 1 } });
    }

    const follower = await User.findById(followerId).select('name');
    const msg = status === 'pending'
      ? `${follower.name} seni takip etmek istiyor.`
      : `${follower.name} seni takip etmeye başladı.`;

    await Notification.create({ recipientId: followingId, senderId: followerId, type: 'follow', message: msg });
    res.status(200).json({ success: true, data: { following: true, status } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * GET /api/users/search
 */
const searchUsers = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    if (!q) return res.status(400).json({ success: false, message: 'q parametresi zorunludur' });

    const users = await User.find({
      isDeleted: false,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { username: { $regex: q, $options: 'i' } },
      ],
    })
      .select('name username followersCount checkinsCount')
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * GET /api/users/leaderboard
 * Haftalık liderlik tablosu
 */
const getLeaderboard = async (req, res) => {
  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const results = await CheckIn.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      { $group: { _id: '$userId', weeklyCheckins: { $sum: 1 }, coinsEarned: { $sum: '$coinsEarned' } } },
      { $sort: { coinsEarned: -1, weeklyCheckins: -1 } },
      { $limit: 50 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      {
        $project: {
          userId: '$_id',
          weeklyCheckins: 1,
          coinsEarned: 1,
          'user.name': 1,
          'user.username': 1,
          'user.checkinsCount': 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: { leaderboard: results } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

module.exports = { updateOnboarding, getMe, updateMe, getUserById, toggleFollow, searchUsers, getLeaderboard };
