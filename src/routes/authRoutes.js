const express = require("express");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const catchAsync = require("../utils/catchAsync");
const authController = require("../controllers/authController");

const router = express.Router();

router.post("/register", upload.single("avatar"), catchAsync(authController.register));
router.post("/login", catchAsync(authController.login));
router.get("/me", catchAsync(auth), catchAsync(authController.me));

module.exports = router;
