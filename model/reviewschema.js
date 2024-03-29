const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
require("../model/config")
const reviewSchema = mongoose.Schema({
    comment: String,
    rating: Number,
    user: ObjectId,//will store id, 
    product: ObjectId,
    Time: { type: Date, default: Date.now }
});

const reviewData = mongoose.model("review", reviewSchema);

module.exports = reviewData;
