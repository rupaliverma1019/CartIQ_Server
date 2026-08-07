const Product = require("../models/Product");

const getRelatedProducts = async( req , res) =>{
    try {
        const { productId } = req.params;
        const currentProduct = await Product.findById(productId);
        console.log({
        category: currentProduct.category,
        price: currentProduct.price,
});
        if(!currentProduct)
        {
            return res.status(404).json({
                success : true,
                message : "product not found"
            })
        }
        const relatedProduct = await Product.find({
            _id : {$ne : productId},
            category : currentProduct.category,
            price : {
                $gte:currentProduct.price*0.7,
                $lte:currentProduct.price*1.3
            }
        }).limit(4).sort("-createdAt")
        return res.status(200).json({
            success: true,
            products:relatedProduct ,


        })


    } catch (error) {
         return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
    
}

module.exports = {
  getRelatedProducts,
};