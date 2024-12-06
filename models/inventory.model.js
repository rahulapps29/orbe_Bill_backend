const mongoose = require("mongoose");

const Schema = mongoose.Schema;

/* Creating a new schema for the inventory model. */
const inventorySchema = new Schema({
    userID: { // This is userID of the shopkeeper
        type: String,
        required: true,
    },
    itemID: {
        type: String,
        required: true,
    },
    itemName: {
        type: String,
        required: true,
    },
    salePrice: {
        type: Number,
        required: true,
    },
    costPrice: {
        type: Number,
        required: true,
    },
    itemGST: {
        type: Number,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    batchList: {
        type: [ { batchID: String, batchQty: Number, expiryDate: Date } ],
        required: true,
    },
    // batchExpiry: {
    //     type: Date,
    //     required: true,
    // },

    
});

module.exports = mongoose.model("Inventory", inventorySchema);  