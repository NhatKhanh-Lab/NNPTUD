const express = require("express");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const upload = require("../middlewares/upload");
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/userController");

const router = express.Router();

router.use(catchAsync(auth), authorize("admin"));

router.route("/")
  .get(catchAsync(controller.getUsers))
  .post(upload.single("avatar"), catchAsync(controller.createUser));

router.route("/:id")
  .get(catchAsync(controller.getUserById))
  .put(upload.single("avatar"), catchAsync(controller.updateUser))
  .delete(catchAsync(controller.deleteUser));

module.exports = router;
