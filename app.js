const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes =require("./routes/cartRoutes");
const addressRoutes =require("./routes/addressRoutes");
const orderRoutes = require("./routes/orderRoutes")
const adminRoutes =require("./routes/adminRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const aiRoutes = require("./routes/aiRoutes");
const recommendationRoutes =require("./routes/recommendationRoutes");
const relatedProductRoutes =require("./routes/relatedProductRoutes");
const personalRecommendationRoutes = require("./routes/personalRecommendationRoutes");
const historyRoutes = require("./routes/historyRoutes")
const customerRecommendationRoutes = require("./routes/customerRecommendationRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");


const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());

// Test Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Cloud Boutique AI Backend is running 🚀",
  });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/addresses",addressRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/admin",adminRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);
app.use("/api/v1/ai", aiRoutes);
app.use( "/api/v1/recommendations/personal", personalRecommendationRoutes);
app.use("/api/v1/recommendations",recommendationRoutes);
app.use(  "/api/v1/related-products", relatedProductRoutes);
app.use("/api/v1/history" , historyRoutes)
app.use("/api/v1/customers-also-bought",customerRecommendationRoutes);
app.use( "/api/v1/wishlist",  wishlistRoutes);
module.exports = app;