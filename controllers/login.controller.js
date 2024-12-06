// authController.js
const User = require('../models/user.model'); // Assuming the User model is defined in this file
const bcrypt = require('bcrypt');
const fixedSalt = '$2b$10$abcdefghijklmnopqrstuv';
let userAuthCheck = null;

// const loginUser = async (req, res) => {
//   try {
//     const user = await User.findOne({
//       email: req.body.email,
//       password: req.body.password,
//     });

//     if (user) {
//       res.send(user);
//       userAuthCheck = user;
//     } else {
//       res.status(401).send("Invalid Credentials");
//       userAuthCheck = null;
//     }
//   } catch (error) {
//     console.error(error);
//     res.status(500).send(error.message);
//   }
// }

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  //console.log("hii")
  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid Credentials' });
    }

    // Compare the provided password with the stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);
    //  console.log(passwordMatch)
    // console.log(password)
    // console.log(user.password)
    // const hashedPassword = await bcrypt.hash(password.trim(), fixedSalt);
    // console.log("")
    // console.log(hashedPassword)
    if (!passwordMatch) {
      userAuthCheck = null;
      return res.status(401).json({ error: 'Invalid Credentials' });
      //res.status(401).send("Invalid Credentials");
      
    }
    else{
      //console.log("Hash matched")
      // if (user){
      //         res.send(user);
      //          userAuthCheck = user;
      //        } else {
      //         res.status(401).send("Invalid Credentials");
      //          userAuthCheck = null;
      //        }
      return res.status(200).json(user);
    }

    // Password is correct, you can proceed with authentication or generate a token
    //res.status(200).json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};


/*const forgotPassword = async (req, res) => {
  try {
    const { userID, newPassword } = req.body;

    // Find the user by userID
    const user = await User.findOne({ userID });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    user.password = newPassword;

    // Save the updated user
    await user.save();

    // Send a success response
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};*/
const getUserDetails = (req, res) => {
  res.send(userAuthCheck);
};

module.exports = {
  loginUser,
  getUserDetails,
  //forgotPassword,
};
