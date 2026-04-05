const Cart = require("../models/Cart");
const CartItem = require("../models/CartItem");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const { recalculateCartTotal } = require("../services/cartService");

exports.getMyCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  const items = await CartItem.find({ cart: cart._id }).populate("product", "name price image stock");

  res.json({
    success: true,
    data: {
      cart,
      items
    }
  });
};

exports.addToCart = async (req, res) => {
  const { productId, quantity } = req.body;
  const normalizedQuantity = Number(quantity);
  if (!productId || !quantity) {
    throw new ApiError(400, "Vui lòng cung cấp món ăn và số lượng");
  }
  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
    throw new ApiError(400, "Số lượng phải là số nguyên dương");
  }

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new ApiError(404, "Không tìm thấy món ăn");
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id });
  }

  const existingItem = await CartItem.findOne({ cart: cart._id, product: productId });
  if (existingItem) {
    const nextQuantity = existingItem.quantity + normalizedQuantity;
    if (product.stock < nextQuantity) {
      throw new ApiError(400, "Số lượng tồn kho không đủ");
    }

    existingItem.quantity = nextQuantity;
    existingItem.subtotal = existingItem.quantity * existingItem.unitPrice;
    await existingItem.save();
  } else {
    if (product.stock < normalizedQuantity) {
      throw new ApiError(400, "Số lượng tồn kho không đủ");
    }

    await CartItem.create({
      cart: cart._id,
      product: productId,
      quantity: normalizedQuantity,
      unitPrice: product.price,
      subtotal: normalizedQuantity * product.price
    });
  }

  await recalculateCartTotal(cart._id);
  const items = await CartItem.find({ cart: cart._id }).populate("product", "name price image stock");
  const updatedCart = await Cart.findById(cart._id);

  res.status(201).json({
    success: true,
    message: "Đã thêm món vào giỏ",
    data: {
      cart: updatedCart,
      items
    }
  });
};

exports.updateCartItem = async (req, res) => {
  const { quantity } = req.body;
  const normalizedQuantity = Number(quantity);
  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
    throw new ApiError(400, "Số lượng phải là số nguyên dương");
  }

  const item = await CartItem.findById(req.params.id).populate("product");
  if (!item) {
    throw new ApiError(404, "Không tìm thấy món trong giỏ");
  }
  const cart = await Cart.findById(item.cart);
  if (!cart || String(cart.user) !== String(req.user._id)) {
    throw new ApiError(403, "Bạn không có quyền cập nhật giỏ hàng này");
  }
  if (item.product.stock < normalizedQuantity) {
    throw new ApiError(400, "Số lượng tồn kho không đủ");
  }

  item.quantity = normalizedQuantity;
  item.subtotal = item.quantity * item.unitPrice;
  await item.save();

  await recalculateCartTotal(item.cart);
  res.json({ success: true, data: item });
};

exports.removeCartItem = async (req, res) => {
  const item = await CartItem.findById(req.params.id);
  if (!item) {
    throw new ApiError(404, "Không tìm thấy món trong giỏ");
  }
  const cart = await Cart.findById(item.cart);
  if (!cart || String(cart.user) !== String(req.user._id)) {
    throw new ApiError(403, "Bạn không có quyền xóa món trong giỏ này");
  }

  await CartItem.findByIdAndDelete(req.params.id);
  await recalculateCartTotal(item.cart);
  res.json({ success: true, message: "Đã xóa món khỏi giỏ" });
};
