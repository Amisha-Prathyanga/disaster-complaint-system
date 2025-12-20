import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const senderNumber = process.env.TWILIO_PHONE_NUMBER;
// Testing sending TO the user's mobile (I'll use the one they gave before: +94770346212)
// Or I can just try sending to the senderNumber itself if it's a mobile (unlikely for a Twilio number).
// I'll send to the previously provided DSD officer/Admin number: +94770346212
const recipientNumber = '+94770346212'; 

console.log('Testing New Credentials...');
console.log(`From: whatsapp:${senderNumber}`);
console.log(`To: whatsapp:${recipientNumber}`);

const client = twilio(accountSid, authToken);

async function testSend() {
    try {
        const message = await client.messages.create({
            body: 'Test notification from New Twilio Number',
            from: `whatsapp:${senderNumber}`,
            to: `whatsapp:${recipientNumber}`
        });

        console.log(`Success! Message SID: ${message.sid}`);
    } catch (error) {
        console.error('Twilio Error:', error.message);
        if (error.code === 63015) {
             console.log('Hint: The recipient might not have joined the sandbox yet (if this is a sandbox).');
        }
        if (error.code === 21408) {
             console.log('Hint: Permission to send to this region is not enabled.');
        }
         if (error.code === 63007) {
             console.log('Hint: The specific Channel is not enabled for this Twilio number (e.g. this number is SMS only, not WhatsApp sender).');
        }
    }
}

testSend();
