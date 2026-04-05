const Product = require("../models/Product");

const decrementStock = (productId, quantity, session = null) =>
  Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity } },
    session ? { session } : {}
  );

const incrementStock = (productId, quantity, session = null) =>
  Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } }, session ? { session } : {});

module.exports = {
  decrementStock,
  incrementStock
};
