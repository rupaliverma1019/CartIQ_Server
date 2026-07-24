const Cart = require("../models/Cart");
const User = require("../models/User");
const Order = require("../models/Order");
const generateOrderNumber = require("../utils/generateOrderNumber");


const placeOrder = async (req, res) => {
  try {

    const { paymentMethod, addressId } = req.body;

    const cart =
      await Cart.findOne({
        user: req.user._id,
      }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const user =
      await User.findById(req.user._id);

    const address =
      user.addresses.id(addressId);

    if (!address) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    const orderItems =
      cart.items.map(item => ({
        product: item.product._id,
        title: item.product.title,
        image: item.product.images[0]?.url,
        price: item.price,
        quantity: item.quantity,
      }));

    const order =
      await Order.create({

        orderNumber:
          generateOrderNumber(),

        user: req.user._id,

        items: orderItems,

        shippingAddress: {
          fullName: address.fullName,
          phone: address.phone,
          addressLine1:
            address.addressLine1,
          addressLine2:
            address.addressLine2,
          city: address.city,
          state: address.state,
          country: address.country,
          postalCode:
            address.postalCode,
        },

        paymentMethod,

        subtotal: cart.subtotal,

        shipping: cart.shipping,

        tax: cart.tax,

        total: cart.total,

      });

    cart.items = [];

    cart.subtotal = 0;

    cart.shipping = 0;

    cart.tax = 0;

    cart.total = 0;

    await cart.save();

    return res.status(201).json({
      success: true,
      message:
        "Order placed successfully",
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
const orders = await Order.find({user:req.user._id}).sort("-createdAt");
return res.status(200).json({
success:true,
orders
});
};

const getAllOrders = async (req, res) => {
const orders =await Order.find().populate("user","name email").sort("-createdAt");
return res.status(200).json({
success:true,
orders
});
};

const updateOrderStatus = async(req,res)=>{
    const order= await Order.findById(req.params.id);
    order.orderStatus = req.body.status;
    await order.save();
return res.json(order);
};

module.exports = {placeOrder , getMyOrders , getAllOrders , updateOrderStatus}