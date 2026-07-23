const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const { createProduct , getProducts , getProductById , updateProduct , deleteProduct} = require("../controllers/productController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");


router.get("/", getProducts)
router.get("/:id", getProductById);
router.post( "/", protect, authorize("admin"), upload.array("images", 5),createProduct);
router.put("/:id",protect,authorize("admin"),upload.array("images", 5),updateProduct);
router.delete( "/:id", protect, authorize("admin"),deleteProduct);


module.exports = router;