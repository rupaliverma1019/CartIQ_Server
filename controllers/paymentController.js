const Razorpay=require("../config/razorpay");
const Order=require("../models/Order");
const crypto=require("crypto");

const createPaymentOrder=async(req,res)=>{
try{
const {orderId}=req.body;

const order=await Order.findById(orderId);

if(!order){
return res.status(404).json({
success:false,
message:"Order not found"
});
}

const payment=await Razorpay.orders.create({
amount:order.total*100,
currency:"INR",
receipt:order.orderNumber
});

order.razorpayOrderId=payment.id;
await order.save();
return res.status(200).json({
success:true,
payment
});
}
catch(error){
return res.status(500).json({
success:false,
message:error.message
});
}
};



const verifyPayment=async(req,res)=>{
try{
const{razorpay_order_id,razorpay_payment_id,razorpay_signature}=req.body;

const generatedSignature=crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id+"|"+razorpay_payment_id).digest("hex");
if(generatedSignature!==razorpay_signature){
return res.status(400).json({
success:false,
message:"Invalid Signature"
});
}

const order=await Order.findOne({razorpayOrderId:razorpay_order_id});
order.paymentStatus="Paid";
order.orderStatus="Confirmed";
order.razorpayPaymentId=
razorpay_payment_id;
await order.save();
return res.status(200).json({
success:true,
message:"Payment Successful"
});
}
catch(error){
return res.status(500).json({
success:false,
message:error.message
});

}

};

module.exports = { createPaymentOrder ,  verifyPayment}