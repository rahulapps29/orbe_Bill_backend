const User = require("../models/user.model");
const bcrypt = require('bcrypt');

const changeUser = async (req, res) => {
    const { email, password } = req.body;
    //req.session.source = 'forgot';
    //console.r
    try {
        // Check if user with provided email exists
        const user = await User.findOne({ email });
        if (!user) {
            alert('User not found')
            return res.status(404).json({ message: 'User not found' });

        }
        //console.log(email)
        //console.log(newPassword)
        // Hash the new password
        //const hashedPassword = await bcrypt.hash(newPassword,10);

        // Update user's password
        user.password = password;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const userExist =  async (req, res) => {
    const { email } = req.body;
    //req.session.source = 'forgot';
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
};

module.exports={changeUser , userExist};    