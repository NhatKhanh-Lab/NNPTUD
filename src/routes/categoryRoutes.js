const express = require("express");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/categoryController");

const router = express.Router();

router.get("/", catchAsync(controller.getCategories));
router.get("/:id", catchAsync(controller.getCategoryById));
router.post("/", catchAsync(auth), authorize("admin", "staff"), catchAsync(controller.createCategory));
router.put("/:id", catchAsync(auth), authorize("admin", "staff"), catchAsync(controller.updateCategory));
router.delete("/:id", catchAsync(auth), authorize("admin"), catchAsync(controller.deleteCategory));

module.exports = router;
