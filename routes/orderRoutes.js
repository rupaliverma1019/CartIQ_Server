const express = require("express");

const router = express.Router();

const {
createOrder,
getMyOrders,
getAllOrders,
updateOrderStatus,
getOrderDetails
} = require("../controllers/orderController");

const {protect,authorize} = require("../middleware/authMiddleware");

router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);

router.get("/admin",protect,authorize("admin"),getAllOrders);

router.put("/:id/status",protect,authorize("admin"),updateOrderStatus);
router.get(  "/:id", protect, getOrderDetails);
module.exports = router;