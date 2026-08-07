const ViewedProduct = require("../models/ViewedProduct")

const saveViewedProduct = async(req , res) =>{
    try {
        const { productId } = req.body
       const exists = await ViewedProduct.findOne({
            User :  req.user._id,
            Product : productId
        })

        if(!exists)
        {
            await ViewedProduct.create({
                User : req.user._id,
                Product : productId
            })
        }
        res.json({
            success : true
        })

    } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {saveViewedProduct}