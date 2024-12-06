const Otp = require('../models/otpModel');
const generateOTP = require('../utils/generateOTP');
const logger = require('../utils/logger');
require("dotenv").config();
const validityPeriodMinutes = process.env.OTP_VALIDITY_PERIOD_MINUTES;
const OTP_SIZE = parseInt(process.env.OTP_SIZE);
//const OTP_SIZE = process.env.OTP_SIZE;
// console.log(validityPeriodMinutes)
// console.log(OTP_SIZE)
const otpController = {
    generateOtp: async (email, type) => {
        try {
            // Check if an OTP has already been generated for this email
            // console.log(validityPeriodMinutes)
            // console.log(OTP_SIZE)
            // console.log("enterted the genrateopt fn")
            const existingOtp = await Otp.findOne({
                email: email,
                createdAt: {
                    $gte: new Date(new Date() - validityPeriodMinutes * 60 * 1000),
                },
            }).lean();

            if (existingOtp) {
                if (existingOtp.attempts >= 3) {
                    logger.info(`Maximum attempts reached for OTP ${existingOtp.otp} associated with ${email}`);
                    throw new Error('Maximum attempts reached. Please try again after some time');
                }

                await Otp.updateOne({ _id: existingOtp._id }, { $inc: { attempts: 1 } });
                logger.info(`OTP ${existingOtp.otp} already exists for ${email}`);
                return existingOtp.otp;
            }
            // console.log("otp is not in database")
            //console.log(OTP_SIZE)
            const otp = generateOTP(OTP_SIZE, type);
            // console.log("out of otp genrate fn")
            // console.log(otp)
            const otpDocument = new Otp({
                id: new Date().getTime(),
                email: email,
                otp: otp,
            });

            await otpDocument.save();
            
            logger.info(`Generated OTP ${otp} for ${email}`);
            return otp;
        } catch (error) {
            logger.error("Failed to generate OTP", error.message);
            throw new Error(error.message || 'Failed to generate OTP');
        }
    },
    verifyOtp: async (email, otp) => {
        try {
            if (otp.toString().length !== OTP_SIZE) {
                // console.log(otp.toString().length)
                throw new Error('Invalid OTP');
            }
            // console.log("pass length check")
            const otpDocument = await Otp.findOneAndDelete({
                email: email,
                otp: otp,
                createdAt: { $gte: new Date(new Date() - 1000 * 60 * validityPeriodMinutes) }
            }).lean();
            // console.log("pass find")
            if (!otpDocument) {
                throw new Error('Invalid OTP');
            }

            logger.info(`Verified OTP ${otp} for ${email}`);
            //console("email verified")
            return true;
        } catch (error) {
            logger.error("Failed to verify OTP", error.message);
            throw new Error(error.message);
        }
    },
    clearExpiredOtps: async () => {
        try {
            // Clear expired OTPs
            const cutoffTime = new Date(new Date() - 1000 * 60 * validityPeriodMinutes);
            await Otp.deleteMany({ createdAt: { $lt: cutoffTime } });
        } catch (error) {
            logger.error("Failed to clear expired OTPs", error.message);
            throw new Error(error.message || 'Failed to clear expired OTPs');
        }
    },
};

module.exports = otpController;