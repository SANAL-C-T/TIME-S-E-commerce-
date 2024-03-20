const { default: mongoose } = require("mongoose")
const mangoose=require("mongoose")
require("../model/config")


const productCollection=mangoose.Schema({
    productName:{
        type:String,
        required:true
    },
    productCategory:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    productDescription:{
        type:String,
        required:true
    },
           
    variant:[{
                productsize:{
                    type:String,
                   
                },
                productcolour:{
                    type:String,
                 
                }
            }],

    quantity:{
        type:Number,
       
    },
    productImage:[{
        image1:{
            type:String
        },
        image2:{
            type:String
        },
        image3:{
            type:String
        },
        image4:{
            type:String
        },
        image5:{
            type:String
        },
        image0:{
            type:String
        },
    }],

    image360degree:[{
        image3601:{
            type:String
        },
        image3602:{
            type:String
        },
        image3603:{
            type:String
        },
        image3604:{
            type:String
        },
        image3605:{
            type:String
        },
        image3600:{
            type:String
        },
    }],

    status:{
        type:String,
        enum:["draft","published","outOfStock","lowStock"]
    },
    stockCount:{
        type:Number
    },
    uniqueID:{// for checking status
        type:Number
    },
    specification:[{
      
        brand:{
            type:String
        },
        MadeIn:{
            type:String
        },
        StrapMaterial:{
            type:String
        },
        waterResistant:{
            type:Boolean
        },
        display:{
            type:String
        },
        screenSize:{
            type:String
        },
        fastCharge:{
            type:Boolean
        },
        battery:{
            type:String
        },
        weight:{
            type:String
        },
        sleepTracker:{
            type:Boolean
        },
        warranty:{
            type:String
        },

    }]
    ,
    productPrice:{
        type:Number,
        required:true
    },
    rating:{
        type:Number
    },

    Comment:{
        type:String
    },
    
    addedDate:{
        type:Date
    },
    isDeleted:{
        type:Boolean,
        default: false,
    },
    isdiscount:{
        type:Boolean,
        default: false,
    },
    offer:[{
        Discountvalue:Number,
        StartDate:String,
        endDate:String
    }]

})
const productData=mongoose.model("products",productCollection);
module.exports=productData;