const mongoose=require("mongoose");
require("../model/config")
const categoryCollection=mongoose.Schema({
categoryName:{
    type:String
},
Categorystatus:{
    type:Boolean
},

})

const categoryData=mongoose.model("category",categoryCollection);
module.exports=categoryData;