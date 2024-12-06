const express = require("express");
const app = express();
const register = require("../controllers/register.controller");

app.post("/reg", register.registerUser);
module.exports = app;