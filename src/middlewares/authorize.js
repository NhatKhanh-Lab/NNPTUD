const ApiError = require("../utils/ApiError");

module.exports = (...allowedRoles) => (req, res, next) => {
  const roleName = req.user?.role?.name;

  if (!roleName || !allowedRoles.includes(roleName)) {
    return next(new ApiError(403, "Ban khong co quyen thuc hien chuc nang nay"));
  }

  return next();
};
