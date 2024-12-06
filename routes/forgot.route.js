const express = require("express");
const app = express();
const forgot = require("../controllers/forgot.controller");

app.post("/for", forgot.changeUser);
app.post("/ver" , forgot.userExist);
module.exports = app;