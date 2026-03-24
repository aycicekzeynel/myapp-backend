const User = require('../models/User');

/**
 * Onboarding tercihlerini kaydet ve tamamlandı olarak işaretle
 */
const updateOnboarding = async (req, res) => {
  try {
    const { city, cityIntent, venueCategories, vibe, locationConsent, contactsConsent, notifConsent } = req.body;
    const userId = req.user.userId;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        onboardingCompleted: true,
        preferences: {
          city: city || null,
          cityIntent: cityIntent || null,
          venueCategories: venueCategories || [],
          vibe: vibe || null,
          locationConsent: locationConsent ?? null,
          contactsConsent: contactsConsent ?? null,
          notifConsent: notifConsent ?? null,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding tamamlandı',
      data: { onboardingCompleted: true },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Onboarding güncellenirken bir hata oluştu',
      error: error.message,
    });
  }
};

module.exports = { updateOnboarding };
