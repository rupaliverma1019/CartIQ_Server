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

module.exports = app;