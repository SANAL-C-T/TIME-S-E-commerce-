const mongoose=require("mongoose");
require("../model/config")
const categoryCollection=mongoose.Schema({
categoryName:{
    type:String
},
Categorystatus:{
    type:String
},

})

const categoryData=mongoose.model("category",categoryCollection);
module.exports=categoryData;