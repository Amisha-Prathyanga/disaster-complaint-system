import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for dotenv not finding file if run from different dir, though Cwd should be correct.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const senderNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('Testing Twilio Configuration...');
console.log(`Account SID: ${accountSid ? '*******' + accountSid.slice(-4) : 'Missing'}`);
console.log(`Sender Number: ${senderNumber}`);

if (!accountSid || !authToken || !senderNumber) {
    console.error('Missing credentials in .env');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

async function testSend() {
    try {
        // Try sending to the same number (assuming it's the user's mobile and they put it in .env)
        // If senderNumber is actually their mobile, and not a Twilio number, this will fail with specific error.
        
        // Format for WhatsApp
        const from = senderNumber.startsWith('whatsapp:') ? senderNumber : `whatsapp:${senderNumber}`;
        const to = from; // Send to self

        console.log(`Attempting to send from ${from} to ${to}...`);

        const message = await client.messages.create({
            body: 'Test notification from Disaster Complaint System',
            from: from,
            to: to
        });

        console.log(`Success! Message SID: ${message.sid}`);
    } catch (error) {
        console.error('Twilio Error:', error.message);
        console.error('More details:', error.code, error.moreInfo);
    }
}

testSend();
