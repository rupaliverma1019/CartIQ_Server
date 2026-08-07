const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();

const { createProduct , getProducts , getProductById , updateProduct , deleteProduct , createProductReview , addToWishlist, removeFromWishlist, getWishlist, restoreProduct} = require("../controllers/productController");

const {
  protect,
  authorize,
} = require("../middleware/authMiddleware");


router.get("/", getProducts)

router.post( "/", protect, authorize("admin"), upload.array("images", 5),createProduct);
router.put("/:id",protect,authorize("admin"),upload.array("images", 5),updateProduct);
router.delete( "/:id", protect, authorize("admin"),deleteProduct);
router.post("/:id/reviews", protect,createProductReview);
router.post("/wishlist/:id",protect, addToWishlist);
router.delete("/wishlist/:id", protect, removeFromWishlist);
router.get("/wishlist",protect,getWishlist);
router.get("/:id", getProductById);
router.put(
  "/restore/:id",
  protect,
  authorize("admin"),
  restoreProduct
);
module.exports = router;