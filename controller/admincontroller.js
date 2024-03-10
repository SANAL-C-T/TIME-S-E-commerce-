
const adminData = require("../model/adminSchema")
const productData = require("../model/productSchema")
const categoryData = require("../model/categorySchema")
const bannerData = require("../model/bannerSchema")
const userDatas = require("../model/userSchema")
const orderData=require("../model/orderhistoryschema")
const bcrypt = require("bcrypt")
require('dotenv').config();
const jwt = require("jsonwebtoken");
const { finished } = require("nodemailer/lib/xoauth2")
const jwtsecret = process.env.jwt_admin_secret
/* ---------------------------------------------------- */
const adminlogin = async (req, res) => {
    try {
        const urlData = {
            pageTitle: 'ADMIN LOGIN',

        };
        console.log()
        res.render("admin/adminlogin.ejs", { urlData })

    } catch (error) {
        console.log(error.message)
    }
}
/* ------------------------------------------------------ */
const hashpass = async (pass) => {
    try {
        const codedpass = await bcrypt.hash(pass, 10);
        return codedpass;
    }
    catch (error) {
        console.log(error.message)
    }
}


//logic to add extradetails of admin,connection to schema
/* ---------------------------------------------------- */
const adminDataStore = async (req, res) => {

    console.log(req.body)

    const secret = await hashpass(req.body.password)
    try {
        const adminDetails = new adminData({
            email: req.body.email,
            password: secret,
            phone: req.body.phone,
            username: req.body.username,
            date: req.body.date,
            status: req.body.status,
            profileImage: req.body.profileImage


        })

        await adminDetails.save()
    }
    catch (error) {
        console.log(error.message)
    }
}



/* ============================================================ */



//logic for authentication
const adminVerification = async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        const checkDb = await adminData.findOne({ username })
        if (checkDb) {
            const matchPassword = await bcrypt.compare(password, checkDb.password)
            console.log(matchPassword)
            let databaseusername = checkDb.username
            if (matchPassword && username == databaseusername) {

                const token = await jwt.sign(//generationg jwt token
                    { id: checkDb._id, username: username },
                    jwtsecret,
                    { expiresIn: "28800000" }
                )

                //senting token using cookie
                const options = {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    httpOnly: true
                }

                res.cookie("token", token, options)//sending in cookie


                res.redirect("/admin/dashboard")
            } else {
                console.log("authentication failed")
                res.redirect("/admin/enter")

            }
        }


    }
    catch (error) {
        console.log(error.message)
    }
}

/* ------------------------------------------------- */
const adminDashboard = async (req, res) => {
    try {
        const urlData = {
            pageTitle: 'ADMIN DASHBOARD',

        };


        res.render("admin/adminDashboard", { urlData })

    } catch (error) {
        console.log(error.message)
    }
}

/* ------------------------------------------------------------ */
const adminbanner = async (req, res) => {
    try {
        const urlData = {
            pageTitle: 'ADMIN BANNER SETTING',

        };


        res.render("admin/adminBanner.ejs", { urlData })

    } catch (error) {
        console.log(error.message)
    }
}
/* ------------------------------------------------------------ */
const adminproduct = async (req, res) => {
    try {

        const categories = await categoryData.find({
            Categorystatus:true});
        const urlData = {
            pageTitle: 'ADMIN PRODUCT ADD',
            cat: categories
        };

        res.render("admin/adminProducts.ejs", { urlData })
    }
    catch (error) {
        console.log(error.message)
    }
}



/* --------------------------------------------------------- */
const showcategory = async (req, res) => {
    try {


        const c=await categoryData.find({})
        const urlData = {
            pageTitle: 'ADMIN CATEGORY',
            cat:c
        };


        res.render("admin/adminCategory.ejs", { urlData })

    } catch (error) {
        console.log(error.message)
    }
}


/* ---------------------------------------------------- */
const addcategory = async (req, res) => {
   
    let cateN = req.body.categoryName


    try {
        let act;
        let stat=req.body.Categorystatus
        if(stat=="active"){
            act=true;
        }else if(stat=="inactive"){
            act=false;
        }

        // console.log("incoming data:::::", req.body)
        const addcategoryDetails = new categoryData({
            categoryName: req.body.categoryName,
            Categorystatus: act
        });

        console.log(addcategoryDetails.categoryName);


        // const alreadyCat = await categoryData.findOne({ categoryName: cateN })
        const alreadyCat = await categoryData.findOne({ categoryName: {$regex:new RegExp(cateN,'i')}})

        if (alreadyCat === null) {
            await addcategoryDetails.save();
            console.log("Category data saved");
        } else {
            console.log("category already exist so data not saved to database")
    
        }


        res.redirect("/admin/category")
    } catch (error) {
        console.error(error.message);

    }
};


/* ------------------------------------------------------------ */
const addbanner = async (req, res) => {
    try {



        const addbannerDetails = new bannerData({

            profileImage: req.body.profileImage

        })



        await addbannerDetails.save()
    }
    catch (error) {
        console.log(error.message)
    }
}

/* ---------------------------------------------------- */
const logout = async (req, res) => {
    try {
        console.log(req.cookie)
        res.clearCookie('token')
        console.log(req.cookie)
        res.redirect("/admin/enter")
    }
    catch (error) {
        console.log(error.message)
    }
}


/* ---------------------------------------------------- */
const usermanage = async (req, res) => {

    try {
        const UD = await userDatas.find({});
        const urlData = {
            pageTitle: 'ADMIN USER MANAGEMENT',
            userdetails: UD
        };
        res.render("admin/adminUserMnage.ejs", { urlData });
    }
    catch (error) {
        console.log(error.message)
    }
}

/* ---------------------------------------------------- */
const usersetting = async (req, res) => {
    console.log("Entering usersetting function");
    const userId = req.params.id;
    let w = (await userDatas.findById(userId))


    if (w.status == true) {
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

/* ---------------------------------------------------- */
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


/* ---------------------------------------------------- */
const deleCategory=async(req,res)=>{
try{
    console.log("cat delete")
    const ide=req.params.id

    // console.log("::::::::::",ide)
    const cid = await categoryData.updateOne({_id: ide}, {$set: {Categorystatus: false}});
    res.redirect("/admin/category")

}
catch(error){
    console.log(error.message)
}
}

/* ---------------------------------------------------- */
const restoreCategory=async(req,res)=>{
    try{
const cats=req.params.id;

        await categoryData.updateOne({_id:cats},{$set:{Categorystatus:true}})

        res.redirect("/admin/category")
    }
    catch(error){
        console.log(error.message)
    }
}

/* ---------------------------------------------------- */

const editorCategory=async(req,res)=>{
    try{
let categid=req.params.id
let catedata=await categoryData.findOne({_id:categid})


const toEjs={
catsdata:catedata
}
res.render("admin/admineditcategory.ejs",{toEjs})


    }
    catch(error){
        console.log(error.message)
    }
}


/* ---------------------------------------------------- */
const editedCategory=async(req,res)=>{
try{
let newcategoryname=req.body.categoryName;
let newstatus=req.body.Categorystatus;
let ids=req.params.id;
await categoryData.updateOne({_id:ids},{$set:{categoryName:newcategoryname,Categorystatus:newstatus}})
res.redirect("/admin/category")
}
catch(error){
    console.log(error.message)
}
}

/* ---------------------------------------------------- */
const orderManagement=async(req,res)=>{
    try{

        const urlData = {
            pageTitle: 'ORDER MANAGEMENT',
        }

let userOrder=await orderData.find({})
// console.log("lllk",userOrder)
res.render("admin/ordermanagement.ejs",{urlData, userOrder})
    }
    catch(error){
        console.log(error.message)
    }
}

/* ---------------------------------------------------- */


const orderStatusUpdate=async(req,res)=>{
    console.log("status")
    try{
        let orderId = req.params.id;
        let index = req.body.index;
        let status = req.body.status;

        console.log("rrr", orderId, index, status);
        await orderData.updateOne(
            { _id: orderId },
            { $set: { Status: status } }
        );

        // if (status === "Cancel") {
        //     let productItems = await orderData.findOne({ _id: orderId }).select('items');

        //     for (const element of productItems.items) {
        //         console.log(element.quantity, element.products);
        //         await productData.updateOne({ _id: element.products }, { $inc: { stockCount: element.quantity } });
        //     }
        // }



res.redirect("/admin/orders")
    }
    catch(error){
        console.log(error.message)
    }
}








/* ---------------------------------------------------- */

module.exports = {
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
    usersetting1,
    deleCategory,
    editorCategory,
    restoreCategory,
    editedCategory,
    orderManagement,
    orderStatusUpdate,
  


}
/* ---------------------------------------------------- */