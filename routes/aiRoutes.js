
const express = require("express");

const router = express.Router();

const {
  searchProductsAI,
} = require("../controllers/aiController");

router.post("/search", searchProductsAI);

module.exports = router;