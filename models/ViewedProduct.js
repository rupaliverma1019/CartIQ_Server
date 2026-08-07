const mongoose = require("mongoose");


const viewProductSchema = new mongoose.Schema(
    {
        User : {
            type : mongoose.Schema.Types.ObjectId,
            ref: "User",
            required : true

        },
        Product : {
            type : mongoose.Schema.Types.ObjectId,
            ref : "Product" ,
            required : true
        }
    },{
        timestamps :true
    }
)

module.exports  = mongoose.model(
    "viewedProduct" , viewProductSchema
)