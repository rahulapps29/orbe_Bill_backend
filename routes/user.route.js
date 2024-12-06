const express = require("express");
const app = express();
const user = require("../controllers/user.controller");

app.get("/get/:userId",user.getUserData);
app.post("/update/:userId", user.saveUserData);
module.exports = app;