const User = require("../models/user.model");

const getUserData = async (req, res) => {
    // console.log(req.params);
    try {
        const userID = req.params.userId;
        const userData = await User.findById(userID);
        res.json(userData);
        // console.log(userData);
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Error fetching user data" });
    }
};
async function saveUserData(req, res) {
    const userId = req.params.userId;
    const userData = req.body;
  
    try {
      // Check if the user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update user data
      user.firstname = userData.firstname || user.firstname;
      user.lastname = userData.lastname || user.lastname;
      user.email = userData.email || user.email;
      user.password = userData.password || user.password;
      user.gstno = userData.gstno || user.gstno;
      user.shopname = userData.shopname || user.shopname;
      user.shopaddress = userData.shopaddress || user.shopaddress;
      user.phonenumber=userData.phonenumber||user.phonenumber;
      // Save updated user data
      const updatedUser = await user.save();
  
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  

module.exports={getUserData,saveUserData};