const userUrlRouter=require("express").Router();
const otpc=require("../controller/otpController")
const user=require("../controller/usercontroller")
const middleman=require("../middleware/userSideMiddleware")
const otpOptions=require("../controller/otpController")
const jwtauth=require("../middleware/userJWTmiddleware")
const userBlock=require("../middleware/blocked")

userUrlRouter.get("/home.",jwtauth.userhaveToken,user.homeNotLog)//for general home


userUrlRouter.get("/a",user.notfound)
userUrlRouter.get("/login",jwtauth.userhaveToken,user.login)
userUrlRouter.post("/login",user.loginVerify)
userUrlRouter.get("/forgot",user.forgotpassword)
userUrlRouter.post("/forgot",user.resetpassword)


userUrlRouter.get("/home",jwtauth.userhaveToken1,user.home)//for userlogged home
// userUrlRouter.get("/about",user.about)
userUrlRouter.get("/about.",jwtauth.aboutToken,user.about)
userUrlRouter.get("/about",userBlock.active,jwtauth.aboutToken2,user.aboutb)
userUrlRouter.get("/contact.",user.contact)
userUrlRouter.get("/contact",userBlock.active,user.contactb)
userUrlRouter.get("/signup",user.signup)

userUrlRouter.post("/signup",middleman.sentEmail,otpOptions.otpEntryForm)//from here i can give a middleware for sending otp.
//so otp will be in email before the user goes to verficationpage.

userUrlRouter.post("/verifyOtp",otpOptions.otpVerify)//after verification the user will
//have to go to user homepage.
userUrlRouter.get("/saveData",user.storeData)
userUrlRouter.get("/resentOtp",middleman.sentEmail,otpOptions.otpEntryForm)
//from there he can go to product list page

userUrlRouter.post("/api/productfilter",user.filter)


userUrlRouter.get("/productpage",jwtauth.userhaveToken1,user.allproductPage)

userUrlRouter.get("/productpage/:productId",jwtauth.userhaveToken1,user.productdetail)

userUrlRouter.get("/buyproduct",jwtauth.userhaveToken1,user.buyProduct)

userUrlRouter.get("/product/:proid",jwtauth.userhaveToken1,user.categoryWiseProduct)

userUrlRouter.get("/logout",user.logout)










userUrlRouter.get("/*",user.notfound)

module.exports={
    userUrlRouter,
}




