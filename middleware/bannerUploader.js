const multer = require("multer");
const storeBanner=multer.diskStorage({

    destination:function(req,res,callback){
        callback(null,"uploadBanner")
    },


    filename:function(req,res,callback){
        var ext=file.originalname.substring(file.originalname.lastIndexOf("."))
        callback(null,file.originalname+"-"+Date.now()+ext)
    }

})

const bannerUpload=multer({

    storage:storeBanner
})


const singleBanner = (req, res, next) => {
    upload.single("bannerImage")(req,res,function(err){
        if(err){
            console.log("BANNER not uploaded")
        }{
            console.log("BANNER upload success")
            
        }
        next();
        
    })
   
    
};

const multiBanner = (req, res, next) => {
    upload.array("bannerImage", 5)(req, res, function (err) {
        if (err ) {
            console.log(err.message ,"BANNER not uploaded")
        } else {
            //logic for collecting new name and path of stored image.

            console.log("BANNER upload success")
        }
        next(); 
        })
       
};

module.exports={
    multiBanner,
    singleBanner
}