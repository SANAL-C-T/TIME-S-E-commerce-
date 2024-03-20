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

adminUrlRouter.get("/dashboard",jwtAuth. haveToken1,adminin.adminDashboard)


adminUrlRouter.get("/banner",jwtAuth. haveToken1,adminin.adminbanner)

//add product
adminUrlRouter.get("/products",jwtAuth. haveToken2,adminin.adminproduct)
adminUrlRouter.post("/products",jwtAuth. haveToken2,multerUpload.multiUpload,product.addproduct)

//edit product
adminUrlRouter.get("/editProduct/:id",jwtAuth.haveToken2,product.edit)

adminUrlRouter.post("/editProduct/:id",jwtAuth.haveToken2,multerUpload.multiUpload, product.saveedit)

adminUrlRouter.get("/listProduct",jwtAuth.haveToken2,product.listProducts)



adminUrlRouter.get("/DeleteProduct/:id",jwtAuth.haveToken2,product.Deleteproduct)
adminUrlRouter.get("/RestoreProduct/:id",jwtAuth.haveToken2,product.restoreproduct)
adminUrlRouter.get("/usercontol",jwtAuth.haveToken2,adminin.usermanage)
adminUrlRouter.post("/blockUser/:id",jwtAuth.haveToken2,adminin.usersetting)
adminUrlRouter.post("/unblockUser/:id",jwtAuth.haveToken2,adminin.usersetting1)
adminUrlRouter.get("/category",jwtAuth. haveToken3,adminin.showcategory)
adminUrlRouter.post("/category",jwtAuth. haveToken3,adminin.addcategory)
adminUrlRouter.get("/deleteCategory/:id",jwtAuth. haveToken3,adminin.deleCategory)
adminUrlRouter.get("/restoreCategory/:id",jwtAuth. haveToken3,adminin.restoreCategory)
adminUrlRouter.get("/editCategory/:id",jwtAuth. haveToken3,adminin.editorCategory)
adminUrlRouter.post("/editedcategory/:id",jwtAuth. haveToken3,adminin.editedCategory)
adminUrlRouter.post("/category",adminin.addcategory)

adminUrlRouter.get("/orders",adminin.orderManagement)
adminUrlRouter.post("/statusUpdate/:id",adminin.orderStatusUpdate)
adminUrlRouter.get("/coupon",adminin.coupons)
adminUrlRouter.get("/listCoupon",adminin.listcoupons)
adminUrlRouter.post("/couponAdd",adminin.addcoupons)

adminUrlRouter.get("/editcoupon/:id",adminin.editcoupons)
adminUrlRouter.post("/editcoupon/:id",adminin.changecoupons)
adminUrlRouter.post("/deletecoupon/:id",adminin.deletecoupons)
adminUrlRouter.get("/logout",adminin.logout)
adminUrlRouter.post("/reportbydate",adminin.daywisereport)
adminUrlRouter.get("/downloadrevenue",adminin.downloadrevenue)
adminUrlRouter.get("/downloadrevenuepdf",adminin.downloadrevenuepdf)


adminUrlRouter.get("/addOffer",adminin.addofferproduct)



adminUrlRouter.get("/Offercategory",adminin.addoffercategory)
adminUrlRouter.post("/Offercategory",adminin.offercategorywise)
adminUrlRouter.get("/Offerproduct",adminin.addofferproduct)
adminUrlRouter.post("/Offerproduct",adminin.offerproductwise)
adminUrlRouter.get("/offerreferral",adminin.offerreferal)

adminUrlRouter.post("/removeOffer",adminin.removeOffer)
adminUrlRouter.post("/removeProductOffer",adminin.removeproductOffer)


adminUrlRouter.get("/download",adminin.downloadoption)
adminUrlRouter.get("/reportbydate",adminin.bydate)




module.exports={
    adminUrlRouter
}