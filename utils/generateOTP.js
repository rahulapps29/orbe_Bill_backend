const generateOTP = (size, type) => {
    if (size < 1 && size > 10) {
        logger.error('Invalid OTP size');
        throw new Error('Invalid OTP size');
    }
    // console.log("entered genrateOTP fn")
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    let otpChars = '';

    if (type === 'numeric') {
        otpChars = numbers;
    }
    else if (type === 'alphanumeric') {
        otpChars = numbers + characters;
    }
    else if (type === 'alphabet') {
        otpChars = characters;
    }
    else {
        logger.error('Invalid OTP type');
        throw new Error('Invalid OTP type');
    }
    // console.log("set the type")
    let otp = '';
    for (let i = 0; i < size; i++) {
        otp += otpChars.charAt(Math.floor(Math.random() * otpChars.length));
        //console.log(otp)
    }
    // console.log("otp generated")
    // console.log(otp)
    // console.log("hoi")
    return otp;
}

module.exports = generateOTP;