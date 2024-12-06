const express = require("express");
const app = express();
const pendingTrans = require("../controllers/pendingTransactions.controller");

app.post("/addNewCredit",pendingTrans.addNewCredit);
app.post("/addNewDebit",pendingTrans.addNewDebit);
app.put("/updateCustomer",pendingTrans.updateCustomer);
app.put("/updateSupplier",pendingTrans.updateSupplier);
app.get("/getCust/:userID",pendingTrans.getCreditCustomers);
app.get("/getSupp/:userID",pendingTrans.getDebitSuppliers);
app.put("/updateCustAmt",pendingTrans.updateCustomerAmount);
app.put("/updateSuppAmt",pendingTrans.updateSupplierAmount);
app.get("/SearchCreditCust/:userID",pendingTrans.SearchCreditCustomers);
app.get("/SearchDebitSupp/:userID",pendingTrans.SearchDebitSuppliers);
app.get("/getCustExistingEmail/:userID",pendingTrans.existingCustEmail);
app.get("/getSuppExistingEmail/:userID",pendingTrans.existingSuppEmail);
module.exports = app;