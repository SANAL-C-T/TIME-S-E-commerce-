const userUrlRouter = require("express").Router();
const otpc = require("../controller/otpController")
const user = require("../controller/usercontroller")
const cart = require("../controller/cartController")
const otpMailer = require("../middleware/signupotpemailsending")
const otpOptions = require("../controller/otpController")
const jwtauth = require("../middleware/userJWTmiddleware")
const userBlock = require("../middleware/blocked")
const multer = require("../middleware/uploadImage")

//..................... ALL USER RELATED ROUTES..............................................
userUrlRouter.get("/home.", jwtauth.userhaveToken, user.homeNotLog)//for general home
userUrlRouter.get("/product1", user.login)
userUrlRouter.get("/a", user.notfound)
userUrlRouter.get("/login", jwtauth.userhaveToken, user.login)
userUrlRouter.post("/login", user.loginVerify)
userUrlRouter.get("/forgot", user.forgotpassword)
userUrlRouter.post("/forgot", user.resetpassword)
userUrlRouter.get("/home", userBlock.active, jwtauth.userhaveToken1, user.home)//for userlogged home
// userUrlRouter.get("/about",user.about)
userUrlRouter.get("/about.", jwtauth.aboutToken, user.about)
userUrlRouter.get("/about", userBlock.active, jwtauth.aboutToken2, user.aboutb)
userUrlRouter.get("/contact.", user.contact)
userUrlRouter.get("/contact", userBlock.active, user.contactb)
userUrlRouter.get("/signup", user.signup)





userUrlRouter.post("/signup", otpMailer.sentEmail, otpOptions.otpEntryForm)//from here i can give a middleware for sending otp.
//so otp will be in email before the user goes to verficationpage.
userUrlRouter.post("/verifyOtp", otpOptions.otpVerify)//after verification the user will
//have to go to user homepage.
userUrlRouter.get("/saveData", user.storeData)
userUrlRouter.get("/resentOtp", otpMailer.sentEmail, otpOptions.otpEntryForm)
//from there he can go to product list page
userUrlRouter.post("/api/productfilter", user.filter)
userUrlRouter.get("/productpage", jwtauth.userhaveToken1, user.allproductPage)
userUrlRouter.get("/productpage/:productId", jwtauth.userhaveToken1, user.productdetail)
userUrlRouter.get("/buyproduct", jwtauth.userhaveToken1, user.buyProduct)
userUrlRouter.get("/product/:proid", jwtauth.userhaveToken1, user.categoryWiseProduct)
// userUrlRouter.get("/cart/:prodid",cart.cartadd)
userUrlRouter.get("/logout", user.logout)
//profile links
userUrlRouter.get("/Myprofile", jwtauth.userhaveToken1, user.profile)
userUrlRouter.get("/profileEdits", jwtauth.userhaveToken1, user.editprofile)
userUrlRouter.post("/profileEdit", multer.profileimageupload, user.saveEditProfile)
userUrlRouter.get("/changepassword", jwtauth.userhaveToken1, user.changepassword)
userUrlRouter.post("/changepassword", jwtauth.userhaveToken1, user.changesavedpassword)
userUrlRouter.get("/savedaddress", jwtauth.userhaveToken1, cart.savedAddress)
userUrlRouter.post("/deleteAddress/:index", jwtauth.userhaveToken1, cart.deleteAddress)
//wishlist
userUrlRouter.get("/wishlist", jwtauth.userhaveToken1, user.showWishlist)
userUrlRouter.post("/wishlistadd", jwtauth.userhaveToken1, user.wishtoadd)
userUrlRouter.post("/wishlistremove", jwtauth.userhaveToken1, user.wishtoremove)
userUrlRouter.post("/removeFromWishList", jwtauth.userhaveToken1, user.addtocartAndDeleteWishlist)
//user cart related
userUrlRouter.get("/cart", jwtauth.userhaveToken1, cart.showcart)
userUrlRouter.get("/cart/:prodid", jwtauth.userhaveToken1, cart.cartadd)
userUrlRouter.post("/quantityUpdate", jwtauth.userhaveToken1, cart.qyt)
userUrlRouter.post("/stockup", jwtauth.userhaveToken1, cart.stockup)
userUrlRouter.post("/stockDown", jwtauth.userhaveToken1, cart.stockdown)
userUrlRouter.post("/itemdelete", jwtauth.userhaveToken1, cart.itemdel)
userUrlRouter.get("/paynow", jwtauth.userhaveToken1, cart.proceedToaddress)
userUrlRouter.post("/paynow", jwtauth.userhaveToken1, cart.addAddressToPurchase)

userUrlRouter.get("/successpage",jwtauth.userhaveToken1,  cart.sendSuccess)
userUrlRouter.get("/failedpage", jwtauth.userhaveToken1, cart.sendfailed)
userUrlRouter.post("/paymentData",jwtauth.userhaveToken1,  cart.handlePaymentData)


userUrlRouter.get("/orderHistory", jwtauth.userhaveToken1, cart.history)
userUrlRouter.post("/orderCancel/:id", jwtauth.userhaveToken1, cart.cancelOrder)
userUrlRouter.post("/orderReturn/:id", jwtauth.userhaveToken1, cart.ReturnOrder)
//review
userUrlRouter.get("/review/:id", jwtauth.userhaveToken1, user.addReview)
userUrlRouter.get("/review/:id", jwtauth.userhaveToken1, user.viewReview)
userUrlRouter.post("/saveReview/:id", jwtauth.userhaveToken1, user.saveReview)
//wallet
userUrlRouter.get("/wallet", jwtauth.userhaveToken1, user.wallet)
userUrlRouter.post("/applyCoupon", jwtauth.userhaveToken1, cart.couponAdd)
userUrlRouter.post("/removeCoupon", jwtauth.userhaveToken1, cart.couponremove)


//universal route for 404
userUrlRouter.get("/*", user.notfound)

module.exports = {
    userUrlRouter,
}




