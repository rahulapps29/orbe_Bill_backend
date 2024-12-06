const express = require("express");
const app = express();
const invoice = require("../controllers/invoice.controller");

app.post("/add", invoice.addInvoice);
app.get("/count/:userID", invoice.getInvoiceCount);
app.get("/get/:userId", invoice.getAllInvoice);
app.get("/search/:userId", invoice.searchInvoice);
app.get("/sales/:userId", invoice.getSalesData);
app.get("/getDashboardData/:userId", invoice.getDashboardData)
app.put("/sendmail",invoice.sendInvoiceMail);
module.exports = app;
