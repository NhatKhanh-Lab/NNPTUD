module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Co loi xay ra trong he thong";

  console.error(err);

  res.status(statusCode).json({
    success: false,
    message
  });
};
