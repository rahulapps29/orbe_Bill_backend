const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require("dotenv").config();

// Route to handle sending emails
const sendmail = async (req, res) => {
  const { name, email, message } = req.body;

  // Create a transporter object using SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,  // Your Gmail email address
      pass: process.env.GMAIL_PASS          // Your Gmail password
    }
  });

  // Email message options
  const mailOptions = {
    from: process.env.GMAIL_USER,    // Sender address
    to: process.env.GMAIL_USER,     // Recipient address
    subject: 'New Message from ContactUs Form',
    text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      res.status(500).send('Error sending email');
    } else {
      //console.log('Email sent:', info.response);
      res.status(200).send('Email sent successfully');
    }
  });
};

module.exports = {sendmail};
