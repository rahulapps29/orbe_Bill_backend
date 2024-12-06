const express = require('express');
const User = require("../models/user.model");


const router = express.Router();
// Route for checking if email is present in the database
app.post('/', async (req, res) => {
    const { email } = req.body;

    try {
        // Check if user with provided email exists in the database
        const user = await User.findOne({ email });
        if (user) {
            // User exists in the database, call sendOTP function
            //sendOTP(email); // Assuming sendOTP function is defined elsewhere
            return res.status(200).json({ exists: true });
        } else {
            // User does not exist in the database
            return res.status(200).json({ exists: false });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});





app.post('/otp/generate', async (req, res) => {
  try {
    const { email, type = 'numeric', organization = 'IIT-KANPUR', subject = 'One-Time Password (OTP)' } = req.body;
    // console.log(email)

    const otp = await otpController.generateOtp(email, type);

    await sendMailController(email, otp, organization, subject);

    res.status(200).json({ message: 'OTP is generated and sent to your email' });
  } catch (error) {
    logger.error('Failed to generate OTP', error.message);
    res.status(400).json({ error: error.message });
  }
});

router.post('/otp/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    await otpController.verifyOtp(email, otp);

    res.status(200).json({ message: 'OTP is verified' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
