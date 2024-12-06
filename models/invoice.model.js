const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/* Creating a new schema for the invoice model. */
const invoiceSchema = new Schema({
  userID: { // This is userID of the shopkeeper
    type: String,
    required: true,
  },
  invoiceID: {
    type: Number,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: false,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    required: false,
  },
  paymentMode: {
    type: String,
    default: "Paid",
    required: false,
  },
  discount: {
    type: Number,
    default: 0,
  },
  itemList: {
    type: [ {itemID: String, itemName: String, quantity: Number, costPrice: Number, rate: Number, gst: Number, amount: Number } ],
    required: true,
  },
  createdAt:{
    type: Date,
    default: new Date(),
  },
  totalCostPrice: {
    type: Number,
    default: 0,
  },
  totalSales: {
    type: Number,
    default: 0,
  },
  // createdAt:{
  //   type: String,
  //   required: true,
  // },
});

module.exports = mongoose.model("Invoice", invoiceSchema);