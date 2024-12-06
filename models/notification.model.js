const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/* Creating a new schema for the notification model. */
const supplierSchema = new Schema({
  userID: { // This is userID of the shopkeeper
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  sentAt: {
    type: Date,
    default: new Date(),
  },
  noteType: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Supplier", supplierSchema);