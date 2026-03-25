const nodemailer = require('nodemailer');

/**
 * Nodemailer transporter
 * .env değişkenlerinden SMTP ayarlarını okur.
 * Geliştirme ortamında Ethereal (fake SMTP) kullanılır.
 */
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    // Production: gerçek SMTP (Gmail, SendGrid, vb.)
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Development: Ethereal fake SMTP (otomatik hesap oluşturur)
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('📧 Ethereal test hesabı:', testAccount.user);
  }

  return transporter;
}

/**
 * Şifre sıfırlama e-postası gönder
 */
async function sendPasswordResetEmail(email, resetToken, userName) {
  const t = await getTransporter();

  const resetUrl = `${process.env.APP_URL || 'citybeat://reset-password'}?token=${resetToken}`;

  const info = await t.sendMail({
    from: `"CityBeat" <${process.env.SMTP_FROM || 'noreply@citybeat.app'}>`,
    to: email,
    subject: 'CityBeat — Şifre Sıfırlama',
    text: `Merhaba ${userName},\n\nŞifre sıfırlama isteğin alındı. Aşağıdaki bağlantıya tıkla:\n\n${resetUrl}\n\nBu bağlantı 15 dakika geçerlidir.\n\nEğer bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin.\n\nCityBeat Ekibi`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#0D0D14;color:#FFFFFF;padding:32px;border-radius:16px;">
        <h1 style="color:#6C3CE1;margin-bottom:8px;">CityBeat</h1>
        <h2 style="font-size:20px;margin-bottom:16px;">Şifre Sıfırlama</h2>
        <p style="color:#A0A0B8;">Merhaba <strong style="color:#FFFFFF;">${userName}</strong>,</p>
        <p style="color:#A0A0B8;">Şifre sıfırlama isteğin alındı. Aşağıdaki butona tıkla:</p>
        <a href="${resetUrl}"
           style="display:inline-block;margin:20px 0;padding:14px 28px;background:#6C3CE1;color:#FFFFFF;border-radius:12px;text-decoration:none;font-weight:700;">
          Şifremi Sıfırla
        </a>
        <p style="color:#606078;font-size:13px;">Bu bağlantı <strong>15 dakika</strong> geçerlidir.</p>
        <p style="color:#606078;font-size:13px;">Eğer bu isteği sen yapmadıysan bu e-postayı görmezden gelebilirsin.</p>
        <hr style="border-color:#1A1A2E;margin:24px 0;" />
        <p style="color:#2A2A3A;font-size:11px;text-align:center;">CityBeat — Şehri keşfet, anları paylaş</p>
      </div>
    `,
  });

  // Development'ta preview URL göster
  if (!process.env.SMTP_HOST) {
    console.log('📧 E-posta önizleme URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
}

module.exports = { sendPasswordResetEmail };
