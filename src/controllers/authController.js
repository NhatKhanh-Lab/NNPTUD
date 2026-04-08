const Role = require("../models/Role");
const User = require("../models/User");
const Cart = require("../models/Cart");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/token");

const buildAuthResponse = (user) => ({
  token: signToken({ userId: user._id }),
  user
});

exports.register = async (req, res) => {
  const { fullName, email, password, phone, address } = req.body;
  if (!fullName || !email || !password) {
    throw new ApiError(400, "Vui lòng nhập đầy đủ họ tên, email và mật khẩu");
  }

  const existedUser = await User.findOne({ email });
  if (existedUser) {
    throw new ApiError(400, "Email này đã được sử dụng");
  }

  const customerRole = await Role.findOne({ name: "customer" });
  if (!customerRole) {
    throw new ApiError(500, "Hệ thống chưa có vai trò khách hàng, vui lòng seed dữ liệu trước");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    address,
    avatar: req.file ? `/uploads/avatars/${req.file.filename}` : undefined,
    role: customerRole._id
  });

  await Cart.create({ user: user._id });

  const populatedUser = await User.findById(user._id).populate("role");
  res.status(201).json({
    success: true,
    message: "Đăng ký tài khoản thành công",
    data: buildAuthResponse(populatedUser)
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new ApiError(400, "Vui lòng nhập email và mật khẩu");
  }

  const user = await User.findOne({ email }).select("+password").populate("role");
  if (!user) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng");
  }

  const matched = await user.comparePassword(password);
  if (!matched) {
    throw new ApiError(401, "Email hoặc mật khẩu không đúng");
  }

  user.password = undefined;

  res.json({
    success: true,
    message: "Đăng nhập thành công",
    data: buildAuthResponse(user)
  });
};

exports.me = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};
