const userData=require("../model/userSchema")
const otpData=require("../model/otpSchema")
// const session = require("express-session")


const otpEntryForm=async(req,res)=>{
    try{
        res.render("user/otp.ejs")
    }
    catch(error){
        console.log(error.message)
    }
}


const otpVerify=async(req,res)=>{
    try{
        let str="";
        str = str+req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5;

        let otp=Number(str);
        console.log("typed:",otp)

        
        
        let incomingOtp=req.session.otp
       

     console.log("generatedOtp:",incomingOtp)

     if(otp==incomingOtp){
        console.log("hello matched")
       res.redirect("/saveData")
     }
        
    }
    catch(error){
        console.log(error.message)
    }
}









module.exports={
    otpEntryForm,
    otpVerify,
   
}