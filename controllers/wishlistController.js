const Wishlist = require("../models/Wishlist")
const Product = require("../models/Product")


const addToWishList = async(req , res) =>{
    try {
        const { productID } = req.body
        const product = await Product.findById(productID)

        if(!product)
        {
            return res.status(404).json({
                success : false,
                message : "Product not found"
            })
        }
        const exist = await Wishlist.findOne({
    user: req.user._id,
    product: productID,
});
        if(exist)
        {
            return res.status(400).json({
                success : false,
                message : "product already available in wishlist"
            })
        }
        await Wishlist.create({
            user : req.user._id,
            product : productID
            
        })
        res.status(200).json({
            success : true,
            message : " Added to wishlist"
        })
        
    } catch (error) {
        res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}

const getWishList = async(req , res) =>{
    try {
        const wishlist = await Wishlist.find({
            user : req.user._id
        }).populate("product")

        res.json({
            success : true,
            wishlist
        })
    } 
    
    catch (error) {
        res.status(500).json({
      success: false,
      message: error.message,
    });
    }
}

const removeWishList = async(req, res)=>{
    try {
        await Wishlist.findOneAndDelete({
             user: req.user._id,
            product: req.params.productID,
        })
        res.json({
      success: true,
      message: "Removed from wishlist",
    });
    } catch (error) {
        res.status(500).json({
      success: false,
      message: error.message,
    });

    }
}

const checkWishlist = async (req, res) => {
  try {
    console.log("Logged-in User:", req.user._id);
    console.log("Product ID:", req.params.productID);

    const exists = await Wishlist.findOne({
      user: req.user._id,
      product: req.params.productID,
    });

    console.log("Exists:", exists);

    res.json({
      success: true,
      isWishlisted: !!exists,
      
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addToWishList,
  getWishList,
  removeWishList,
  checkWishlist,
};