const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const getDashboardSummary =async(req,res)=>{
try{
const totalUsers=await User.countDocuments();
const totalProducts=await Product.countDocuments({isActive:true});
const totalOrders=await Order.countDocuments();
const revenue=await Order.aggregate([
{$match:{paymentStatus:"Paid"}},
{$group:{_id:null,totalRevenue:{$sum:"$total"}}}]);
return res.status(200).json({
success:true,
dashboard:{
totalUsers,
totalProducts,
totalOrders,
totalRevenue:
revenue[0]?.totalRevenue ||0
}
});
}
catch(error){
return res.status(500).json({
success:false,
message:error.message
});
}
};
const getMonthlySales =async(req,res)=>{

const sales=

await Order.aggregate([

{

$match:{

paymentStatus:"Paid"

}

},

{

$group:{

_id:{

month:{

$month:"$createdAt"

}

},

sales:{

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

return res.status(200).json({

success:true,

sales

});

};
const getLatestOrders =async(req,res)=>{
const orders=await Order.find().populate("user","name email").sort("-createdAt").limit(10);
return res.status(200).json({success:true,orders});
};

const getLowStockProducts =async(req,res)=>{

const products=

await Product.find({

stock:{

$lt:10

},

isActive:true

})

.select(

"title stock images"

);

return res.status(200).json({

success:true,

products

});

};

const getTopSellingProducts =async(req,res)=>{

const products=

await Order.aggregate([

{

$unwind:"$items"

},

{

$group:{

_id:"$items.product",

title:{

$first:"$items.title"

},

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

return res.status(200).json({

success:true,

products

});

};

const getOrderStatusAnalytics =async(req,res)=>{

const status=

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

return res.status(200).json({

success:true,

status

});

};

module.exports={

getDashboardSummary,

getMonthlySales,

getLatestOrders,

getTopSellingProducts,

getLowStockProducts,

getOrderStatusAnalytics

};
