const express = require("express");

const router = express.Router();

const {  getCustomersAlsoBought } = require("../controllers/customerRecommendationController");

router.get("/:productID", getCustomersAlsoBought);

module.exports = router;