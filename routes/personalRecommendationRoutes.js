const express = require("express")
const router = express.Router()

const { getPersonalRecommendations } = require("../controllers/personalRecommendationController")

const { protect } = require("../middleware/authMiddleware")

router.get("/", protect, getPersonalRecommendations);

module.exports = router;