import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const senderNumber = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendSMS = async (to, message) => {
  try {
    if (!to) {
      console.warn('No recipient number provided for Notification.');
      return;
    }

    console.log(`Sending SMS to ${to}: ${message}`);

    const response = await client.messages.create({
      body: message,
      from: senderNumber, // Standard SMS
      to: to
    });

    console.log(`SMS sent with SID: ${response.sid}`);
    return response;
  } catch (error) {
    console.error('Failed to send SMS notification:', error);
  }
};

export const sendWhatsApp = async (to, message) => {
  try {
    if (!to) {
      console.warn('No recipient number provided for WhatsApp Notification.');
      return;
    }

    console.log(`Sending WhatsApp to ${to}: ${message}`);

    // Use Twilio Sandbox Number
    const sandboxNumber = 'whatsapp:+14155238886';
    const toNum = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    const response = await client.messages.create({
      body: message,
      from: sandboxNumber,
      to: toNum
    });

    console.log(`WhatsApp sent with SID: ${response.sid}`);
    return response;
  } catch (error) {
    console.error('Failed to send WhatsApp notification:', error);
  }
};
