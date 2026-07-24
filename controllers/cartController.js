
// Lesson 18 – Shopping Cart API (Production Ready)
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const calculateCart =require("../utils/cartCalculator");

// item add to cart 
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      item => item.product.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({
        product: product._id,
        quantity: Number(quantity),
        price: product.discountPrice || product.price,
      });
    }

    await calculateCart(cart);

    await cart.save();

    return res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getCart = async (req, res) => {

  const cart = await Cart.findOne({
    user: req.user._id,
  }).populate(
    "items.product",
    "title price discountPrice images stock"
  );

  if (!cart) {
    return res.status(200).json({
      success: true,
      cart: {
        items: [],
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      },
    });
  }

  return res.status(200).json({
    success: true,
    cart,
  });

};

const removeFromCart = async (req, res) => {

  const { id } = req.params;

  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = cart.items.filter(
    item =>
      item.product.toString() !== id
  );

  await calculateCart(cart);

  await cart.save();

  return res.status(200).json({
    success: true,
    message: "Item removed",
    cart,
  });

};

const updateCartQuantity = async (req, res) => {

  const { id } = req.params;

  const { quantity } = req.body;

  const cart = await Cart.findOne({
    user: req.user._id,
  });

  const item = cart.items.find(
    item =>
      item.product.toString() === id
  );

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  item.quantity = Number(quantity);

  await calculateCart(cart);

  await cart.save();

  return res.status(200).json({
    success: true,
    cart,
  });

};

module.exports = { addToCart , getCart , removeFromCart , updateCartQuantity}