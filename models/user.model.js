const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

/* Creating a new schema for the user model. */
const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    // userID: {
    //     type: String,
    //     required: true,
    // },
    email: {
        type: String,
        required: true,   
    },
    password: {
        type: String,
        required: true,
    },
    gstno: {
        type: String,
        required: true,
    },
    shopname: {
        type: String,
        required: true,
    },
    shopaddress: {
        type: String,
        required: true,
    },
    phonenumber : {
        type : String,
        required: true,
    }

});

userSchema.pre('save', async function (next) {
    if (this.isModified('password') || this.isNew) {
      const hashedPassword = await bcrypt.hash(this.password, 10);
      this.password = hashedPassword;
    }
    next();
  });


module.exports = mongoose.model("User", userSchema);