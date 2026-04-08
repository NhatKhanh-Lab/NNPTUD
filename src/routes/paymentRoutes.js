const express = require("express");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const validate = require("../middlewares/validate");
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/paymentController");
const { updatePaymentStatusSchema } = require("../validators/paymentValidators");

const router = express.Router();

router.use(catchAsync(auth), authorize("admin", "staff"));
router.get("/", catchAsync(controller.getPayments));
router.put("/:id/status", validate(updatePaymentStatusSchema), catchAsync(controller.updatePaymentStatus));

module.exports = router;
