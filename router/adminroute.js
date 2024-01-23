const adminUrlRouter=require("express").Router();

//........................................................
// importing of controllers
const adminin=require("../controller/admincontroller")
const multerUpload=require("../middleware/uploadImage")
const jwtAuth=require("../middleware/adminJWTvalidation")
const product=require("../controller/productController")






// all routes related to admin
adminUrlRouter.get("/enter",jwtAuth.haveToken,adminin.adminlogin)
adminUrlRouter.post("/enter",adminin.adminVerification)

adminUrlRouter.get("/dashboard",adminin.adminDashboard)


adminUrlRouter.get("/banner",jwtAuth. haveToken1,adminin.adminbanner)

//add product
adminUrlRouter.get("/products",jwtAuth. haveToken2,adminin.adminproduct)
adminUrlRouter.post("/products",multerUpload.multiUpload,product.addproduct)

adminUrlRouter.get("/listProduct",jwtAuth.haveToken2,product.listProducts)

adminUrlRouter.get("/editProduct/:id",jwtAuth.haveToken2,product.edit)

adminUrlRouter.get("/usercontol",jwtAuth.haveToken2,adminin.usermanage)
adminUrlRouter.post("/blockUser/:id",jwtAuth.haveToken2,adminin.usersetting)
adminUrlRouter.post("/unblockUser/:id",jwtAuth.haveToken2,adminin.usersetting1)
adminUrlRouter.get("/category",jwtAuth. haveToken3,adminin.showcategory)
adminUrlRouter.post("/category",jwtAuth. haveToken3,adminin.addcategory)
adminUrlRouter.post("/category",adminin.addcategory)




adminUrlRouter.get("/logout",adminin.logout)

module.exports={
    adminUrlRouter
}