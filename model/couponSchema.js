const mongoose=require("mongoose");

const couponSchema=mongoose.Schema({
couponCode:String,
discount:Number,
expiryDate:Date
})
const couponData=mongoose.model("coupon",couponSchema)

module.exports=couponData;