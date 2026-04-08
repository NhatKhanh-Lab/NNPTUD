const Role = require("../models/Role");
const ApiError = require("../utils/ApiError");

exports.createRole = async (req, res) => {
  const { name, description } = req.body;
  if (!name) {
    throw new ApiError(400, "Tên vai trò là bắt buộc");
  }

  const role = await Role.create({ name, description });
  res.status(201).json({ success: true, data: role });
};

exports.getRoles = async (req, res) => {
  const roles = await Role.find().sort({ createdAt: 1 });
  res.json({ success: true, data: roles });
};

exports.updateRole = async (req, res) => {
  const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  if (!role) {
    throw new ApiError(404, "Không tìm thấy vai trò");
  }
  res.json({ success: true, data: role });
};

exports.deleteRole = async (req, res) => {
  const role = await Role.findByIdAndDelete(req.params.id);
  if (!role) {
    throw new ApiError(404, "Không tìm thấy vai trò");
  }
  res.json({ success: true, message: "Đã xóa vai trò" });
};
