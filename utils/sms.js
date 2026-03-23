/**
 * SMS Servisi
 * OTP göndermek için kullanılan SMS gateway entegrasyonu
 * Şu anda AWS SNS, Twilio, netgsm vb. kullanılabilir
 */

const { AppError } = require('./errorHandler');

/**
 * SMS Provider Seç (Environment variable'dan)
 * Desteklenen: twilio, aws-sns, netgsm, iyzico
 */
const SMS_PROVIDER = process.env.SMS_PROVIDER || 'twilio';

/**
 * Twilio SMS Gönder
 * @param {String} phoneNumber - Alıcı telefon numarası
 * @param {String} message - SMS mesajı
 */
const sendViaTwilio = async (phoneNumber, message) => {
  try {
    const twilio = require('twilio');
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    console.log('[SMS] Twilio mesaj gönderildi:', result.sid);
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('[SMS] Twilio hatası:', error);
    throw new AppError('SMS gönderilemedi', 500);
  }
};

/**
 * AWS SNS ile SMS Gönder
 * @param {String} phoneNumber - Alıcı telefon numarası
 * @param {String} message - SMS mesajı
 */
const sendViaAWSSNS = async (phoneNumber, message) => {
  try {
    const AWS = require('aws-sdk');
    const sns = new AWS.SNS({
      region: process.env.AWS_REGION || 'eu-west-1',
    });

    const params = {
      Message: message,
      PhoneNumber: phoneNumber,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: process.env.AWS_SMS_SENDER_ID || 'MyApp',
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    };

    const result = await sns.publish(params).promise();

    console.log('[SMS] AWS SNS mesaj gönderildi:', result.MessageId);
    return { success: true, messageId: result.MessageId };
  } catch (error) {
    console.error('[SMS] AWS SNS hatası:', error);
    throw new AppError('SMS gönderilemedi', 500);
  }
};

/**
 * NetGSM ile SMS Gönder (Türkiye)
 * @param {String} phoneNumber - Alıcı telefon numarası
 * @param {String} message - SMS mesajı
 */
const sendViaNetGSM = async (phoneNumber, message) => {
  try {
    const axios = require('axios');

    // NetGSM API parametreleri
    const params = {
      usercode: process.env.NETGSM_USERNAME,
      password: process.env.NETGSM_PASSWORD,
      gsmno: phoneNumber.replace(/[^0-9]/g, ''), // Sadece rakamlar
      message: message,
      msgheader: process.env.NETGSM_HEADER || 'MyApp',
    };

    const response = await axios.get(
      'https://api.netgsm.com.tr/sms/send',
      { params }
    );

    // NetGSM başarılı yanıt kontrolü
    if (response.data.includes('00')) {
      console.log('[SMS] NetGSM mesaj gönderildi');
      return { success: true, messageId: response.data };
    } else {
      throw new Error(`NetGSM hatası: ${response.data}`);
    }
  } catch (error) {
    console.error('[SMS] NetGSM hatası:', error);
    throw new AppError('SMS gönderilemedi', 500);
  }
};

/**
 * İyzico ile SMS Gönder (Türkiye)
 * @param {String} phoneNumber - Alıcı telefon numarası
 * @param {String} message - SMS mesajı
 */
const sendViaIyzico = async (phoneNumber, message) => {
  try {
    const axios = require('axios');

    const config = {
      headers: {
        'X-API-KEY': process.env.IYZICO_API_KEY,
        'Content-Type': 'application/json',
      },
    };

    const payload = {
      receiver: phoneNumber.replace(/[^0-9]/g, ''),
      messageBody: message,
      senderId: process.env.IYZICO_SENDER_ID || 'MyApp',
    };

    const response = await axios.post(
      'https://api.iyzipay.com/v1/sms/send',
      payload,
      config
    );

    if (response.data.status === 'success') {
      console.log('[SMS] İyzico mesaj gönderildi');
      return { success: true, messageId: response.data.messageId };
    } else {
      throw new Error(`İyzico hatası: ${response.data.message}`);
    }
  } catch (error) {
    console.error('[SMS] İyzico hatası:', error);
    throw new AppError('SMS gönderilemedi', 500);
  }
};

/**
 * OTP SMS Gönder
 * Telefonunuza gelen OTP kodunu gönderi
 * @param {String} phoneNumber - Telefon numarası
 * @param {String} code - 6 haneli OTP kodu
 */
const sendOTP = async (phoneNumber, code) => {
  try {
    // Telefon numarası format kontrolü
    if (!phoneNumber || !code) {
      throw new AppError('Telefon numarası ve kod gereklidir', 400);
    }

    // OTP mesajı
    const message = `MyApp doğrulama kodunuz: ${code}. Bunu kimseyle paylaşmayın.`;

    console.log(`[SMS] OTP gönderiliyor: ${phoneNumber}`);

    // SMS provider'a göre gönder
    let result;

    switch (SMS_PROVIDER) {
      case 'twilio':
        result = await sendViaTwilio(phoneNumber, message);
        break;

      case 'aws-sns':
        result = await sendViaAWSSNS(phoneNumber, message);
        break;

      case 'netgsm':
        result = await sendViaNetGSM(phoneNumber, message);
        break;

      case 'iyzico':
        result = await sendViaIyzico(phoneNumber, message);
        break;

      default:
        // Development: konsolda göster
        if (process.env.NODE_ENV === 'development') {
          console.log(`[SMS-DEV] ${phoneNumber}: ${message}`);
          return { success: true, messageId: 'dev-mode' };
        }
        throw new AppError('SMS provider ayarlanmamış', 500);
    }

    return result;
  } catch (error) {
    console.error('[SMS] Genel hatası:', error);
    throw error;
  }
};

/**
 * SMS Gönder (Genel Amaçlı)
 * @param {String} phoneNumber - Telefon numarası
 * @param {String} message - Mesaj
 * @param {String} sender - Gönderici ID (opsiyonel)
 */
const sendSMS = async (phoneNumber, message, sender = null) => {
  try {
    if (!phoneNumber || !message) {
      throw new AppError('Telefon numarası ve mesaj gereklidir', 400);
    }

    const customMessage = sender
      ? `[${sender}] ${message}`
      : message;

    switch (SMS_PROVIDER) {
      case 'twilio':
        return await sendViaTwilio(phoneNumber, customMessage);

      case 'aws-sns':
        return await sendViaAWSSNS(phoneNumber, customMessage);

      case 'netgsm':
        return await sendViaNetGSM(phoneNumber, customMessage);

      case 'iyzico':
        return await sendViaIyzico(phoneNumber, customMessage);

      default:
        if (process.env.NODE_ENV === 'development') {
          console.log(`[SMS-DEV] ${phoneNumber}: ${customMessage}`);
          return { success: true, messageId: 'dev-mode' };
        }
        throw new AppError('SMS provider ayarlanmamış', 500);
    }
  } catch (error) {
    console.error('[SMS] Genel hata:', error);
    throw error;
  }
};

module.exports = {
  sendOTP,
  sendSMS,
  sendViaTwilio,
  sendViaAWSSNS,
  sendViaNetGSM,
  sendViaIyzico,
};
