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
adminUrlRouter.post("/category",jwtAuth. haveToken3,adminin.addcategory)

adminUrlRouter.get("/orders",jwtAuth. haveToken3,adminin.orderManagement)
adminUrlRouter.post("/statusUpdate/:id",jwtAuth. haveToken3,adminin.orderStatusUpdate)
adminUrlRouter.get("/coupon",jwtAuth. haveToken3,adminin.coupons)
adminUrlRouter.get("/listCoupon",jwtAuth. haveToken3,adminin.listcoupons)
adminUrlRouter.post("/couponAdd",jwtAuth. haveToken3,adminin.addcoupons)

adminUrlRouter.get("/editcoupon/:id",jwtAuth. haveToken3,adminin.editcoupons)
adminUrlRouter.post("/editcoupon/:id",jwtAuth. haveToken3,adminin.changecoupons)
adminUrlRouter.post("/deletecoupon/:id",jwtAuth. haveToken3,adminin.deletecoupons)
adminUrlRouter.get("/logout",adminin.logout)
adminUrlRouter.post("/reportbydate",jwtAuth. haveToken3,adminin.daywisereport)
adminUrlRouter.get("/downloadrevenue",jwtAuth. haveToken3,adminin.downloadrevenue)
adminUrlRouter.get("/downloadrevenuepdf",jwtAuth. haveToken3,adminin.downloadrevenuepdf)


adminUrlRouter.get("/addOffer",jwtAuth. haveToken3,adminin.addofferproduct)



adminUrlRouter.get("/Offercategory",jwtAuth. haveToken3,adminin.addoffercategory)
adminUrlRouter.post("/Offercategory",jwtAuth. haveToken3,adminin.offercategorywise)
adminUrlRouter.get("/Offerproduct",jwtAuth. haveToken3,adminin.addofferproduct)
adminUrlRouter.post("/Offerproduct",jwtAuth. haveToken3,adminin.offerproductwise)
adminUrlRouter.get("/offerreferral",jwtAuth. haveToken3,adminin.offerreferal)

adminUrlRouter.post("/removeOffer",jwtAuth. haveToken3,adminin.removeOffer)
adminUrlRouter.post("/removeProductOffer",jwtAuth. haveToken3,adminin.removeproductOffer)


adminUrlRouter.get("/download",jwtAuth. haveToken3,adminin.downloadoption)


adminUrlRouter.post("/postDate",jwtAuth. haveToken3,adminin.postbydate)





adminUrlRouter.get("/reportbydates",jwtAuth. haveToken3,adminin.bydate)



adminUrlRouter.post("/convertToExcel",adminin.downloadDetailExcel)
adminUrlRouter.post("/convertToPDF",adminin.downloadDetailPdf)




module.exports={
    adminUrlRouter
}