const express = require("express");

const router = express.Router();

const {  getRecommendations} = require("../controllers/recommendationController");

router.get("/:productId", getRecommendations);

module.exports = router;