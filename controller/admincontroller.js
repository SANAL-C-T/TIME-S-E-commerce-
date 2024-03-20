
const adminData = require("../model/adminSchema")
const productData = require("../model/productSchema")
const categoryData = require("../model/categorySchema")
const bannerData = require("../model/bannerSchema")
const userDatas = require("../model/userSchema")
const orderData=require("../model/orderhistoryschema")
const couponData=require("../model/couponSchema")
const bcrypt = require("bcrypt")
const ExcelJS = require('exceljs');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const moment=require("moment")
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

        console.log("orderStatusUpdate in admin", orderId, index, status);

        let date=Date.now()
        var formatedDate=moment(date).format('D-MM-YYYY, dddd, h:mm a')
        console.log(formatedDate)


        await orderData.updateOne(
            { _id: orderId },
            { $set: { Status: status ,DeliveredDate:formatedDate } }
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


const coupons=async(req,res)=>{
    try{

        const urlData = {
            pageTitle: 'COUPON MANAGEMENT',
        }


res.render("admin/couponPage.ejs",{urlData})
    }
    catch(error){
        console.log(error.message)
    }
}



const listcoupons=async(req,res)=>{
    try{

        let list=await couponData.find({})

        const urlData = {
            pageTitle: 'LIST OF COUPON',
            couponList:list
        }



res.render("admin/adminlistcoupon.ejs",{urlData})
    }
    catch(error){
        console.log(error.message)
    }
}

//adding the coupon to database
const addcoupons=async(req,res)=>{
    try{
        const urlData = {
            pageTitle: 'COUPON MANAGEMENT',
        }  
 let code=req.body.couponCode;
 let offerType=req.body.offerType;
 let couponCodeDescription=req.body.couponCodeDescription;
 let addedOn=moment(req.body.addDate).format('MMMM D, YYYY, h:mm A');
 let expiryOn=moment(req.body.ExpiryDate).format('MMMM D, YYYY, h:mm A');
 let value=req.body.couponValue;


// console.log("expiryOn:",expiryOn)
// console.log("addedOn:",addedOn)
// console.log(" couponCodeDescription:", couponCodeDescription)
// console.log("offerType:",offerType)
// console.log("code:",code)
// console.log("value:",value)



const addCoupon= new couponData({
couponCode:code,
offerType:offerType,
OfferDescription:couponCodeDescription,
discount:value,
expiryDate:expiryOn,
createdDate: addedOn,

})

addCoupon.save()


res.render("admin/couponPage.ejs",{urlData})
    }
    catch(error){
        console.log(error.message)
    }
}


//show the edit page for each coupon document
const editcoupons=async(req,res)=>{
    try{
        let id=req.params.id;
        let list=await couponData.find({_id:id})
        const urlData = {
            pageTitle: 'EDIT THE COUPON',
            code:list
        }
res.render("admin/admineditcoupon.ejs",{urlData})
    }
    catch(error){
        console.log(error.message)
    }
}


//save the edited coupon 
const changecoupons=async(req,res)=>{
    try{
     

        let id=req.params.id;
        // console.log("id:",id)
        let code=req.body.couponCode;
        let offerType=req.body.offerType;
        let couponCodeDescription=req.body.couponCodeDescription;
        let addedOn=moment(req.body.addDate).format('MMMM D, YYYY, h:mm A');
        let expiryOn=moment(req.body.ExpiryDate).format('MMMM D, YYYY, h:mm A');
        let value=req.body.couponValue;
       
       
    //    console.log("expiryOn:",expiryOn)
    //    console.log("addedOn:",addedOn)
    //    console.log(" couponCodeDescription:", couponCodeDescription)
    //    console.log("offerType:",offerType)
    //    console.log("code:",code)
    //    console.log("value:",value)

      

       await couponData.findByIdAndUpdate({_id:id},{$set:{
                couponCode:code,
                offerType:offerType,
                OfferDescription:couponCodeDescription,
                discount:value,
                expiryDate:expiryOn,
                createdDate:addedOn
       }})

        res.redirect("/admin/listCoupon")
    }
    catch(error){
        console.log(error.message)
    }
}



//to remove the coupon
const deletecoupons=async(req,res)=>{
    try{
let id=req.params.id;
await couponData.findByIdAndDelete({_id:id})
res.redirect("/admin/listCoupon")

    }
    catch(error){
        console.log(error.message)
    }
}


var downloadtotal;
var downloadCODtotal;
var downloadrazorpayTotal;
var downloadcount;
var downloadreturned;

// to download the sale report
const downloadoption=async(req,res)=>{
    try{

       

         let ordersOfUser=await orderData.find({})
        // console.log("ordersOfUser:::",ordersOfUser)


        let totalAmountSum = await orderData.aggregate([
            {
              $group: {
                _id: null,
                total: { $sum: "$OrderTotalPrice" }
              }
            }
          ]).exec();


          let totalPAYMENTSum = await orderData.aggregate([
            {
              $group: {
                _id: "$paymentMethod",
                total: { $sum: "$OrderTotalPrice" }
              }
            }
          ]).exec();



          let totalReturnedSum = await orderData.aggregate([
            {
              $match: {
                Status: "Returned"
              }
            },
            {
              $group: {
                _id: "$Status",
                total: { $sum: "$OrderTotalPrice" }
              }
            }
          ]).exec();
          
          const orders = await orderData.find({}).populate({
            path: "userid",
            model: "user"
        });
          
        // console.log("def",orders.user)
          
        let totalcounts=await orderData.find({}).count()
        // console.log(totalcounts)
          
        const urlData = {
            pageTitle: 'SALES REPORT',
             salesData:orders,
            total:totalAmountSum[0].total,
            CODtotal:totalPAYMENTSum[0],
            razorpayTotal:totalPAYMENTSum[1],
            count:totalcounts,
            returned:totalReturnedSum[0],
       
        }

downloadtotal=totalAmountSum[0].total;
downloadCODtotal=totalPAYMENTSum[0].total;
totalcounts=totalPAYMENTSum[1].total;
downloadrazorpayTotal=totalPAYMENTSum[1].total
downloadcount=totalcounts;
downloadreturned=totalReturnedSum[0].total;
// console.log(totalcounts)
    res.render("admin/downloadsoption.ejs",{urlData})
    }
    catch(error){
        console.log(error.message)
    }
}

const daywisereport=async(req,res)=>{
    try{

res.render("../views/admin/bydate.ejs")

    }
    catch(error){
        console.log(error.message)
    }
}

const downloadrevenue = async (req, res) => {
    try {
      console.log("download");
 
const H="REVENUE DETAILS";

      const data = [
        ['Total Generated Amount', 'COD', 'Online Payment', 'Amount Returned', 'Sale Count', 'Total Discount'],
        [downloadtotal, downloadCODtotal, downloadrazorpayTotal, downloadcount, downloadreturned],
       
      ];
  

      // Create a new workbook and add a worksheet
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Sheet 1');
  
      worksheet.addRow([H]);

      for (let i = 0; i < 2; i++) {
        worksheet.addRow([]);
      }
      // Add data to the worksheet
      data.forEach(row => {
        worksheet.addRow(row);
      });
  


      const columnWidths = [20, 15, 15, 20, 15, 15]; 

columnWidths.forEach((width, index) => {
  worksheet.getColumn(index + 1).width = width;
});
     
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=table.xlsx');
  
      // Save the workbook to the response stream
      await workbook.xlsx.write(res);
      res.end();
    } catch (error) {
      console.error('Error creating Excel file:', error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  


//   const downloadrevenuepdf = async (req, res) => {
//     try {
//       console.log("download");
 
//       const H = "REVENUE DETAILS";


    
//         const pdfDoc = await PDFDocument.create()
//         const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
      
//         const page = pdfDoc.addPage()
//         const { width, height } = page.getSize()
//         const fontSize = 30
//         page.drawText('Creating PDFs in JavaScript is awesome!', {
//           x: 50,
//           y: height - 4 * fontSize,
//           size: fontSize,
//           font: timesRomanFont,
//           color: rgb(0, 0.53, 0.71),
//         })
      
//         const pdfBytes = await pdfDoc.save()
    



//     //   const data = [
//     //     ['Total Generated Amount', 'COD', 'Online Payment', 'Amount Returned', 'Sale Count', 'Total Discount'],
//     //     [downloadtotal, downloadCODtotal, downloadrazorpayTotal, downloadcount, downloadreturned],
//     //   ];
      
//     //   const doc = new PDFDocument();
      
     
//     //   res.setHeader('Content-Type', 'application/pdf');
//     //   res.setHeader('Content-Disposition', 'attachment; filename=table.pdf');
      
   
//     //   doc.pipe(res);
      
    
//     //    doc.fontSize(14).text(H, { align: 'center', bold: true });
      
    
//     //   doc.moveDown();
      
   
//     //   data.forEach(row => {
   
//     //     row.forEach(cell => {
       
//     //       doc.text(cell.toString());
//     //     });
      
       
//     //     // doc.moveDown();
//     //   });
      
      
//     //   doc.end();
//     // } catch (error) {
//     //     console.error('Error creating PDF file:', error.message);
//     //     res.status(500).send('Internal Server Error');
//     //   }
//   };
  



// Placeholder values for data (you need to define these elsewhere)




const fs = require('fs');




const downloadrevenuepdf = async (req, res) => {
    try {
        // Get the current date and format it
        const currentDate = moment().format('DD/MM/YYYY, hh:mm:ss');

        // Placeholder values for data (you need to define these elsewhere)
        const data = [
            ['GENERATED AMOUNT', 'AMOUNT TO ACCOUNT', 'COD', 'ONLINE PAYMENT', 'AMOUNT RETURNED', 'AMOUNT DISCOUNTED'],
            [downloadtotal, downloadCODtotal, downloadrazorpayTotal, downloadcount],
            // Add more data rows as needed
        ];

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);

        // Add a new page to the document with A4 dimensions (approximately)
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 page size in points (1 point = 1/72 inch)
        const { width, height } = page.getSize();
        const fontSize = 7; // Adjust the font size if needed
        const margin = 10; // Adjust the margin if needed

        // Title
        const titleHeight = 14; // Title font size
        const titleWidth = timesRomanFont.widthOfTextAtSize('TIME S, Revenue Details', titleHeight);
        const titleX = (width - titleWidth) / 2;
        page.drawText('TIME S, Revenue Details', {
            x: titleX,
            y: height - margin - titleHeight,
            size: titleHeight,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // Draw the current date below the title
        const dateHeight = 10; // Date font size
        const dateWidth = timesRomanFont.widthOfTextAtSize(currentDate, dateHeight);
        const dateX = (width - dateWidth) / 2;
        page.drawText(currentDate, {
            x: dateX,
            y: height - margin - titleHeight - dateHeight - 5, // Adjusted position below the title
            size: dateHeight,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // Calculate column widths and positions dynamically
        const numColumns = data[0].length;
        const columnWidth = (width - 1 * margin) / numColumns;
        const columnPositions = Array.from({ length: numColumns }, (_, i) => margin + i * columnWidth);

        // Table Header
        let y = height - margin - titleHeight - dateHeight - 20; // Adjusted to fit within the page
        for (let i = 0; i < data[0].length; i++) {
            page.drawText(data[0][i], {
                x: columnPositions[i],
                y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
        }
        y -= 20;

        // Table Data
        const cellHeight = 20; // Adjust the cell height if needed
        for (let i = 1; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                page.drawText(data[i][j].toString(), {
                    x: columnPositions[j],
                    y,
                    size: fontSize,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                });
            }
            y -= cellHeight;
        }

        // Save the PDF document to a buffer
        const pdfBytes = await pdfDoc.save();

        // Write the buffer to a file
        fs.writeFileSync('revenueDetails.pdf', pdfBytes);

        // Send the PDF file as a downloadable response
        res.download('revenueDetails.pdf', 'revenueDetails.pdf', (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log('File sent successfully');
                // Optionally, you can delete the file after sending
                fs.unlinkSync('revenueDetails.pdf');
            }
        });
    } catch (error) {
        console.log('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
};
// categorywise offer get page

const addoffercategory=async(req,res)=>{
    try{
        let categData=await categoryData.find({Categorystatus:true})
        const urlData = {
            pageTitle: 'ADD  CATEGORY OFFER',
          category:categData
        }
        // console.log("categData:::",categData)
        res.render("admin/categoryoffer.ejs",{urlData})
    }
    catch(error){
        console.log(error.message)
    }
}


//product offer  get page from categorywise offer page
const addofferproduct=async(req,res)=>{
    try{
        let prodata=await productData.find({})

        const urlData = {
            pageTitle: 'ADD PRODUCT OFFER',
            products:prodata
        }

    res.render("admin/adminoffer.ejs",{urlData})
    }
    catch(error){
        console.log(error.message)
    }
}



const offerreferal=async(req,res)=>{
    try{
        

        const urlData = {
            pageTitle: 'ADD REFERAL OFFER',
      
        }

       
        res.render("admin/adminoffer.ejs",{urlData})
    }
    catch(error){
        console.log(error.message)
    }
}


//adding offer of category to db.
const offercategorywise=async(req,res)=>{
    try{
        console.log("data coming to offer caterogrywise in admin controller");

        let selectedCategory=req.body.productCategory;
        let discountValue=req.body.discount;
        let offerCreatedDate=req.body.createdDate;
        let offerEndDate=req.body.expiryDate;
        console.log("www",selectedCategory,discountValue,offerCreatedDate,offerEndDate)
    

        let addedOffer={
            catDiscountValue:discountValue,
            startDate:offerCreatedDate,
            endDate:offerEndDate,
        }


        await categoryData.findOneAndUpdate({_id:selectedCategory},{$set:{catOffer:addedOffer}})


        res.redirect("/admin/Offercategory")

    }
    catch(error){
        console.log(error.message)
    }
}


//remove category based offer.......
const removeOffer=async(req,res)=>{
    try{
        let id=req.body.id;
        await categoryData.findOneAndUpdate(
            { _id: id },
            { $unset: { catOffer: 1 } },
            { new: true }
        );

        res.status(200).json({ message: "Offer removed successfully." });
    }
    catch(error){
        console.log(error.message)
    }
}


const removeproductOffer=async(req,res)=>{
    try{
        let id=req.body.id;
        console.log("data coming to product offer remove:::",id)

        await productData.findOneAndUpdate(
            { _id: id },
            { $unset: { offer: 1 } },
            { new: true }
        );


        //the below code is very important for page reloading from javascript....
        res.status(200).json({ message: "Offer removed successfully." });
    }
    catch(error){
        console.log(error.message)
    }
}


//adding product based offer to data base.....
const offerproductwise=async(req,res)=>{
    try{
        
console.log("data coming to offer caterogrywise in admin controller");

let selectedProduct=req.body.productId;
let discountValue=req.body.discount;
let offerCreatedDate=req.body.createdDate;
let offerEndDate=req.body.expiryDate;
console.log("offerproductwise:::",selectedProduct,discountValue,offerCreatedDate,offerEndDate)


let addedOffer={
    Discountvalue:discountValue,
    StartDate:offerCreatedDate,
    endDate:offerEndDate,
}


await productData.findOneAndUpdate({_id:selectedProduct},{$set:{offer:addedOffer}})


res.redirect("/admin/Offerproduct")


    }
    catch(error){
        console.log(error.message)
    }
}




const bydate=async(req,res)=>{
    try{

        const urlData = {
            pageTitle: 'GET SALES REPORT BY DATE',
      
        }
        res.render("../views/admin/bydate.ejs",{ urlData})
    }
    catch(error){
        console.log(error)
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
    coupons,
    listcoupons,
    addcoupons,
    editcoupons,
    changecoupons,
    deletecoupons,
    downloadoption,
    daywisereport,
    downloadrevenue,
    downloadrevenuepdf ,
    removeproductOffer,
    addoffercategory,
    addofferproduct,
    offerreferal,
    offercategorywise,
    offerproductwise,
    bydate,
    removeOffer
 

}
/* ---------------------------------------------------- */