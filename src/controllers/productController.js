const Category = require("../models/Category");
const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");

exports.createProduct = async (req, res) => {
  const { name, description, price, stock, categoryId } = req.body;
  if (!name || !price || !categoryId) {
    throw new ApiError(400, "Vui lòng nhập tên món, giá và danh mục");
  }

  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(400, "Danh mục không tồn tại");
  }

  const product = await Product.create({
    name,
    description,
    price,
    stock,
    category: categoryId,
    createdBy: req.user._id,
    image: req.file ? `/uploads/products/${req.file.filename}` : undefined
  });

  const populated = await Product.findById(product._id).populate("category createdBy", "name fullName email");
  res.status(201).json({ success: true, data: populated });
};

exports.getProducts = async (req, res) => {
  const filter = {};
  if (req.query.categoryId) {
    filter.category = req.query.categoryId;
  }
  if (req.query.keyword) {
    filter.name = { $regex: req.query.keyword, $options: "i" };
  }

  const products = await Product.find(filter)
    .populate("category", "name")
    .populate("createdBy", "fullName email")
    .sort({ createdAt: -1 });

  res.json({ success: true, data: products });
};

exports.getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name")
    .populate("createdBy", "fullName email");

  if (!product) {
    throw new ApiError(404, "Không tìm thấy món ăn");
  }

  res.json({ success: true, data: product });
};

exports.updateProduct = async (req, res) => {
  const payload = { ...req.body };
  if (payload.categoryId) {
    payload.category = payload.categoryId;
    delete payload.categoryId;
  }
  if (req.file) {
    payload.image = `/uploads/products/${req.file.filename}`;
  }

  const product = await Product.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  })
    .populate("category", "name")
    .populate("createdBy", "fullName email");

  if (!product) {
    throw new ApiError(404, "Không tìm thấy món ăn");
  }

  res.json({ success: true, data: product });
};

exports.deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw new ApiError(404, "Không tìm thấy món ăn");
  }
  res.json({ success: true, message: "Đã xóa món ăn" });
};
