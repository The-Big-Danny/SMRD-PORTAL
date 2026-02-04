// Backend/test-email-check.js
require('dotenv').config({ path: require('path').resolve(__dirname, '.env') }); // Explicitly point to .env
const sendEmail = require('./utils/sendEmail');

const test = async () => {
    try {
        console.log("Starting test...");
        // Check if variables are loaded
        if (!process.env.EMAIL_USER) {
            console.log("❌ ERROR: EMAIL_USER is missing from .env");
            return;
        }

        await sendEmail({
            email: process.env.EMAIL_USER, // Sends a test to yourself
            subject: "SMRD Mailer Test",
            message: "Success! Your backend is now capable of sending emails."
        });
        console.log("✅ SUCCESS: Check your email inbox!");
    } catch (err) {
        console.error("❌ NODEMAILER ERROR:", err.message);
    }
};

test();