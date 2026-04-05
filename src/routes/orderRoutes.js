const express = require("express");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/orderController");
const { createOrderSchema, updateOrderStatusSchema } = require("../validators/orderValidators");

const router = express.Router();

router.use(catchAsync(auth));
router.get("/", catchAsync(controller.getOrders));
router.get("/:id", catchAsync(controller.getOrderById));
router.post("/", authorize("customer"), validate(createOrderSchema), catchAsync(controller.createOrderFromCart));
router.patch(
  "/:id/status",
  authorize("admin", "staff"),
  validate(updateOrderStatusSchema),
  catchAsync(controller.updateOrderStatus)
);

module.exports = router;
