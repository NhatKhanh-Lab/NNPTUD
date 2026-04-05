const ApiError = require("../utils/ApiError");

module.exports = (schema, options = {}) => {
  const source = options.source || "body";
  const target = options.target || `validated${source[0].toUpperCase()}${source.slice(1)}`;

  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues[0]?.message || "Du lieu gui len khong hop le";
      return next(new ApiError(400, message));
    }

    req[target] = result.data;
    return next();
  };
};
