const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");

const applySession = (query, session) => (session ? query.session(session) : query);

const findCartByUser = (userId, session = null) => applySession(Cart.findOne({ user: userId }), session);

const findCartItemsWithProducts = (cartId, session = null) =>
  applySession(CartItem.find({ cart: cartId }).populate("product"), session);

const clearCart = async (cartId, session = null) => {
  const options = session ? { session } : {};
  await CartItem.deleteMany({ cart: cartId }, options);
  await Cart.findByIdAndUpdate(cartId, { totalAmount: 0 }, options);
};

const restoreCartSnapshot = async (cart, cartItems) => {
  await Cart.findByIdAndUpdate(cart._id, { totalAmount: cart.totalAmount });
  for (const item of cartItems) {
    await CartItem.updateOne(
      { cart: cart._id, product: item.product._id },
      {
        cart: cart._id,
        product: item.product._id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal
      },
      { upsert: true }
    );
  }
};

module.exports = {
  findCartByUser,
  findCartItemsWithProducts,
  clearCart,
  restoreCartSnapshot
};
