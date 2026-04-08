const express = require("express");
const auth = require("../middlewares/auth");
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/cartController");

const router = express.Router();

router.use(catchAsync(auth));
router.get("/me", catchAsync(controller.getMyCart));
router.post("/items", catchAsync(controller.addToCart));
router.put("/items/:id", catchAsync(controller.updateCartItem));
router.delete("/items/:id", catchAsync(controller.removeCartItem));

module.exports = router;
