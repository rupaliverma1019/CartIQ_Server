const Cart = require("../models/Cart");
const User = require("../models/User");
const Order = require("../models/Order");
const generateOrderNumber = require("../utils/generateOrderNumber");


// const createOrder = async (req, res) => {
//   try {
//     const orderNumber = generateOrderNumber();
//     console.log("Create Order User:", req.user._id);
//     console.log(orderNumber);

//     // const order = await Order.create({
//     //   ...req.body,
//     //   user: req.user._id,
//     //   orderNumber,
      
//     // });
// const subtotal = req.body.subtotal || 0;
// const shipping = req.body.shipping || 0;
// const tax = req.body.tax || 0;
// const total = subtotal + shipping + tax;
//     const order = await Order.create({
//   ...req.body,
//   subtotal,
//   shipping,
//   tax,
//   total,
//   user: req.user._id,
//   orderNumber,
// });
//     console.log("Saved User:", order.user);

//     res.status(201).json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     console.log(error);

//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

const createOrder = async (req, res) => {
  try {
    const orderNumber = generateOrderNumber();

    const items = req.body.items || [];
    const subtotal = Number(req.body.subtotal || 0);
    const shipping = Number(req.body.shipping || 0);
    const tax = Number(req.body.tax || 0);
    const total = subtotal + shipping + tax;

    const order = await Order.create({
      items,
      shippingAddress: req.body.shippingAddress,
      paymentMethod: req.body.paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      user: req.user._id,
      orderNumber,
    });

    return res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


const getMyOrders = async (req, res) => {
  console.log("Logged in user:", req.user._id);

  const orders = await Order.find({
    user: req.user._id,
  }).sort("-createdAt");

  console.log("Orders found:", orders);

  return res.status(200).json({
    success: true,
    orders,
  });
};

const getAllOrders = async (req, res) => {
const orders =await Order.find().populate("user","name email").sort("-createdAt");
return res.status(200).json({
success:true,
orders
});
};

const updateOrderStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const allowedStatus = [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
    ];

    if (!allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Status",
      });
    }

    order.orderStatus = status;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


const getOrderDetails = async (req, res) => {
  try {

   const order = await Order.findById(req.params.id).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (
      order.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


module.exports = {createOrder , getMyOrders , getAllOrders , updateOrderStatus , getOrderDetails}