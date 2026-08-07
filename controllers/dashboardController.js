const Product = require("../models/Product");
const User = require("../models/User");
const Order = require("../models/Order");

const getDashboardStats = async (req, res) => {

  try {

    const totalProducts =
      await Product.countDocuments();

    const totalUsers =
      await User.countDocuments();

    const totalOrders =
      await Order.countDocuments();

    const revenue = await Order.aggregate([
      {
        $group:{
          _id:null,
          totalRevenue:{
            $sum:"$total"
          }
        }
      }
    ]);

    const totalRevenue =
      revenue.length
      ? revenue[0].totalRevenue
      : 0;

    // Monthly Revenue

    const monthlySales =
      await Order.aggregate([

        {
          $group:{

            _id:{
              month:{
                $month:"$createdAt"
              }
            },

            revenue:{
              $sum:"$total"
            }

          }

        },

        {
          $sort:{
            "_id.month":1
          }
        }

      ]);

    // Payment Distribution

    const paymentStats =
      await Order.aggregate([

        {

          $group:{

            _id:"$paymentMethod",

            count:{
              $sum:1
            }

          }

        }

      ]);

    // Order Status

    const orderStatus =
      await Order.aggregate([

        {

          $group:{

            _id:"$orderStatus",

            count:{
              $sum:1
            }

          }

        }

      ]);

    // Top Selling Products

    const topProducts =
      await Order.aggregate([

        {
          $unwind:"$items"
        },

        {

          $group:{

            _id:"$items.title",

            sold:{
              $sum:"$items.quantity"
            }

          }

        },

        {

          $sort:{
            sold:-1
          }

        },

        {

          $limit:10

        }

      ]);

    res.json({

      success:true,

      totalProducts,

      totalUsers,

      totalOrders,

      totalRevenue,

      monthlySales,

      paymentStats,

      orderStatus,

      topProducts

    });

  }

  catch(error){

    res.status(500).json({

      success:false,

      message:error.message

    });

  }

};

module.exports={
getDashboardStats
};