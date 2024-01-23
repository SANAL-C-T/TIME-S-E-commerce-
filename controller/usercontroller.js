const userData=require("../model/userSchema")
const productDatas=require("../model/productSchema")
const bcrypt=require("bcrypt")
const { render } = require("ejs")
// const session = require("express-session")
const JWTtoken=require("jsonwebtoken")
require('dotenv').config();
const jwtcode=process.env.jwt_user_secret
//control function begins here

//for displaying haome page without login.

// const homeNotLog=async(req,res)=>{
//     try{
// const loadProduct= await productDatas.find({});
// console.log("image",loadProduct.productImage.image1)

//         res.render("user/userHomeNotlog.ejs",{loadProduct})
//     }
//     catch(error){
//         console.log(error.message)
//     }
// }


const homeNotLog = async (req, res) => {
    try {
        const loadProduct = await productDatas.find({ productCategory:"SAMSUNG"});
        const loadProductA = await productDatas.find({ productCategory:"APPLE"});
        const loadProductG = await productDatas.find({ productCategory:"GARMIN"});
        // console.log(loadProduct)     
        
        res.render("user/userHomeNotlog.ejs", { loadProduct,loadProductA,loadProductG});
    } catch (error) {
        console.log(error.message);
    }
};





const home=async(req,res)=>{
    try{
        const loadProduct = await productDatas.find({ productCategory:"SAMSUNG"});
        const loadProductA = await productDatas.find({ productCategory:"APPLE"});
        const loadProductG = await productDatas.find({ productCategory:"GARMIN"});
        // console.log(loadProduct)     
        
        res.render("user/userHomepage.ejs", { loadProduct,loadProductA,loadProductG});
      
    }catch(error){
        console.log(error.message)
    }
}

// for taking the user to login page on clickig any buy now on home page
const login=async(req,res)=>{
    try{
        res.render("user/userlogin.ejs")
    }catch(error){
        console.log(error.message)
    }
}

const loginVerify=async(req,res)=>{
    try{
    let user=req.body.username;
    let pass=req.body.password;
  
    let dbEmail=await userData.findOne({username:user}).select('username')
    let dbpass=await userData.findOne({password:pass}).select('password')
        let stat=await userData.findOne({username:user}).select('status')
console.log("stat",stat)
        if(stat.status==false){
            res.redirect("/login")
        }

    
   
    if(dbEmail.username==user&&dbpass.password==pass){
        console.log("verified user")

        const usertoken= JWTtoken.sign({id:dbEmail },
           jwtcode,
           {expiresIn:"28800000"} )

           const options={
            expires:new Date(Date.now() + 7*24*60*60*1000),
            httpOnly:true
           }
           res.cookie("usertoken",usertoken,options)
           console.log("token created")
         res.redirect("/home")
     }else{
        console.log("not verified user")
        res.redirect("/login")
        
        }
    }
    catch(error){
        console.log(error.message)
    }
}




//if user is not signedup take to signup page
const signup=async(req,res)=>{
    try{
        res.render("user/usersignup.ejs")
    }catch(error){
        console.log(error.message)
    }
}


// store comming data to database
const storeData=async(req,res)=>{
    console.log(req.session.email)
    try{// here i am only storing the data at the time of signup
        const userdetails=new userData({
            username:req.session.username,
            email: req.session.email,
            password: req.session.password,
            phone: req.session.phone,
            verified:true
        })   
        console.log("Saved in database")
        await userdetails.save()        
        req.session.destroy()
        res.redirect("/login")
    }
    catch(error){
        console.log("test",error.message)
    }
}


const allproductPage= async(req,res)=>{
    try{
        const allproduct=await productDatas.find({})
        res.render("user/productdisplay.ejs",{allproduct})
    }
    catch(error){
        console.log(error.message)
    }
}



const productdetail=async(req,res)=>{
    try{
        console.log("hello")
        const pId = req.params.productId;
        // console.log("selected product:",pId);
const pdetail=await productDatas.findById(pId)
// console.log("detail product:",pdetail);

        res.render("user/buyProduct.ejs",{pdetail})
}
    catch(error){
        console.log(error.message)
}
}

const buyProduct=async(req,res)=>{
    //product details
        try{
            res.render("user/buyProduct.ejs")
        }catch(error){
            console.log(error.message)
        }
    }



//if a page is not found




const notfound=async(req,res)=>{  
    try{
console.log("IN USER CONTROLLER if no page is found in function notfound")

        res.render("user/404.ejs")
    }catch(error){
        console.log(error.message)
    }
}

const logout=async(req,res)=>{
    try{
        console.log("logout")
        res.clearCookie('usertoken');
        res.redirect("/home.")
    }
    catch(error){
        console.log(error.message)
    }
}


module.exports={
    home,
    notfound,
    login,
    signup,
    storeData,
    homeNotLog,
    allproductPage,
    loginVerify,
    buyProduct,
    productdetail,
    logout
    
}