const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");

const recalculateCartTotal = async (cartId, session = null) => {
  const items = await CartItem.find({ cart: cartId }).session(session);
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
  await Cart.findByIdAndUpdate(cartId, { totalAmount }, { session });
  return totalAmount;
};

module.exports = {
  recalculateCartTotal
};
