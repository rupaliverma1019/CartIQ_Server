const express = require("express");

const router = express.Router();

const {protect,authorize} = require("../middleware/authMiddleware");

const {getDashboardSummary,getMonthlySales,getLatestOrders,getTopSellingProducts,getLowStockProducts,getOrderStatusAnalytics} = require("../controllers/adminController");

router.use(protect,authorize("admin"));

router.get("/dashboard",getDashboardSummary);

router.get("/monthly-sales",getMonthlySales);

router.get("/latest-orders",getLatestOrders);

router.get("/top-products",getTopSellingProducts);

router.get("/low-stock",getLowStockProducts);

router.get("/order-status",getOrderStatusAnalytics);

module.exports = router;