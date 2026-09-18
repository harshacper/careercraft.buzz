const nodemailer = require('nodemailer');
require('dotenv').config();

const user = process.env.GMAIL_USER || 'harshasubhash123@gmail.com';
const pass = (process.env.GMAIL_APP_PASSWORD || 'uuqg kxgk iuff xzoa').replace(/\s+/g, '');

console.log(`Connecting to Gmail as ${user}...`);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
});

transporter.sendMail({
  from: `"CareerCraft Bookings" <${user}>`,
  to: 'harshasubhash123@gmail.com',
  subject: '🔔 CareerCraft Live Test - Appointment Confirmation Notification',
  html: '<h2>CareerCraft Appointment Test</h2><p>This email confirms that your Gmail notification system is working 100%!</p>'
}, (err, info) => {
  if (err) {
    console.error('❌ GMAIL SEND ERROR:', err.message);
  } else {
    console.log('✅ GMAIL SEND SUCCESS:', info.response, info.messageId);
  }
});
