const userData = require("../model/userSchema")
const productDatas = require("../model/productSchema")
const categData = require("../model/categorySchema")
const bcrypt = require("bcrypt")
const { render } = require("ejs")
// const session = require("express-session")
const JWTtoken = require("jsonwebtoken")
require('dotenv').config();
const jwtcode = process.env.jwt_user_secret


//control function begins here
const homeNotLog = async (req, res) => {
    try {
        const loadProduct = await productDatas.find({ productCategory: '65ae1ded74d4441c5067ee22', isDeleted: false })
        const loadProductA = await productDatas.find({ productCategory: '65ae1df474d4441c5067ee24', isDeleted: false })
        const loadProductG = await productDatas.find({ productCategory: '65ae1e0674d4441c5067ee26', isDeleted: false })
        res.render("user/userHomeNotlog.ejs", { loadProduct, loadProductA, loadProductG });
    } catch (error) {
        console.error(error.message);
    }
};



const home = async (req, res) => {
    try {
        const loadProduct = await productDatas.find({ productCategory: '65ae1ded74d4441c5067ee22', isDeleted: false })
        const loadProductA = await productDatas.find({ productCategory: '65ae1df474d4441c5067ee24', isDeleted: false })
        const loadProductG = await productDatas.find({ productCategory: '65ae1e0674d4441c5067ee26', isDeleted: false })
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

const loginVerify = async (req, res) => {
    try {
        let user = req.body.username;
        let pass = req.body.password;

        let dbEmail = await userData.findOne({ username: user }).select('username')
        let dbpass = await userData.findOne({ username: user }).select('password')
        let stat = await userData.findOne({ username: user }).select('status')
        
        if(dbEmail===null||stat===null){
    
            res.locals.errorMessage = 'Invalid email or password';
            res.render("user/userlogin.ejs")
        }

        if (stat.status === false) {
            res.locals.errorMessage = 'you are blocked by admin';
            res.render("user/userlogin.ejs")
        }
   


        if (dbEmail.username === user && dbpass.password === pass) {
            console.log("verified user")

                const usertoken = JWTtoken.sign({ id: dbEmail },
                        jwtcode,
                        { expiresIn: "28800000" })

                const options = {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                httpOnly: true
                }

                res.cookie("usertoken", usertoken, options)

                console.log("token created")
            
                res.redirect("/home")
        } else {
            console.log("not verified user")
            res.locals.errorMessage = 'Invalid email or password';
            res.render("user/userlogin.ejs")

        }
    }
    catch (error) {
        console.log(error.message)
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


// store comming data to database
const storeData = async (req, res) => {
    // console.log(req.session.email)
    try {// here i am only storing the data at the time of signup

        const userEmail = req.session.email;
        const emailIndb = await userData.findOne({ email: userEmail })

        // console.log("1:::", emailIndb)
        if (emailIndb == null) {
            const userdetails = new userData({
                username: req.session.username,
             email: req.session.email,
            password: req.session.password,
             phone: req.session.phone,
             verified: true
            })
            console.log("Saved in database")
        await userdetails.save()
            req.session.destroy()
        } else {
            console.log("email already exist")
            res.locals.errorMessage = 'User already exist, please login';
            res.render("user/usersignup.ejs")

        }
        // res.redirect("/login")
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

        res.render("user/productdetail.ejs", { pdetail });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};


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

            // Finding products based on selection excluding deleted products
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

        
            serc = await productDatas
                .find({ ...searching, isDeleted: false })
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
           
        });
    } catch (error) {
        console.log(error.message);
    
    }
};


const editprofile=async(req,res)=>{
    try{
        res.render("user/userprofileedit")
    }
    catch(error){
        console.log(error.message)
    }
}

const profile=async(req,res)=>{
    try{
        res.render("user/userprofile")
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
    profile

}