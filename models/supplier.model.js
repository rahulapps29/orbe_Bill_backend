const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/* Creating a new schema for the supplier model. */
const supplierSchema = new Schema({
  userID: { // This is userID of the shopkeeper
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phoneNo: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  debitAmount: {
    type: Number,
    required: false,
  },
  invoiceList: {
      type: [ String ],
      required: false,
    },
  
});
module.exports = mongoose.model("Supplier", supplierSchema);