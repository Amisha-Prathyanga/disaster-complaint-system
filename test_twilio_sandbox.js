import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
// IGNORE the .env sender, use hardcoded Sandbox number
const senderNumber = '+14155238886'; 
const recipientNumber = process.env.TWILIO_PHONE_NUMBER; // The user's number

console.log('Testing with Default Sandbox Number...');
console.log(`From: whatsapp:${senderNumber}`);
console.log(`To: whatsapp:${recipientNumber}`);

const client = twilio(accountSid, authToken);

async function testSend() {
    try {
        const message = await client.messages.create({
            body: 'Test notification from Sandbox',
            from: `whatsapp:${senderNumber}`,
            to: `whatsapp:${recipientNumber}`
        });

        console.log(`Success! Message SID: ${message.sid}`);
    } catch (error) {
        console.error('Twilio Error:', error.message);
        if (error.code === 63015) {
             console.log('Hint: The recipient might not have joined the sandbox yet.');
        }
    }
}

testSend();
