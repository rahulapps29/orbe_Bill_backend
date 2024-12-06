const User = require("../models/user.model");
const bcrypt = require('bcrypt');
const fixedSalt = '$2b$10$abcdefghijklmnopqrstuv';


// Add Post
// const registerUser = async (req, res) => {
//   const registerUser = new User({
//       firstname: req.body.firstname,
//       lastname: req.body.lastname,
//       email: req.body.email,
//       password: req.body.password,
//       gstno: req.body.gstno,
//   });

//   registerUser
//     .save()
//     .then((result) => {
//       res.status(200).send(result);
//     })
//     .catch((err) => {
//       res.status(402).send(err);
//     });
//     console.log("req: ", req.body);
// };







const registerUser = async (req, res) => {
  console.log(req.body);

  const { firstname, lastname, email, password, gstno , shopname , shopaddress , phonenumber } = req.body;
  try {
    // Check if the user with the given email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      alert("User already exists with that email")
      return res.status(400).json({ error: 'User already exists with that email' });
    }

    // Hash the password before saving it to the database
    // const hashedPassword = await bcrypt.hash(password.trim(), fixedSalt);
    // password = hashedPassword
    // console.log(password)
    // console.log(hashedPassword)
    // Create a new user with the hashed password
    const newUser = new User({
      firstname,
      lastname,
      email,
      password, // Store the hashed password
      gstno,
      shopname,
      shopaddress,
      phonenumber,
    });
    // console.log(password)
    // Save the user to the database
    const result = await newUser.save();

    res.status(200).json(result);
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
  
};




module.exports={registerUser};