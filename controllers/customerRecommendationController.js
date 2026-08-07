const Order = require("../models/Order");
const Product = require("../models/Product");

const getCustomersAlsoBought = async(req , res) =>{
    try {
        const {productID} = req.params;
        console.log("Product ID:", productID);

        const orders = await Order.find({
            "items.product" : productID
        })

        console.log("Orders found:", orders.length);
console.log(orders);
        const frequency = {}
        orders.forEach(order=>{
            order.items.forEach(item=>{
               const id = item.product.toString()
               if(id !== productID)
               {
                frequency[id] = (frequency[id] || 0 ) + 1
               }
            })
        })

      const sortedIDs =  Object.keys(frequency).sort((a , b) => frequency[b] - frequency[a])
      const products = await Product.find({
        _id : {$in: sortedIDs},
      }) 

       products.sort(
      (a, b) =>
        sortedIDs.indexOf(a._id.toString()) -
        sortedIDs.indexOf(b._id.toString())
    );

      res.json({
        success : true,
        products

      })

    } catch (error) {
        res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}

module.exports = {
  getCustomersAlsoBought,
};
