
const mangoose=require("mongoose")
require("../model/config")
const bannerCollection =  mangoose.Schema({
    bannerImage: {
        img1: { type: String },
        img2: { type: String },
        img3: { type: String },
        img4: { type: String },
        img5: { type: String },
        img6: { type: String },
        img7: { type: String },
        img8: { type: String },
        img9: { type: String },
    },
    AddedOn: { type: Date },
    text: { type: String },
});

const bannerData=mangoose.model("banner",bannerCollection);
module.exports=bannerData;