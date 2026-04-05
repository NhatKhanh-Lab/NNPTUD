const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { verifyToken } = require("../utils/token");

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ApiError(401, "Ban chua dang nhap"));
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  const user = await User.findById(decoded.userId).populate("role");
  if (!user || !user.isActive) {
    return next(new ApiError(401, "Tai khoan khong con kha dung"));
  }

  req.user = user;
  return next();
};
