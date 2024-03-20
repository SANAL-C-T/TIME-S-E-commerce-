const { ObjectId } = require('mongodb');
const mongoose = require('mongoose');
require('../model/config');

const orderHistorySchema = mongoose.Schema({
    userid: ObjectId,
    orderId: ObjectId,
    OrderDate:String,
    DeliveredDate:String,
    paymentMethod: String,
    address: String,
    userid: ObjectId,
    items:[],
    Address:String,
    OrderTotalPrice: Number,
    tax:Number,
    Discounted:Number,
    Status:String,
    unitPrice: Number,
    
    Couponused: String,
    discountgiven: Number,
});

const orderData = mongoose.model('orderHistory', orderHistorySchema);
module.exports = orderData;
