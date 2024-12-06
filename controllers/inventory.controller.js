const Product = require("../models/inventory.model");

// Add Post
const addProduct = async (req, res) => {
  // console.log("req: ", req.body.userID);
  const addProduct = new Product({
    userID: req.body.userID,
    // userID:"user",
    itemID: req.body.itemID,
    itemName: req.body.itemName,
    salePrice: req.body.salePrice,
    costPrice: req.body.costPrice,
    itemGST: req.body.itemGST,
    category: req.body.category,
    discount: req.body.discount,
    quantity: req.body.quantity,
    // batchList: req.body.batchList,
  });
  addProduct
    .save()
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(402).send(err);
    });
};
const updateProduct = async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: req.body._id},
      {
        costPrice: req.body.costPrice,
        salePrice: req.body.salePrice,
        itemGST: req.body.itemGST,
      },
      { new: true }
    );
    // console.log(updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.log(error);
    res.status(402).send("Error");
  }
};

    const updateBatch = async (req, res) => {
      try {
        const { batchID, batchQty, expiryDate, _id, _idProduct, initialBatchQty } = req.body;
        const quantityDifference = batchQty - initialBatchQty;

        // Update the batch
        const updatedBatch = await Product.findOneAndUpdate(
          { "batchList._id": _id }, // Find the product with the matching batchList _id
          { 
            $set: {
              "batchList.$.batchID": batchID,
              "batchList.$.batchQty": batchQty,
              "batchList.$.expiryDate": expiryDate,
            }
          },
          { new: true }
        );

        // Increment the quantity by the difference (p) using MongoDB's incrementer
        await Product.findByIdAndUpdate(_idProduct, { $inc: { quantity: quantityDifference } });

        // Fetch the updated product with batch list to ensure correctness
        const updatedProduct = await Product.findById(_idProduct).populate('batchList');

        // Ensure that updatedBatchList is sent in the response
        res.json(updatedProduct.batchList);
      } catch (error) {
        console.log(error);
        res.status(402).send("Error");
      }
    };


const getAllProducts = async (req, res) => {
  try {
    const allProducts = await Product.find({ userID: req.params.userId });

    // Sort the products based on the expiry date of the first batch in each item
    allProducts.sort((a, b) => {
      const expiryDateA = a.batchList.length > 0 ? new Date(a.batchList[0].expiryDate) : new Date();
      const expiryDateB = b.batchList.length > 0 ? new Date(b.batchList[0].expiryDate) : new Date();
      return expiryDateA - expiryDateB;
    });

    res.json(allProducts);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching products', message: error.message });
  }
};
const searchProduct = async (req, res) => {
  try {
    const {userID, itemName } = req.query;

    // Create a query object based on parameters
    const query = {
      // userID: req.params.userID,
      userID: "user",
      itemName: { $regex: new RegExp(itemName, 'i') }, // Case-insensitive string search
    };

    // Execute the query
    const records = await Product.find(query);
    // Send the results
    res.json(records);
  } catch (error) {
    console.error('Error fetching records:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const deleteProduct =  async (req, res) => {
  const deleteProduct = await Product.deleteOne(
    { _id: req.params.id }
  );
  res.json({ deleteProduct});
};
const deleteBatch = async (req, res) => {
  const { id, Batchid } = req.params; // Use _id instead of id

  try {
    // Find the product in the inventory
    const product = await Product.findOne({ _id: id });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Find the batch in the product's batchList
    const batch = product.batchList.find((batch) => batch._id == Batchid);

    if (!batch) {
      return res.status(404).json({ error: 'Batch not found' });
    }

    // Decrease the product's quantity by the batchQty
    product.quantity -= batch.batchQty;

    // Remove the batch from the batchList
    product.batchList = product.batchList.filter(
      (batch) => batch._id != Batchid
    );

    // Save the updated product
    const updatedProduct = await product.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error deleting batch:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
const addBatchList = async (req, res) => {
  try {
    const { batchID, batchQty, expiryDate } = req.body;
    const updatedProduct = await Product.findByIdAndUpdate(
      { _id: req.body._id },
      { 
        $push: { batchList: { $each: [{ batchID, batchQty, expiryDate }], $sort: { expiryDate: 1 } } },
        $inc: { quantity: batchQty } // Increment the stock by batchQty
      },
      { new: true }
    );
    // console.log(Product);
    res.json({ message: 'BatchList added successfully', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ error: 'Error adding batchList', message: error.message });
  }
};
const updateItemQuantityInInvoice = async (req, res) => {
  try {
    const itemsToUpdate = req.body; // Assuming req.body is an array of items [{ itemName, requestedQuantity }, ...]

    // Fetch inventory items for all requested items
    const inventoryItems = await Promise.all(
      itemsToUpdate.map(async ({ _id }) => {
        const item = await Product.findOne({ '_id': _id });
        return item;
      })
    );

    for (let i = 0; i < itemsToUpdate.length; i++) {
      //const { itemName, requestedQuantity } = itemsToUpdate[i];
      const itemName=itemsToUpdate[i].itemName;
      const requestedQuantity=itemsToUpdate[i].quantity;
      // console.log("itemname down");
      // console.log(itemName);
      const inventoryItem = inventoryItems[i];
      if (!inventoryItem) {
        return res.status(404).json({ error: `Inventory item not found for ${itemName}` });
      }

      let remainingQuantity = requestedQuantity;
      // console.log("remaining quantity down");
      // console.log(remainingQuantity);
      for (let batchList of inventoryItem.batchList) {
        const availableQuantity = batchList.batchQty;
        // console.log(batchList.expiryDate)
        // If the requested quantity is less than or equal to the available quantity in the current batch
        if (remainingQuantity <= availableQuantity) {
          batchList.batchQty -= remainingQuantity;
          remainingQuantity = 0; // Requested quantity fulfilled
        } else {
          // Move to the next batch
          batchList.batchQty = 0;
          remainingQuantity -= availableQuantity;
        }
        // console.log(remainingQuantity);
        // console.log(batchList.batchQty);
        // If the updated quantity is 0, remove the batch from the batchList
        // if (batchList.batchQty === 0) {
        //   inventoryItem.batchList = inventoryItem.batchList.filter(b => b.expiry !== batchList.expiry);
        // }
        if (batchList.batchQty === 0) {
          // Remove the batch from the batchList if quantity becomes zero
          inventoryItem.batchList = inventoryItem.batchList.filter(b => b.expiryDate !== batchList.expiryDate);
        }
        if (remainingQuantity === 0) {
          inventoryItem.quantity-=requestedQuantity;
          break; // Exit the loop as the quantity has been updated for the current item
        }
      }

      if (remainingQuantity > 0) {
        return res.status(400).json({ error: `Insufficient quantity in batchList for ${itemName}. Requested ${requestedQuantity}, available ${requestedQuantity - remainingQuantity}.` });
      }
    }

    const updatedInventoryItems = await Promise.all(inventoryItems.map(item => item.save()));

    // Assuming you have an invoice model and want to save it
    // const updatedInvoice = await invoice.save();

    res.json({ message: 'Item quantities in the inventory updated successfully', inventory: updatedInventoryItems });
  } catch (error) {
    console.error('Error updating item quantities in invoice:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports={
  addProduct, 
  updateProduct,
  getAllProducts,
  searchProduct,
  deleteProduct,
  addBatchList,
  updateBatch,
  deleteBatch, 
  updateItemQuantityInInvoice,
   };