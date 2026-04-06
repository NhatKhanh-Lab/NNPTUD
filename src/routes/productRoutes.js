const express = require("express");
const auth = require("../middlewares/auth");
const authorize = require("../middlewares/authorize");
const upload = require("../middlewares/upload");
const catchAsync = require("../utils/catchAsync");
const controller = require("../controllers/productController");

const router = express.Router();

router.get("/", catchAsync(controller.getProducts));
router.get("/:id", catchAsync(controller.getProductById));
router.post("/", catchAsync(auth), authorize("admin", "staff"), upload.single("image"), catchAsync(controller.createProduct));
router.put("/:id", catchAsync(auth), authorize("admin", "staff"), upload.single("image"), catchAsync(controller.updateProduct));
router.delete("/:id", catchAsync(auth), authorize("admin"), catchAsync(controller.deleteProduct));

module.exports = router;
