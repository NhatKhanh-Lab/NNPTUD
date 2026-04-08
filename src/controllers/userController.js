const bcrypt = require("bcryptjs");
const Cart = require("../models/Cart");
const User = require("../models/User");
const Role = require("../models/Role");
const ApiError = require("../utils/ApiError");

exports.createUser = async (req, res) => {
  const { fullName, email, password, roleName, phone, address } = req.body;
  if (!fullName || !email || !password || !roleName) {
    throw new ApiError(400, "Vui lòng nhập đầy đủ họ tên, email, mật khẩu và vai trò");
  }

  const role = await Role.findOne({ name: roleName });
  if (!role) {
    throw new ApiError(400, "Không tìm thấy vai trò");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    address,
    role: role._id,
    avatar: req.file ? `/uploads/avatars/${req.file.filename}` : undefined
  });

  await Cart.create({ user: user._id });

  const populatedUser = await User.findById(user._id).populate("role");
  res.status(201).json({ success: true, data: populatedUser });
};

exports.getUsers = async (req, res) => {
  const users = await User.find().populate("role").sort({ createdAt: -1 });
  res.json({ success: true, data: users });
};

exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id).populate("role");
  if (!user) {
    throw new ApiError(404, "Không tìm thấy người dùng");
  }
  res.json({ success: true, data: user });
};

exports.updateUser = async (req, res) => {
  const payload = { ...req.body };

  if (payload.roleName) {
    const role = await Role.findOne({ name: payload.roleName });
    if (!role) {
      throw new ApiError(400, "Không tìm thấy vai trò");
    }
    payload.role = role._id;
    delete payload.roleName;
  }

  if (req.file) {
    payload.avatar = `/uploads/avatars/${req.file.filename}`;
  }

  if (payload.password) {
    payload.password = await bcrypt.hash(payload.password, 10);
  }

  const user = await User.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  }).populate("role");

  if (!user) {
    throw new ApiError(404, "Không tìm thấy người dùng");
  }

  res.json({ success: true, data: user });
};

exports.deleteUser = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    throw new ApiError(404, "Không tìm thấy người dùng");
  }
  res.json({ success: true, message: "Đã xóa người dùng" });
};
