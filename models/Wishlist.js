const mongoose = require("mongoose")
const User = require("./User")
const Product = require("./Product")


const wishListSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : User,
        require : true
    },
    product : {
        type : mongoose.Schema.Types.ObjectId,
        ref : Product,
        require : true
    }
},{
    timestamps: true
})

// Prevent duplicate wishlist entries for the same user/product
wishListSchema.index(
    {user : 1 , product : 1},
    {unique :true }
)

module.exports = mongoose.model("WishList " , wishListSchema)