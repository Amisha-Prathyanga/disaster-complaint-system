import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const senderNumber = process.env.TWILIO_PHONE_NUMBER;
const recipientNumber = '+94770346212'; 

console.log('Testing SMS Capability...');
console.log(`From: ${senderNumber}`);
console.log(`To: ${recipientNumber}`);

const client = twilio(accountSid, authToken);

async function testSMS() {
    try {
        const message = await client.messages.create({
            body: 'Test SMS from New Twilio Number',
            from: senderNumber, // No whatsapp: prefix
            to: recipientNumber // No whatsapp: prefix
        });

        console.log(`Success! SMS Message SID: ${message.sid}`);
    } catch (error) {
        console.error('Twilio Error:', error.message);
        console.error('Code:', error.code);
    }
}

testSMS();
