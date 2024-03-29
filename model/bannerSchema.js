
const mangoose = require("mongoose")
require("../model/config")
const bannerCollection = mangoose.Schema({

    TextContent: String,
    SubTextContent: String,
    bannerImage: String,


});

const bannerData = mangoose.model("banner", bannerCollection);
module.exports = bannerData;