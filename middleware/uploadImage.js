

//this is the multer configeration part.
const multer=require("multer")
const storage=multer.diskStorage({

    destination:function(req,file,callback){
        callback(null,"upload") //this is the destiontion to which pic is stored
    },
    filename: function (req, file, cb) {//remnaming function
        var ext=file.originalname.substring(file.originalname.lastIndexOf("."))

        cb(null,file.originalname+ "-"+Date.now()+ext)
    },
})

const upload=multer({//creating an instence of this configeration
    storage: storage,
})

//above is the configeration only.


//converting to middleware
const singleUpload = (req, res, next) => {
    upload.single("productImage")(req,res,function(err){
        if(err){
            console.log("image not uploaded")
        }{
            console.log("image upload success")
            
        }
        next();
        
    })
   
    
};

const multiUpload = (req, res, next) => {
    upload.array("productImage", 5)(req, res, function (err) {
        if (err ) {
            console.log(err.message ,"image not uploaded")
        } else {
            //logic for collecting new name and path of stored image.

            console.log("image upload success")
        }
        next(); 
        })
       
};









module.exports={
    singleUpload,
    multiUpload
}