const express = require("express")
const { protect } = require("../middleware/authMiddleware")
const { saveViewedProduct } = require("../controllers/historyController")
 
const router = express.Router()

router.post("/" , protect , saveViewedProduct)

module.exports = router