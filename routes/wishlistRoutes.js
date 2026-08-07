const express = require("express");

const router = express.Router();



const { protect } = require("../middleware/authMiddleware");
const { addToWishList, getWishList, removeWishList, checkWishlist } = require("../controllers/wishlistController");

router.post("/", protect, addToWishList);

router.get("/", protect, getWishList);

router.delete( "/:productID", protect, removeWishList);

router.get(  "/check/:productID", protect, checkWishlist);

module.exports = router;