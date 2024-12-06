const express = require("express");
const app = express();
const contactUs = require("../controllers/contact.controller");


app.post("/bill/sendmail",  contactUs.sendmail);
// app.get("/log/get" , login.getUserDetails);

//app.post("/forgotPassword",login.forgotPassword);
module.exports = app;