const userData = require("../model/userSchema")
const productDatas = require("../model/productSchema")
const categData = require("../model/categorySchema")
const reviewData=require("../model/reviewschema")
const bcrypt = require("bcrypt")
const { render } = require("ejs")
// const session = require("express-session")
const JWTtoken = require("jsonwebtoken")
require('dotenv').config();
const jwtcode = process.env.jwt_user_secret


//control function begins here
const homeNotLog = async (req, res) => {
    try {
        let loadProduct = 0;
let loadProductG = 0;
let loadProductA = 0;

const samsungProduct = await productDatas.find({
    productCategory: '65ae1ded74d4441c5067ee22', // Replace with the actual category ID
    isDeleted: false,
})
.populate({
    path: 'productCategory',
    match: { Categorystatus: true } // Only include categories with Categorystatus set to true
})
.exec();

if (samsungProduct[0].productCategory && samsungProduct[0].productCategory.Categorystatus === true) {
    console.log("Samsung product loaded");
    loadProduct = samsungProduct;
} else {
    loadProduct = 0;
}

const appleProduct = await productDatas.find({
    productCategory: '65ae1df474d4441c5067ee24', // Replace with the actual category ID
    isDeleted: false,
})
.populate({
    path: 'productCategory',
    match: { Categorystatus: true } // Only include categories with Categorystatus set to true
})
.exec();

if (appleProduct[0].productCategory && appleProduct[0].productCategory.Categorystatus === true) {
    console.log("Apple product loaded");
    loadProductA = appleProduct;
} else {
    loadProductA = 0;
}

const garminProduct = await productDatas.find({
    productCategory: '65ae1e0674d4441c5067ee26', // Replace with the actual category ID
    isDeleted: false,
})
.populate({
    path: 'productCategory',
    match: { Categorystatus: true } // Only include categories with Categorystatus set to true
})
.exec();

if (garminProduct[0].productCategory && garminProduct[0].productCategory.Categorystatus === true) {
    console.log("Garmin product loaded");
    loadProductG = garminProduct;
} else {
    loadProductG = 0;
}

res.render("user/userHomeNotlog.ejs", { loadProduct, loadProductA, loadProductG });

    } catch (error) {
        console.error(error.message);
    }
};


//this is the homepage of a loggedin user.
const home = async (req, res) => {
    try {
        let loadProduct = 0;
        let loadProductG = 0;
        let loadProductA = 0;
        
        const samsungProduct = await productDatas.find({
            productCategory: '65ae1ded74d4441c5067ee22', // Replace with the actual category ID
            isDeleted: false,
        })
        .populate({
            path: 'productCategory',
            match: { Categorystatus: true } // Only include categories with Categorystatus set to true
        })
        .exec();
        
        if (samsungProduct[0].productCategory && samsungProduct[0].productCategory.Categorystatus === true) {
            console.log("Samsung product loaded");
            loadProduct = samsungProduct;
        } else {
            loadProduct = 0;
        }
        
        const appleProduct = await productDatas.find({
            productCategory: '65ae1df474d4441c5067ee24', // Replace with the actual category ID
            isDeleted: false,
        })
        .populate({
            path: 'productCategory',
            match: { Categorystatus: true } // Only include categories with Categorystatus set to true
        })
        .exec();
        
        if (appleProduct[0].productCategory && appleProduct[0].productCategory.Categorystatus === true) {
            console.log("Apple product loaded");
            loadProductA = appleProduct;
        } else {
            loadProductA = 0;
        }
        
        const garminProduct = await productDatas.find({
            productCategory: '65ae1e0674d4441c5067ee26', // Replace with the actual category ID
            isDeleted: false,
        })
        .populate({
            path: 'productCategory',
            match: { Categorystatus: true } // Only include categories with Categorystatus set to true
        })
        .exec();
        
        if (garminProduct[0].productCategory && garminProduct[0].productCategory.Categorystatus === true) {
            console.log("Garmin product loaded");
            loadProductG = garminProduct;
        } else {
            loadProductG = 0;
        }

        res.render("user/userHomepage.ejs", { loadProduct, loadProductA, loadProductG });

    } catch (error) {
        console.log(error.message)
    }
}

// for taking the user to login page on clickig any buy now on home page
const login = async (req, res) => {
    try {
        res.render("user/userlogin.ejs")
    } catch (error) {
        console.log(error.message)
    }
}

// const loginVerify = async (req, res) => {
//     try {
//         let user = req.body.username;
//         let pass = req.body.password;
// console.log(pass)
//         let dbEmail = await userData.findOne({ username: user }).select('username')
//         let dbpass = await userData.findOne({ username: user }).select('password')
//         let stat = await userData.findOne({ username: user }).select('status')
        

//         const match = await bcrypt.compare(pass,dbpass);

//         console.log("match",match)
//         if(dbEmail===null||stat===null){
    
//             res.locals.errorMessage = 'Invalid email or password';
//             res.render("user/userlogin.ejs")
//         }

//         if (stat.status === false) {
//             res.locals.errorMessage = 'you are blocked by admin';
//             res.render("user/userlogin.ejs")
//         }
   


//         if (dbEmail.username === user && match) {
//             console.log("verified user")

//                 const usertoken = JWTtoken.sign({ id: dbEmail },
//                         jwtcode,
//                         { expiresIn: "28800000" })

//                 const options = {
//                 expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//                 httpOnly: true
//                 }

//                 res.cookie("usertoken", usertoken, options)

//                 console.log("token created")
            
//                 res.redirect("/home")
//         } else {
//             console.log("not verified user")
//             res.locals.errorMessage = 'Invalid email or password';
//             res.render("user/userlogin.ejs")

//         }
//     }
//     catch (error) {
//         console.log(error.message)
//     }
// }
const loginVerify = async (req, res) => {
    try {
        const user = req.body.username;
        const pass = req.body.password;

        // Query for user details including username, password, and status
        const userRecord = await userData.findOne({ username: user }).select('username password status');

        if (!userRecord) {
            res.locals.errorMessage = 'Invalid email or password';
            return res.render("user/userlogin.ejs");
        }

        const isBlocked = userRecord.status === false;
        const isPasswordValid = await bcrypt.compare(pass, userRecord.password);

        if (isBlocked) {
            res.locals.errorMessage = 'You are blocked by admin';
            return res.render("user/userlogin.ejs");
        }

        if (isPasswordValid) {
            const usertoken = JWTtoken.sign({ id: userRecord.username,_id:userRecord._id }, jwtcode, { expiresIn: "28800000" });

            const options = {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                httpOnly: true
            };

            res.cookie("usertoken", usertoken, options);
            console.log("Token created");
            return res.redirect("/home");
        } else {
            res.locals.errorMessage = 'Invalid email or password';
            return res.render("user/userlogin.ejs");
        }
    } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, e.g., send an error response to the client
    }
}




//if user is not signedup take to signup page
const signup = async (req, res) => {
    try {
        res.render("user/usersignup.ejs")
    } catch (error) {
        console.log(error.message)
    }
}



const secretPass=async (password)=>{
    try{
       
        const hashedPass=await bcrypt.hash(password,10);
        return hashedPass;
    }
    catch(error){
        console.log(error.message)
    }
};


// store comming data to database
const storeData = async (req, res) => {
    // console.log(req.session.email)
    
    try {// here i am only storing the data at the time of signup
        const passwordCode=await secretPass(req.session.password);
        const userEmail = req.session.email;
        const emailIndb = await userData.findOne({ email: userEmail })

        // console.log("1:::", emailIndb)
        if (emailIndb == null) {
            const userdetails = new userData({
                username: req.session.username,
                email: req.session.email,
                 password: passwordCode,
             phone: req.session.phone,
             verified: true
            })
            console.log("Signup data saved in database")
            await userdetails.save()
            req.session.destroy()
            res.redirect("/login")
        } else {
            console.log("email already exist")
            res.locals.errorMessage = 'User already exist, please login';
            res.render("user/usersignup.ejs")

        }
        
    }
    catch (error) {
        console.log("test", error.message)
    }
}


const allproductPage = async (req, res) => {
    try {

        console.log("test")
        const allproduct = await productDatas.find({isDeleted: false})
        res.render("user/productdisplay.ejs", { allproduct })
    }
    catch (error) {
        console.log(error.message)
    }
}



// const productdetail = async (req, res) => {
//     try {
//         const pId = req.params.productId;

//         const pdetail = await productDatas.findById(pId)
//             .populate({
//                 path: 'productCategory',
//                 model: 'category',
//                 select: 'categoryName',
//             })
//             .exec();

//         res.render("user/productdetail.ejs", { pdetail });
//     } catch (error) {
//         console.log(error.message);
//     }
// };
const productdetail = async (req, res) => {
    try {
        const pId = req.params.productId;

        const pdetail = await productDatas.findOne({ _id: pId, isDeleted: false }) 
            .populate({
            path: 'productCategory',
            model: 'category',
                select: 'categoryName',
            })
            .exec();
           
        if (!pdetail) {
            
            return res.status(404).send('Product not found');
        }
{
    
}





    res.render("user/productdetail.ejs", { pdetail});
}  catch (error) {
console.log(error.message);
res.status(500).send('Internal Server Error');
}
}


const buyProduct = async (req, res) => {
    //product details
    try {
        res.render("user/productdetail.ejs")
    } catch (error) {
        console.log(error.message)
    }
}



//if a page is not found
const notfound = async (req, res) => {
    try {
        console.log("IN USER CONTROLLER if no page is found in function notfound")
        console.log("------------------------------------------------------------")
        res.render("user/404.ejs")
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, res) => {
    try {
        console.log("logout")
        res.clearCookie('usertoken');
        res.redirect("/home.")
    }
    catch (error) {
        console.log(error.message)
    }
}



const about = async (req, res) => {
    try {
        res.render("user/aboutnolog.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}
const aboutb = async (req, res) => {
    try {
        res.render("user/about.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}


const contact = async (req, res) => {
    try {
        res.render("user/contactnolog.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}

const contactb = async (req, res) => {
    try {
        res.render("user/contact.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}


// const categoryWiseProduct = async (req, res) => {
//     try {
//         const qid = req.params.proid;
//         console.log(qid)
//         const catwise = await productDatas.findOne({ _id: qid })
//             .populate({
//                 path: 'productCategory',
//                 model: 'category',
//                 select: 'categoryName',
//             })
//             .exec();
//         const catlist = await productDatas.find({ productCategory: catwise.productCategory })
//         // console.log(catlist)


//         res.render("user/categoryWiseProduct.ejs", { catlist, catwise });

//     } catch (error) {
//         console.log(error.message)
//     }
// }

const categoryWiseProduct = async (req, res) => {
    try {

        console.log("rete")
        const qid = req.params.proid;
        console.log("id",qid)

        const catwise = await productDatas.findOne({ _id: qid, isDeleted: false })
            .populate({
                path: 'productCategory',
                model: 'category',
                select: 'categoryName',
            })
            .exec();


            console.log(catwise)
        if (!catwise) {
           
            return res.status(404).send('Category-wise product not found');
        }

        
        const catlist = await productDatas.find({ productCategory: catwise.productCategory, isDeleted: false })
            .populate({
                path: 'productCategory',
                model: 'category',
                select: 'categoryName',
            })
            .exec();


            const docCount = await productDatas.countDocuments({ productCategory: catwise.productCategory, isDeleted: false });
            console.log(":D:d:d", docCount);
            

        res.render("user/categoryWiseProduct.ejs", { catlist, catwise ,docCount});

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const forgotpassword = async (req, res) => {
    try {
        res.render("user/forgotPassword.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}


const resetpassword = async (req, res) => {
    try {
        const userEmail = req.body.email;
        const confirmpass = req.body.confirmpassword;
        const newpass = req.body.password;

        console.log(userEmail)
        console.log(confirmpass)
        console.log(newpass)
       

    const isuser=await userData.findOne({email:userEmail})
    console.log(isuser)

    if(isuser==null||isuser.verified==false){
        res.locals.errorMessage = 'Invalid email or password';
        res.render("user/forgotPassword");
    }else if(confirmpass!=newpass){
        res.locals.errorMessage = 'Invalid email or password';
        res.render("user/forgotPassword");
    }
    else{
        await userData.updateOne({ email: userEmail }, { $set: { password: confirmpass } });


        res.redirect("/login")
    }

    }
    catch (error) {
        console.log(error.message)
    }
}

const filter = async (req, res) => {
    try {
        const productType = req.body.productType;
        const discounted = req.body.discounted;
        const pricesort = req.body.pricesort;
        const pages = req.body.page;
        const ser = req.body.ser;

        const pageNumber = parseInt(pages) || 1;
        const itemsPerPage = 4;
        let searching;

        if (ser) {
            searching = { productName: { $regex: `^${ser}`, $options: 'i' } };
        }


        // console.log("qqqq",pricesort)

        let products;
        let docCount;
        let serc;
        let hightolow;
        let lowtohigh;

        try {
            const category = await categData.findOne({ categoryName: productType });

            // Taking the count of documents excluding deleted products
            docCount = products = await productDatas
                .find({ 'productCategory': category._id, isDeleted: false })
                .populate({
                    path: 'productCategory',
                    model: 'category',
                    select: 'categoryName',
                })
                .countDocuments();

            // Finding the products based on selection excluding deleted products
            products = await productDatas
                .find({ 'productCategory': category._id, isDeleted: false })
                .populate({
                    path: 'productCategory',
                    model: 'category',
                    select: 'categoryName',
                })
                .skip((pageNumber - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .exec();

        
                hightolow = await productDatas.find({isDeleted: false}).sort({ productPrice: 1 });
                lowtohigh = await productDatas.find({isDeleted: false}).sort({ productPrice: -1 });


            serc = await productDatas
                .find({ ...searching, isDeleted: false,'productCategory': category._id, })
                .populate({
                    path: 'productCategory',
                    model: 'category',
                    select: 'categoryName',
                })
                .skip((pageNumber - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .exec();

            console.log('search Query:', serc);//is working and getting data.
        } catch (error) {
            console.error('Error fetching products:', error);
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(products);
        }

        let a = (pageNumber - 1) * itemsPerPage;
        //sending a response body to the frontend as a part of post fetch.
        res.json({
            products,
            a,
            docCount,
            productType,
            serc,
            hightolow,
            lowtohigh
           
        });
    } catch (error) {
        console.log(error.message);
    
    }
};


const editprofile=async(req,res)=>{
    try{  
     

        res.render("user/userprofileedit.ejs")
    }
    catch(error){
        console.log(error.message)
    }
}


//...............................................
const saveEditProfile=async(req,res)=>{
    try{let user;
        console.log("::::",req.body)

        let token=req.cookies.usertoken;
        JWTtoken.verify(token,jwtcode,(err,decoded)=>{
        if(err){
              console.log("user not verified")
        }else{
        const usersdetail=decoded._id;
        user=usersdetail
        console.log(user)
       }
    })
    

    let pImage = `/${req.file.filename}`;


console.log("eeeeeeeee::::",pImage)


let address={
    houseNo:req.body.house,
    street:req.body.street,
    location:req.body.location,
    landmark:req.body.landmark,
    city:req.body.city,
    state:req.body.state,
    country:req.body.Country,
    pincode:req.body.pincode,
}

let userdatadetails=await userData.updateOne({_id:user},{$set:{
    first_name:req.body.username1,
    Last_name:req.body.username2,
    phone:req.body.phonenumber,
    profileImage:pImage,
    Address:address

}})




    }
    catch(error){
        console.log(error.message)
    }
}



//.........................................................

const profile=async(req,res)=>{
    try{

        let user;
        console.log("::::",req.body)

        let token=req.cookies.usertoken;
        JWTtoken.verify(token,jwtcode,(err,decoded)=>{
        if(err){
              console.log("user not verified")
        }else{
        const usersdetail=decoded._id;
        user=usersdetail
        console.log(user)
       }
    })
        let udata=await userData.findOne({_id:user})

        console.log(udata)



        res.render("user/userprofile",{udata})
    }
    catch(error){
        console.log(error.message)
    }
}

const changepassword=async(req,res)=>{
    try{
res.render("user/changepassword.ejs")
    }
    catch(error){
        console.log(error.message)
    }
}


const changesavedpassword=async(req,res)=>{
    try{
let existingpass=req.body.existingpassword;
let newPass=req.body.newpassword;
let confirmPsaa=req.body.confrmpassword;
console.log("ep,ip",existingpass,newPass,confirmPsaa)

const usersid = await new Promise((resolve, reject) => {
    const usertoken = req.cookies.usertoken;
    JWTtoken.verify(usertoken, jwtcode, (err, decoded) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
            reject(err);
        } else {
            const userdetail = decoded._id;
            resolve(userdetail);
        }
    });
});


if(newPass===confirmPsaa){
    console.log("rrrr")

let userdet=await userData.findOne({_id:usersid})
console.log( userdet)
const isPasswordValid = await bcrypt.compare(existingpass, userdet.password);
console.log("kl",isPasswordValid)


const passwordCode=await secretPass(req.body.newpassword);
await userData.updateOne(
    { _id: usersid },
    { $set: { 
        password: passwordCode } }
  );

}

res.locals.errorMessage = 'Invalid password';
res.render("user/changepassword.ejs")
    }
    catch(error){
        console.log(error.message)
    }
}



const addReview=async(req,res)=>{
    try{
        let product=req.params.id;
       
        let reviewProduct=await productDatas.findOne({_id:product})
        res.render("user/writereview.ejs",{reviewProduct})
    }
    catch(error){
        console.log(error.message)
    }
}

const saveReview=async(req,res)=>{
    try{
        const usersid = await new Promise((resolve, reject) => {
            const usertoken = req.cookies.usertoken;
            JWTtoken.verify(usertoken, jwtcode, (err, decoded) => {
                if (err) {
                    console.error('JWT verification failed:', err.message);
                    reject(err);
                } else {
                    const userdetail = decoded._id;
                    resolve(userdetail);
                }
            });
        });


    const saveRev=new reviewData({
        comment:req.body.reviewDescription,
        rating:req.body.rating,
        user:usersid,
        product:req.params.id,
        Time:Date.now()
      })
      saveRev.save()

    }
    catch(error){
        console.log(error.message)
    }
}




const viewReview=async(req,res)=>{
    try{
        
    }
    catch(error){
        console.log(error.message)
    }
}



module.exports = {
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
    logout,
    about,
    contact,
    categoryWiseProduct,
    forgotpassword,
    resetpassword,
    contactb,
    aboutb,
    filter,
    editprofile,
    profile,
    saveEditProfile,
    changepassword,
    changesavedpassword,
    addReview,
    saveReview,
    viewReview
  

}