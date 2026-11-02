// utils/testMailtrap.js
// Quick script to verify Mailtrap configuration.
// Run with: node utils/testMailtrap.js

require('dotenv').config(); // load .env variables
const sendEmail = require('./sendEmail');

(async () => {
  try {
    await sendEmail({
      email: 'test@example.com', // recipient (Mailtrap will capture it)
      subject: 'Mailtrap Configuration Test',
      message: '<p>This is a test email sent from your Dosnoventa backend to confirm Mailtrap is working.</p>'
    });
    console.log('✅ Test email sent! Check your Mailtrap inbox.');
  } catch (err) {
    console.error('❌ Failed to send test email:', err);
    process.exit(1);
  }
})();
