const Invoice = require("../models/invoice.model");
const Customer = require("../models/customer.model");
const { PDFDocument, rgb } = require("pdf-lib");

// Add Post

const addInvoice = async (req, res) => {
  // console.log("req: ", req.body);

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
  });

  addInvoice
    .save()
    .then(async (result) => {
      const newInvoiceId = result._id;
      // console.log(newInvoiceId);
      const savedInvoice = await Invoice.findById(newInvoiceId);
      // console.log(savedInvoice);

      // Check if customer exists
      const existingCustomer = await Customer.findOne({
        email: savedInvoice.customerEmail,
      });

      if (existingCustomer) {
        // Update existing customer document
        existingCustomer.invoiceList.push(savedInvoice._id); // Add new invoice _id to the customer's invoices array
        existingCustomer.creditAmount +=
          result.paymentMode === "Credit" ? result.totalAmount : 0;
        const savedCustomer = await existingCustomer.save();
        // console.log(savedCustomer);
      } else {
        // Create a new customer document
        const newCustomer = new Customer({
          userID: "user",
          name: result.customerName,
          phoneNo: result.phoneNo,
          email: result.customerEmail,
          creditAmount:
            result.paymentMode === "Credit" ? result.totalAmount : 0,
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
  try {
    const userID = req.params.userID;
    const count = await Invoice.countDocuments({ userID: userID });
    res.json({ count });
  } catch (error) {
    console.error("Error fetching invoice count:", error);
    res.status(500).json({ error: "Error fetching invoice count" });
  }
};
const getAllInvoice = async (req, res) => {
  const findAllInvoices = await Invoice.find({
    // userID: req.params.userId,

    userID: "user",
  }).sort({ invoiceID: -1 });
  // -1 for descending;1 for ascending;
  // console.log(req.params.userId);
  res.json(findAllInvoices);
  // console.log(findAllInvoices);
};
const searchInvoice = async (req, res) => {
  try {
    const { userID, customerName } = req.query;

    // Create a query object based on parameters
    const query = {
      userID: "user",
      // userID: req.params.userID,
      customerName: { $regex: new RegExp(customerName, "i") }, // Case-insensitive string search
    };

    // Execute the query
    const records = await Invoice.find(query);
    // Send the results
    res.json(records);
    // console.log(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getSalesData = async (req, res) => {
  const { userId, startDate, endDate } = req.query; // Extract userId, startDate, and endDate from query parameters
  try {
    // Fetch sales data from database based on start date, end date, and userId
    // Replace the following line with your database query
    const salesData = await Invoice.find({
      userID: userId, // Filter by userId
      createdAt: { $gte: startDate, $lte: endDate },
    });

    // Send the salesData to the frontend
    res.status(200).json(salesData);
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { getSalesData };

module.exports = {
  addInvoice,
  getInvoiceCount,
  getAllInvoice,
  searchInvoice,
  getSalesData,
};
