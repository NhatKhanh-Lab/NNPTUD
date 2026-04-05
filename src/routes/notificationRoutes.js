const express = require("express");
const auth = require("../middlewares/auth");
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/notificationController");

const router = express.Router();

router.use(catchAsync(auth));
router.get("/me", catchAsync(controller.getMyNotifications));
router.patch("/:id/read", catchAsync(controller.markNotificationAsRead));

module.exports = router;
