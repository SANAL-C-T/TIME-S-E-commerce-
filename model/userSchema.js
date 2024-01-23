
const mongoose=require("mongoose");

require("../model/config")

const userSchema=mongoose.Schema({
    first_name:{
        type:String,
        
    },
    second_name:{
        type:String,
    },
    email:{
        type:String,
        required: true
    },
    password:{
        type:String,
        required: true
    },
    phone:{
        type:Number,
        required: true
    },
    permission:{//blocked or unblocked
        type:String,
    },
    username:{
        type:String,
        required: true
    },
    date:{//date of joining
        type: Date,
    },
    status: { //active now or not
        type: Boolean,
        default: true,
    },
    profileImage: {
        type: String, // Store the path to the uploaded image
    },
    verified:{
        type:Boolean
    }
});

const userData=mongoose.model("user",userSchema);

module.exports=userData;