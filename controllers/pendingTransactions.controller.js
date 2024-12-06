const Customer = require("../models/customer.model");
const Supplier = require("../models/supplier.model");
const Invoice = require("../models/invoice.model");
const User = require("../models/user.model");
// const notifyCustomerController = require("./notifyCustomer.controller");
const pdf = require('html-pdf');
const pdfTemplate = require('../utils/pdfTemplate');
const nodemailer = require("nodemailer");
require("dotenv").config();
const u = process.env.GMAIL_USER;
const p = process.env.GMAIL_PASS;
async function notifyCustomerController(email, organization, shopname, shopEmail, shopAddress, body, totalAmt, pdfPath) {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });
        
        // console.log("hello")

        const mailOptions = {
            from: `"${organization}" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `Know how much you owe to ${shopname}`,
            text: `This is to inform you that your credit log with ${shopname} has been changed. ${body} You now owe ${totalAmt} to ${shopname}. If this information is not correct, please reach out to the vendor(Email: ${shopEmail})`,
            attachments: [
                {
                  filename: 'invoice.pdf',
                  //path: pdfPath,
                  content: pdfPath,
                  contentType: 'application/pdf',
                },
              ],
            html: `
                  <!DOCTYPE html>
                  <html lang="en">
                      <head>
                          <meta charset="UTF-8">
                          <meta name="viewport" content="width=device-width, initial-scale=1.0">
                          <title>${organization} Your Credit Amount</title>
                          <style>
                              body {
                                  font-family: Arial, sans-serif;
                                  background-color: #f8f8f8;
                                  margin: 0;
                                  padding: 0;
                              }
  
                              .container {
                                  max-width: 600px;
                                  margin: 0 auto;
                                  background-color: #ffffff;
                                  border-radius: 5px;
                                  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
                              }
  
                              .header {
                                  background-color: #0073e6;
                                  color: #ffffff;
                                  padding: 20px;
                                  text-align: center;
                                  border-top-left-radius: 5px;
                                  border-top-right-radius: 5px;
                              }
  
                              h1 {
                                  font-size: 24px;
                                  margin: 0;
                              }
  
                              p {
                                  font-size: 16px;
                                  color: #333333;
                                  margin: 0;
                              }
                              .footer {
                                  border: 1px dashed #cccccc;
                                  border-width: 2px 0;
                                  padding: 20px;
                                  text-align: center;
                              }
  
                              .footer p {
                                  font-size: 14px;
                                  color: #333333;
                                  margin: 0;
                              }
  
                              .footer a {
                                  color: #0073e6;
                              }
  
                              .footer a:hover {
                                  text-decoration: underline;
                              }
                          </style>
                      </head>
                      <body>
                          <div class="container">
                              <div class="header">
                                  <h1>${organization}</h1>
                              </div>
                              <div>
                                    <p>
                                    This is to inform you that your credit log with ${shopname} has been changed. <br/>
                                    <em> ${body} You now owe Rs. ${totalAmt} to ${shopname}. </em> Please find attached the invoice. <br/>
                                    If this information is not correct, please reach out to the vendor.<br/>
                                    Email : ${shopEmail} <br/>
                                    Address : ${shopAddress} <br/>
                                    </p>
                              </div>
                              <div class="footer">
                                  <p>Author</p>
                                  <p><a href="http://localhost:3000/" target="_blank">Billing 360</a></p>
                              </div>
                          </div>
                      </body>
                  </html>
                  `,
        };
        // console.log("message sent")
        // Send email
        await transporter.sendMail(mailOptions);
        // console.log("message sent")
    } catch (error) {
        // console.log(u)
        // console.log(p)
        console.log(error)
        console.error(`Failed to send notification to ${email}`, error.message);
        throw new Error(error.message);
    }
}
const existingCustEmail = async(req,res) => {
  try{
    const user = req.params.userID;
    const {email} = req.query;
    const redundantEmail = await Customer.findOne({userID: user, email: email});
    // console.log(redundantEmail); 
    res.json(redundantEmail);
    }
    catch (error) {
      console.error("Error finding customer with given email",error);
      res.status(400).json({ error: "Failed to find customer with given email"});
    }
}

const existingSuppEmail = async(req,res) => {
  try{
    const user = req.params.userID;
    const {email} = req.query;
    const redundantEmail = await Supplier.findOne({userID: user, email: email});
    // console.log(redundantEmail); 
    res.json(redundantEmail);
    }
    catch (error) {
      console.error("Error finding supplier with given email",error);
      res.status(400).json({ error: "Failed to find supplier with given email"});
    }
}

//Add New Credit
const addNewCredit = async (req, res) => {
   try{
    const newCredit = new Customer({
      //userID: 'user',
      userID: req.body.userID,
      name: req.body.partyName,
      phoneNo: req.body.phoneNumber,
      email: req.body.email,
      creditAmount: Number(req.body.amount).toFixed(2),
    });

    const savedCredit = await newCredit.save();
    res.status(201).json(savedCredit);

    const id = savedCredit.userID;
    const count = await Invoice.countDocuments({userID : id});
    const date = (() => {
      const now = new Date();
      const adjustedTime = new Date(now.getTime() + (5 * 60 + 30) * 60000);
      return new Date(adjustedTime);
     })();
     const addInvoice = new Invoice({
       userID: savedCredit.userID,
       invoiceID: count,
       customerName: savedCredit.name,
       phoneNo: savedCredit.phoneNo,
       customerEmail: savedCredit.email,
       totalAmount: savedCredit.creditAmount,
       notes: "Dues modified",
       paymentMode: "Amount added to credit",
       itemList: [],
       createdAt: date,
     });
     addInvoice.save()
     .then(async(result)=> {
       const newInvoiceId = result._id;
       savedCredit.invoiceList.push(newInvoiceId); // Add new invoice _id to the customer's invoices array
       const savedCustomer = await savedCredit.save();
      //  console.log(savedCustomer);
       const shopkeeper = await User.find({_id : savedCredit.userID});
      const pdfBuffer = await generatePDFBuffer(pdfTemplate({
        invoiceData: {
          userID: result.userID,
          invoiceID: result.invoiceID,
          customerName: result.customerName,
          phoneNo: result.phoneNo,
          customerEmail: result.customerEmail,
          totalAmount: result.totalAmount,
          notes:"Dues modified",
          paymentMode:result.paymentMode,
          discount: result.discount,
          itemList:result.itemList,
          createdAt: result.createdAt,
        },
        userData: {
          firstname: shopkeeper[0].firstname, 
          lastname: shopkeeper[0].lastname, 
          email: shopkeeper[0].email, 
          password: shopkeeper[0].password, 
          gstno: shopkeeper[0].gstno, 
          shopname: shopkeeper[0].shopname, 
          shopaddress: shopkeeper[0].shopaddress,
          phonenumber: shopkeeper[0].phonenumber,
        },
      }));
      const body = `Rs. ${savedCustomer.creditAmount} was added to your total credit amount.`;
      await notifyCustomerController(savedCustomer.email, 'Billing 360', shopkeeper[0].shopname, shopkeeper[0].email, shopkeeper[0].shopaddress, body, savedCustomer.creditAmount, pdfBuffer);
     })
     .catch((err) => {
       console.log(err);
     });
  } catch (error) {
    console.error("Error adding new credit:", error);
    res.status(400).json({ error: "Failed to add credit" });
  }
};

// Add New Debit
const addNewDebit = async (req, res) => {
    //console.log(req.body);
    try {
      const newDebit = new Supplier({
        //userID: 'user',
        userID: req.body.userID,
        name: req.body.partyName,
        phoneNo: req.body.phoneNumber,
        email: req.body.email,
        debitAmount: Number(req.body.amount).toFixed(2) ,
      });
      const savedDebit = await newDebit.save();
      res.status(201).json(savedDebit);
    } catch (error) {
      console.error("Error adding new debit:", error);
      res.status(400).json({ error: "Failed to add debit" });
    }
  };


async function generatePDFBuffer(pdfContent) {
    return new Promise((resolve, reject) => {
        pdf.create(pdfContent, {childProcessOptions: {
          env: {
            OPENSSL_CONF: '/dev/null',
          },
        }}).toBuffer((err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        });
    });
}

// Update Existing Customer Credit
const updateCustomer  = async (req, res) => {
  try {
    const { phoneNo, email } = req.body;

    const updatedCustomer = await Customer.findByIdAndUpdate({_id:req.body._id},{phoneNo: phoneNo, email: email},{new: true});
    // console.log(updatedCustomer);
    res.json(updatedCustomer);
  } catch (error) {
    console.error("Error updating Customer:", error);
    res.status(400).json({ error: "Failed to update Customer" });
  }
};
 
// Update Existing Supplier Debit
const updateSupplier  = async (req, res) => {
  try {
    const {phoneNo, email } = req.body;

    const updatedSupplier = await Supplier.findByIdAndUpdate({_id:req.body._id},{phoneNo: phoneNo, email: email},{new: true});
    res.json(updatedSupplier);
  } catch (error) {
    console.error("Error updating Supplier:", error);
    res.status(400).json({ error: "Failed to update Supplier" });
  }
  };

  const getCreditCustomers = async (req, res) => {
    try{
    const CreditCustomers = await Customer.find({ creditAmount : {$gt : 0}, userID : req.params.userID}).sort({ creditAmountmount: -1});
    // console.log(CreditCustomers); 
    res.json(CreditCustomers);
    }
    catch (error) {
      console.error("Error finding customers with credit:",error);
      res.status(400).json({ error: "Failed to find customers with credit"});
    }
  };

  const getDebitSuppliers = async (req, res) => {
    try{
    const DebitSuppliers = await Supplier.find({ debitAmount : {$gt : 0}, userID : req.params.userID}).sort({ debitAmount: -1 });
    // console.log(DebitSuppliers); 
    res.json(DebitSuppliers);
    }
    catch (error) {
      console.error("Error finding suppliers to debit:",error);
      res.status(400).json({ error: "Failed to find suppliers to debit"});
    }
  };

  const updateCustomerAmount = async (req, res) => {
    try {
      const amt = Number(req.body.amount).toFixed(2);
     const updatedCust = await Customer.findByIdAndUpdate({ _id: req.body._id},{ $inc : {creditAmount: Number(req.body.amount).toFixed(2)}},{new:true});
     const id=updatedCust.userID;
    //  console.log(updatedCust);
     res.json(updatedCust);
     const count = await Invoice.countDocuments({userID : id});
     const totalAmt = amt > 0 ? amt : -amt;
     const payMode = amt > 0 ? "Amount added to credit" : "Credit dues cleared";
     const date = (() => {
      const now = new Date();
      const adjustedTime = new Date(now.getTime() + (5 * 60 + 30) * 60000);
      return new Date(adjustedTime);
     })();
     const addInvoice = new Invoice({
       userID: updatedCust.userID,
       //invoiceID: req.body.invoiceID,
       invoiceID: count,
       customerName: updatedCust.name,
       phoneNo: updatedCust.phoneNo,
       customerEmail: updatedCust.email,
       totalAmount: totalAmt,
       //notes: req.body.notes,
       notes: "Dues modified",
       paymentMode: payMode,
       itemList: [],
       createdAt: date,
     });
     addInvoice.save()
     .then(async(result)=> {
       const newInvoiceId = result._id;
       updatedCust.invoiceList.push(newInvoiceId); // Add new invoice _id to the customer's invoices array
       const savedCustomer = await updatedCust.save();
      //  console.log(savedCustomer);
       const shopkeeper = await User.find({_id : savedCustomer.userID});
      const pdfBuffer = await generatePDFBuffer(pdfTemplate({
        invoiceData: {
          userID: result.userID,
          invoiceID: result.invoiceID,
          customerName: result.customerName,
          phoneNo: result.phoneNo,
          customerEmail: result.customerEmail,
          totalAmount: result.totalAmount,
          notes:"Dues modified",
          paymentMode:result.paymentMode,
          discount: result.discount,
          itemList:result.itemList,
          createdAt: result.createdAt,
        },
        userData: {
          firstname: shopkeeper[0].firstname, 
          lastname: shopkeeper[0].lastname, 
          email: shopkeeper[0].email, 
          password: shopkeeper[0].password, 
          gstno: shopkeeper[0].gstno, 
          shopname: shopkeeper[0].shopname, 
          shopaddress: shopkeeper[0].shopaddress,
          phonenumber: shopkeeper[0].phonenumber,
        },
      }));
      const body = result.paymentMode === "Amount added to credit" ? `Rs. ${result.totalAmount} was added to your total credit amount.` : `You have paid Rs. ${result.totalAmount}.`
      await notifyCustomerController(savedCustomer.email, 'Billing 360', shopkeeper[0].shopname, shopkeeper[0].email, shopkeeper[0].shopaddress, body, savedCustomer.creditAmount, pdfBuffer);
     })
     .catch((err) => {
       console.log(err);
     });
    }
    catch(error) {
     console.error("Error updating customer amount", error);
     res.status(400).json({error: "Failed to update customer amount"});
    }

  };
 
  const updateSupplierAmount = async (req, res) => {
   try {
    const updatedSupp = await Supplier.findByIdAndUpdate({ _id: req.body._id},{$inc : {debitAmount: Number(req.body.amount).toFixed(2)}},{new:true});
    // console.log(updatedSupp);
    res.json(updatedSupp);
   }
   catch(error) {
    console.error("Error updating supplier amount", error);
    res.status(400).json({error: "Failed to update supplier amount"});
   }
 };

 const SearchCreditCustomers = async(req, res) => {
  try{
    const user= req.params.userID;
    const {custName} = req.query;
    const CreditCustomers = await Customer.find({ creditAmount : {$gt : 0}, userID : user, name: { $regex: new RegExp(custName, 'i') }});
    // console.log(CreditCustomers); 
    res.json(CreditCustomers);
    }
    catch (error) {
      console.error("Error finding customers with credit:",error);
      res.status(400).json({ error: "Failed to find customers with credit"});
    }
 };

 const SearchDebitSuppliers = async(req, res) => {
  try{
    const user= req.params.userID;
    const {suppName} = req.query;
    const DebitSuppliers = await Supplier.find({ debitAmount : {$gt : 0}, userID : user, name: { $regex: new RegExp(suppName, 'i') }});
    // console.log(DebitSuppliers); 
    res.json(DebitSuppliers);
    }
    catch (error) {
      console.error("Error finding suppliers to debit:",error);
      res.status(400).json({ error: "Failed to find suppliers to debit"});
    }
 };

module.exports={
  existingCustEmail,
  existingSuppEmail,
  addNewCredit,
  addNewDebit,
  updateCustomer ,
  updateSupplier,
  getCreditCustomers,
  getDebitSuppliers,
  updateCustomerAmount,
  updateSupplierAmount,
  SearchCreditCustomers,
  SearchDebitSuppliers,
};
