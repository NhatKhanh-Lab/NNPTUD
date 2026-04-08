const Category = require("../models/Category");
const ApiError = require("../utils/ApiError");

exports.createCategory = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, "Tên danh mục là bắt buộc");
  }

  const category = await Category.create({ name, description });
  res.status(201).json({ success: true, data: category });
};

exports.getCategories = async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.json({ success: true, data: categories });
};

exports.getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, "Không tìm thấy danh mục");
  }
  res.json({ success: true, data: category });
};

exports.updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!category) {
    throw new ApiError(404, "Không tìm thấy danh mục");
  }
  res.json({ success: true, data: category });
};

exports.deleteCategory = async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new ApiError(404, "Không tìm thấy danh mục");
  }
  res.json({ success: true, message: "Đã xóa danh mục" });
};
