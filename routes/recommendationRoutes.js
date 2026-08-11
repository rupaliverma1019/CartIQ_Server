const express = require("express");

const router = express.Router();

const {
  getRecommendations,
  getPersonalizedRecommendations,
} = require("../controllers/recommendationController");

const { protect } = require("../middleware/authMiddleware");

// Personalized recommendations
router.get(
  "/personalized",
  protect,
  getPersonalizedRecommendations
);

// Product-specific recommendations
router.get(
  "/:productId",
  getRecommendations
);

module.exports = router;