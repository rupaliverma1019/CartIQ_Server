const express = require("express");

const router = express.Router();

const { protect } =
require("../middleware/authMiddleware");

const {
  addToCart,
  getCart,
  removeFromCart,
  updateCartQuantity,
} = require("../controllers/cartController");

router.post("/", protect, addToCart);

router.get("/", protect, getCart);

router.put("/:id", protect, updateCartQuantity);

router.delete("/:id", protect, removeFromCart);

module.exports = router;