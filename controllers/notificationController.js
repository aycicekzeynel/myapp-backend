const Notification = require('../models/Notification');

/**
 * GET /api/notifications
 */
const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 30 } = req.query;
    const userId = req.user.userId;

    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('senderId', 'name username')
      .lean();

    const unreadCount = await Notification.countDocuments({ recipientId: userId, read: false });

    res.status(200).json({ success: true, data: { notifications, unreadCount, page: parseInt(page) } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Tümünü okundu yap
 */
const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipientId: req.user.userId, read: false }, { read: true });
    res.status(200).json({ success: true, message: 'Tüm bildirimler okundu olarak işaretlendi' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

/**
 * PATCH /api/notifications/:id/read
 */
const markOneRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, recipientId: req.user.userId },
      { read: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Sunucu hatası', error: error.message });
  }
};

module.exports = { getNotifications, markAllRead, markOneRead };
