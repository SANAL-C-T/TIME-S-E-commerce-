const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const userData = require("./userSchema");
require("../model/config")

const cartSchema = mongoose.Schema({
    couponCode: String,
    couponApplied: {
        type: Boolean,
        default: false,
      },
    userid: ObjectId,
    items: [
        {
            products: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
            productName:String,
            productImage:String,
            quantity: Number,
            price:Number,
            DiscountedAmount:Number,
            discounted:Boolean
        }
    ],

    Address:String,
    OrderTotalPrice: Number,
    tax:Number,
    Discounted:Number,
    CouponCode:String
})

const cartData = mongoose.model("carts", cartSchema)

module.exports = cartData;