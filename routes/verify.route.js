const express = require("express");
const app = express();
const verify = require("../controllers/verify.controller");
// const { verifyOtp } = require("../controllers/otpController");
// console.log("hiii")
app.post("/gen", verify.senOtp);
app.post("/ver" , verify.verOtp);
module.exports = app;