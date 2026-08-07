const express = require("express")
const router = express.Router();

const {getRelatedProducts  } = require("../controllers/relatedProductController")

router.get("/:productId" , getRelatedProducts)

module.exports = router