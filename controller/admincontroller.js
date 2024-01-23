
const adminData=require("../model/adminSchema")
const productData=require("../model/productSchema")
const categoryData=require("../model/categorySchema")
const bannerData=require("../model/bannerSchema")
const userDatas=require("../model/userSchema")
const bcrypt=require("bcrypt")
require('dotenv').config();
const jwt=require("jsonwebtoken");
const { finished } = require("nodemailer/lib/xoauth2")
const jwtsecret=process.env.jwt_admin_secret
/* ---------------------------------------------------- */
const adminlogin=async(req,res)=>{
    try{
        const urlData = {
            pageTitle: 'ADMIN LOGIN',
            
        };
console.log()
   res.render("admin/adminlogin.ejs",{ urlData })

    }catch(error){
        console.log(error.message)
    }
}
/* ------------------------------------------------------ */
const hashpass=async(pass)=>{
        try{
            const codedpass= await bcrypt.hash(pass,10);
            return codedpass;
        } 
        catch(error){
                console.log(error.message)
            }
}


//logic to add extradetails of admin,connection to schema

const adminDataStore=async(req,res)=>{

console.log(req.body)

const secret=await hashpass(req.body.password)
    try{
        const adminDetails=new adminData({
            email:req.body.email,
            password:secret,
            phone:req.body.phone,
            username:req.body.username,
            date:req.body.date,
            status: req.body.status,
            profileImage: req.body.profileImage
                
           
        })

        await adminDetails.save()
    }
    catch(error){
        console.log(error.message)
    }
}



/* ============================================================ */



//logic for authentication
const  adminVerification=async(req,res)=>{
    try{
        const username=req.body.username;
        const password=req.body.password;
        const checkDb=await adminData.findOne({username})
        if(checkDb){
             const matchPassword=await bcrypt.compare(password,checkDb.password)
                    console.log(matchPassword)
                let databaseusername=checkDb.username
                if(matchPassword&&username==databaseusername){
                   
                    const token=await jwt.sign(//generationg jwt token
                        {id:checkDb._id,username:username},
                        jwtsecret,
                        {expiresIn:"28800000"}
                        )

                    //senting token using cookie
                    const options={
                        expires:new Date(Date.now()+ 7*24*60*60*1000),
                        httpOnly:true
                    }

                    res.cookie("token",token,options)//sending in cookie


                    res.redirect("/admin/dashboard")
                }else{
                    console.log("authentication failed")
                    res.redirect("/admin/enter")

                }
            }
     

        }
    catch(error){
        console.log(error.message)
    }
}

/* ------------------------------------------------- */
const adminDashboard=async(req,res)=>{
    try{
        const urlData = {
            pageTitle: 'ADMIN DASHBOARD',
            
        };


   res.render("admin/adminDashboard",{ urlData })

    }catch(error){
        console.log(error.message)
    }
}

/* ------------------------------------------------------------ */
const adminbanner=async(req,res)=>{
    try{
        const urlData = {
            pageTitle: 'ADMIN BANNER SETTING',
            
        };


   res.render("admin/adminBanner.ejs",{ urlData })

    }catch(error){
        console.log(error.message)
    }
}
/* ------------------------------------------------------------ */
const adminproduct=async(req,res)=>{
    try{

        const categories = await categoryData.find();
        const urlData = {
            pageTitle: 'ADMIN PRODUCT ADD',
            cat:categories
        };

        res.render("admin/adminProducts.ejs",{urlData})
    }
    catch(error){
        console.log(error.message)
    }
}



/* --------------------------------------------------------- */
const showcategory=async(req,res)=>{
    try{
        const urlData = {
            pageTitle: 'ADMIN CATEGORY',
            
        };


   res.render("admin/adminCategory.ejs",{ urlData })

    }catch(error){
        console.log(error.message)
    }
}

const addcategory = async (req, res) => {
    try {


        console.log("incoming data",req.body)
        const addcategoryDetails = new categoryData({
            categoryName: req.body.categoryName,
            Categorystatus: req.body.Categorystatus
        });

        console.log(addcategoryDetails.categoryName); // Corrected line

        await addcategoryDetails.save();

        console.log("Category data saved");
        res.redirect("/admin/category")
    } catch (error) {
        console.error(error.message);
       
    }
};


/* ------------------------------------------------------------ */
const addbanner=async(req,res)=>{
    try{
        const addbannerDetails=new bannerData({
         
            profileImage: req.body.profileImage
                
        })
        await addbannerDetails.save()
    }
    catch(error){
        console.log(error.message)
    }
}


const logout=async(req,res)=>{
    try{
        console.log(req.cookie)
        res.clearCookie('token')
        console.log(req.cookie)
        res.redirect("/admin/enter")
    }
    catch(error){
        console.log(error.message)
    }
}

const usermanage=async(req,res)=>{

        try {
            const UD = await userDatas.find({});
            const urlData = {
                pageTitle: 'ADMIN USER MANAGEMENT',
                userdetails :UD
            };         
            res.render("admin/adminUserMnage.ejs", { urlData});
    }
    catch(error){
        console.log(error.message)
    }
}


// const usersetting=async(req,res)=>{

//     console.log("hello")
//     try{
// const useri=req.params.id;
// await userDatas.findByIdAndUpdate(useri, { status: false });

//     }
//     catch(error){
//         console.log(error.message)
//     }
// }

const usersetting = async (req, res) => {
    console.log("Entering usersetting function");
    const userId = req.params.id;
    let w=(await userDatas.findById(userId))


    if(w.status==true){
        try {
            console.log("User w:", w.status);
            console.log("User ID:", userId);
            await userDatas.findByIdAndUpdate(userId, { status: false });
           
    
           res.redirect("/admin/usercontol")
        } catch (error) {
            console.error(error.message);
           
        }
    }
   
};


const usersetting1 = async (req, res) => {
    console.log("Entering usersetting function");
    try {
        const userId = req.params.id;
        console.log("User ID:", userId);
        await userDatas.findByIdAndUpdate(userId, { status: true });
       res.redirect("/admin/usercontol")
    } catch (error) {
        console.error(error.message);
       
    }
};




module.exports={
    adminlogin,
    adminDashboard,
    adminbanner,
    adminVerification,
    adminDataStore,
    adminproduct,
    addbanner,
    addcategory,
    showcategory,
    logout,
    usermanage,
    usersetting,
    usersetting1

    
}