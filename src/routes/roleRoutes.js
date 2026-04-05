const express = require("express");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/roleController");

const router = express.Router();

router.use(catchAsync(auth), authorize("admin"));
router.route("/")
  .get(catchAsync(controller.getRoles))
  .post(catchAsync(controller.createRole));

router.route("/:id")
  .put(catchAsync(controller.updateRole))
  .delete(catchAsync(controller.deleteRole));

module.exports = router;
