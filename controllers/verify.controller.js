const express = require('express');
const otpController = require('../controllers/otpController');
const sendMailController = require('../controllers/sendMailController');
require("dotenv").config();
const logger = require('../utils/logger');

const router = express.Router();

const senOtp = async (req, res) => {
  //req.session.source = 'verify';
  try {
    
    const { email, type = 'numeric', organization = 'Billing 360', subject = 'One-Time Password (OTP)' } = req.body;
    // console.log(email)

    const otp = await otpController.generateOtp(email, type);
    // console.log("otp generated now we will genrate email")
    await sendMailController(email, otp, organization, subject);

    res.status(200).json({ message: 'OTP is generated and sent to your email' });
  } catch (error) {
    logger.error('Failed to generate OTP', error.message);
    res.status(400).json({ error: error.message });
  }
};

const verOtp = async (req, res) => {
  //req.session.source = 'verify';
  try {
    
    const { email, otp } = req.body;
    // console.log(email)
    // console.log(otp)
    await otpController.verifyOtp(email, otp);

    res.status(200).json({ message: 'OTP is verified' });
    // console.log("email is verified")
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {senOtp , verOtp};
