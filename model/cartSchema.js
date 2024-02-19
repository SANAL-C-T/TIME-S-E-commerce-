const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const userData = require("./userSchema");
require("../model/config")

const cartSchema = mongoose.Schema({
    couponCode: String,

    userid: ObjectId,
    items: [
        {
            products: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
            quantity: Number,


        }
    ],
    TotalPrice: Number
})

const cartData = mongoose.model("carts", cartSchema)

module.exports = cartData;