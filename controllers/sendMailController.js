const nodemailer = require("nodemailer");
const logger = require("../utils/logger");
require("dotenv").config();
const u = process.env.GMAIL_USER;
const p = process.env.GMAIL_PASS;
async function sendMailController(email, otp, organization, subject) {
    try {
        // console.log(user)
        // console.log(pass)
        // Create transporter
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });
        
        // console.log("hello")

        const mailOptions = {
            from: `"${organization}" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `${subject}`,
            text: `Your OTP is ${otp}`,
            html: `
                  <!DOCTYPE html>
                  <html lang="en">
                      <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <title>${organization} One-Time Password (OTP)</title>
                          <style>
                              body {
                                  font-family: Arial, sans-serif;
                                  background-color: #f8f8f8;
                                  margin: 0;
                                  padding: 0;
                              }
  
                              .container {
                                  max-width: 600px;
                                  margin: 0 auto;
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
                              }
  
                              .header {
                                  background-color: #0073e6;
                                  color: #ffffff;
                                  padding: 20px;
                                  text-align: center;
                                  border-top-left-radius: 5px;
                                  border-top-right-radius: 5px;
                              }
  
                              h1 {
                                  font-size: 24px;
                                  margin: 0;
                              }
  
                              .content {
                                  padding: 20px;
                                  text-align: center;
                              }
  
                              p {
                                  font-size: 18px;
                                  color: #333333;
                                  margin: 0;
                              }
  
                              .otp {
                                  font-size: 32px;
                                  font-weight: bold;
                                  color: #0073e6;
                              }
  
                              .footer {
                                  border: 1px dashed #cccccc;
                                  border-width: 2px 0;
                                  padding: 20px;
                                  text-align: center;
                              }
  
                              .footer p {
                                  font-size: 14px;
                                  color: #333333;
                                  margin: 0;
                              }
  
                              .footer a {
                                  color: #0073e6;
                              }
  
                              .footer a:hover {
                                  text-decoration: underline;
                              }
                          </style>
                      </head>
                      <body>
                          <div class="container">
                              <div class="header">
                                  <h1>${organization}</h1>
                                  <p style="font-size: 14px;color: #ffffff;">
                                  You received this email because you (or someone else) requested an OTP.
                                  </p>
                              </div>
                              <div class="content">
                                  <p>Your One-Time Password (OTP) is:</p>
                                  <p class="otp">${otp}</p>
                              </div>
                              <div class="footer">
                                  <p>Author</p>
                                  <p><a href="http://localhost:3000/" target="_blank">Billing 360</a></p>
                              </div>
                          </div>
                      </body>
                  </html>
                  `,
        };
        // console.log("message sended")
        // Send email
        await transporter.sendMail(mailOptions);
        // console.log("message sended")
        logger.info(`Sent OTP to ${email}`);
    } catch (error) {
        // console.log(u)
        // console.log(p)
        console.log(error)
        logger.error(`Failed to send OTP to ${email}`, error.message);
        throw new Error(error.message);
    }
}

module.exports = sendMailController;
