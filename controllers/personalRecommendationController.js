const Product = require("../models/Product");
const Order = require("../models/Order");

const getPersonalRecommendations = async (req, res) => {
  try {
console.log("req.user =", req.user);
    const orders = await Order.find({
  user: req.user._id,
}).populate("items.product");

console.log(JSON.stringify(orders, null, 2));

    if (!orders.length) {

      const products = await Product.find()
        .limit(8);

      return res.json({
        success: true,
        products,
      });
    }

    const categories = [];

    const brands = [];

    orders.forEach(order => {

      order.items.forEach(item => {

        if (item.product) {

          categories.push(item.product.category);

          brands.push(item.product.brand);

        }

      });

    });

    const uniqueCategories = [...new Set(categories)];

    const uniqueBrands = [...new Set(brands)];

    const products = await Product.find({

      $or: [

        { category: { $in: uniqueCategories } },

        { brand: { $in: uniqueBrands } },

      ],

    }).limit(12);

    console.log(
  products.map((p) => ({
    id: p._id,
    title: p.title,
    category: p.category,
    brand: p.brand,
  }))
);
    res.json({

      success: true,

      products,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }
};

module.exports = {
  getPersonalRecommendations,
};