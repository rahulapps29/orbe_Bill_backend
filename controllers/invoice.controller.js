const Invoice = require("../models/invoice.model");
const Customer = require("../models/customer.model");
const User = require("../models/user.model")
const pdf = require('html-pdf');
const pdfTemplate = require('../utils/pdfTemplate');
// Add Post
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

const nodemailer = require("nodemailer");
require("dotenv").config();
const u = process.env.GMAIL_USER;
const p = process.env.GMAIL_PASS;
async function sendInvoiceMailController(email, organization, shopname, invoiceID, shopEmail, pdfPath, shopAddress) {
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
        // console.log(email);

        const mailOptions = {
            from: `"${organization}" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: `Invoice for your purchase at ${shopname}`,
            text: `This email is to inform you that invoice of your recent purchase has been generated. Below are the details:<br/><br/>
            <strong>Invoice ID:</strong> ${invoiceID} <br/>
            If this information is not correct, please reach out to the vendor(Email: ${shopEmail})`,
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
                                    This is to inform you of your purchase at ${shopname}. <br/>
                                    Please find attached the invoice. <br/>
                                    If there is any discrepancy, please reach out to the vendor.<br/>
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
        console.error(`Failed to send invoice to ${email}`, error.message);
        throw new Error(error.message);
    }
}

const sendInvoiceMail = async(req,res) => {
  // console.log(req.body);
  const reqData = req.body;
  const user = await User.findById(reqData.userID);
  const requestData = {
    invoiceData: reqData.invoiceData,
    userData: user,
  };
  // console.log(requestData);
  try{
  const pdfBuffer = await generatePDFBuffer(pdfTemplate(requestData));
  // console.log(pdfBuffer);
  await sendInvoiceMailController(requestData.invoiceData.customerEmail, "Billing 360", requestData.userData.shopname,  requestData.invoiceData.invoiceID, requestData.userData.email, pdfBuffer, requestData.userData.shopaddress);
  // await notifyCustomerController(requestData.invoiceData.customerEmail, 'Billing 360', requestData.userData.shopname, requestData.userData.email, requestData.userData.shopaddress, body, requestData.invoiceData.totalAmount, pdfBuffer);
  res.status(200).send(pdfBuffer);   
  }
  catch(error){
    console.log(error);
  }
}

const addInvoice = async (req, res) => {
  // console.log("req: ", req.body);
  let totalSales = 0;
  let totalCost = 0;
  for(let i = 0; i < req.body.itemList.length; i++){
    totalSales += req.body.itemList[i].quantity * req.body.itemList[i].rate;
    totalCost += req.body.itemList[i].quantity * req.body.itemList[i].costPrice;
  }
  // console.log(totalCost);
  // console.log(totalSales);
  const addInvoice = new Invoice({
    userID: req.body.userID,
    invoiceID: req.body.invoiceID,
    customerName: req.body.customerName,
    phoneNo: req.body.phoneNo,
    customerEmail: req.body.customerEmail,
    totalAmount: req.body.totalAmount,
    notes: req.body.notes,
    paymentMode: req.body.paymentMode,
    discount: req.body.discount,
    itemList: req.body.itemList,
    createdAt: req.body.createdAt,
    totalSales: totalSales,
    totalCostPrice: totalCost
  });

  addInvoice.save()
    .then(async(result) => {
      const newInvoiceId = result._id;
      // console.log(newInvoiceId);
      const savedInvoice = await Invoice.findById(newInvoiceId);
      // console.log(savedInvoice);

      // Check if customer exists
      const existingCustomer = await Customer.findOne({userID: req.body.userID, email: savedInvoice.customerEmail});
      //const existingCustomer = await Customer.findOne({ email: savedInvoice.customerEmail,});

      if (existingCustomer) {
        // Update existing customer document
        existingCustomer.invoiceList.push(savedInvoice._id); // Add new invoice _id to the customer's invoices array
        existingCustomer.creditAmount += (result.paymentMode === 'Credit' ? result.totalAmount : 0);
        const savedCustomer = await existingCustomer.save();
        // console.log(savedCustomer);
      } else {
        // Create a new customer document
        const newCustomer = new Customer({
          //userID: 'user',
          userID: req.body.userID,
          name: result.customerName,
          phoneNo: result.phoneNo,
          email: result.customerEmail,
          creditAmount: (result.paymentMode === 'Credit' ? result.totalAmount : 0),
          invoiceList: [savedInvoice._id], // Create a new array with the new invoice _id
        });
        // console.log(newCustomer);
        const savedCustomer = await newCustomer.save();
        // console.log(savedCustomer);
      }

      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(402).send(err);
    });
};

const getInvoiceCount = async (req, res) => {
  // console.log("req: ", req.body);
  try{
    const userID = req.params.userID;
    const count = await Invoice.countDocuments({userID : userID});
    res.json({count});
  }
  catch(error){
    console.error("Error fetching invoice count:", error);
    res.status(500).json({ error: "Error fetching invoice count" });
  }
};
const getAllInvoice = async (req, res) => {
  const findAllInvoices = await Invoice.find({
    userID: req.params.userId,

    // userID: "user",
  }).sort({ invoiceID: -1 }); 
  // -1 for descending;1 for ascending;
  // console.log(req.params.userId);
  res.json(findAllInvoices);
  // console.log(findAllInvoices);
};
const searchInvoice = async (req, res) => {
 
  try {
    const {userID, customerName } = req.query;

    // Create a query object based on parameters
    const query = {
      // userID: "user",
      userID: req.params.userId,
      customerName: { $regex: new RegExp(customerName, 'i') }, // Case-insensitive string search
    };

    // Execute the query
    const records = await Invoice.find(query).exec();
    // Send the results
    res.json(records);
    // console.log(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getSalesData = async (req, res) => {
  const { userId, startDate, endDate } = req.query; // Extract userId, startDate, and endDate from query parameters
  try {
    // Convert startDate and endDate to ISO 8601 format
    const id = req.params.userId; 

    // Convert start and end dates to GMT
    const startUTC = new Date(startDate);
    const endUTC = new Date(endDate);

    // Adjust start date to GMT and subtract 1 day
    startUTC.setDate(startUTC.getDate() - 1);
    startUTC.setUTCHours(18, 30, 0, 0);

    // Set end date time to 18:30 GMT
    endUTC.setUTCHours(18, 30, 0, 0);

    // Convert dates to ISO 8601 format
    const isoStartDate = startUTC.toISOString();
    const isoEndDate = endUTC.toISOString();

    // Fetch sales data from database based on start date, end date, and userId
    let salesData = await Invoice.find({ 
      userID: id, // Filter by userId
      createdAt: { $gte: isoStartDate, $lte: isoEndDate } ,
    });

    // Adjust createdAt parameter of each invoice by adding 5 hours and 30 minutes
    salesData = salesData.map(invoice => {
      const adjustedCreatedAt = new Date(invoice.createdAt);
      adjustedCreatedAt.setHours(adjustedCreatedAt.getHours()); // Add 5 hours
      adjustedCreatedAt.setMinutes(adjustedCreatedAt.getMinutes()); // Add 30 minutes
      invoice.createdAt = adjustedCreatedAt.toISOString();
      return invoice;
    });
    
    res.status(200).json(salesData);
  } catch (error) {
    console.error('Error fetching sales data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


const getDashboardData = async (req, res) => {
  try {
    // Extract user ID from request parameters or wherever it's stored
    const userId = req.params.userId; // Example: req.params.userId

    // Get today's date
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const invoices = await Invoice.find({
      userID: userId,
      createdAt: { $gte: startOfDay }
    });
    const yesterdayInvoices = await Invoice.find({
      userID: userId,
      createdAt: { $gte: startOfYesterday, $lt: startOfDay }
    });
    // Calculate the sum of selling prices
    const totalSellingPrice = invoices.reduce((total, invoice) => total + invoice.totalSales, 0);
    // Calculate the sum of cost prices
    
    const totalCostPrice = invoices.reduce((total, invoice) => total + invoice.totalCostPrice, 0);
    const numberOfInvoices = invoices.length;
    const totalSellingPriceYesterday = yesterdayInvoices.reduce((total, invoice) => total + invoice.totalSales, 0);
    // Return the sums as response
    res.json({ totalSellingPrice, totalCostPrice, numberOfInvoices, totalSellingPriceYesterday });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};



module.exports={addInvoice, getInvoiceCount,getAllInvoice,searchInvoice, getSalesData, getDashboardData, sendInvoiceMail, sendInvoiceMailController};
