const productData=require("../model/productSchema");
const categData=require("../model/categorySchema")

const addproduct=async(req,res)=>{
    try{
        const filePath=[]
        req.files.forEach(element => {
            filePath.push(element.filename)
        });
        //  console.log(filePath)

         const productImageObject = {
            image1: `/${filePath[0]}`,
            image2: `/${filePath[1]}`,
            image3: `/${filePath[2]}`,
            image4: `/${filePath[3]}`,
            image5: `/${filePath[4]}`,
        };


const vari={
    productsize:req.body.productsize,
    productcolour:req.body.productcolour
}
// console.log("incoming:",req.body.productCategory)
const category = await categData.findOne({ _id: req.body.productCategory });

// console.log("category",category)
let  price=req.body.productPrice

if(price<1){
    console.log("no negtive")
}

        const addproductDetails=new productData({
            productName:req.body.productName,
            productCategory: category.categoryName,
            productDescription:req.body.productDescription,
            productPrice:x,
            variant:vari,
            productImage: productImageObject,
            stockCount:req.body.stockCount
                
        })
        await addproductDetails.save()

        console.log("product data saved to database")
       
res.redirect("/admin/products")
       
    }
    catch(error){
        console.log(error.message)
    }
}

const listProducts=async(req,res)=>{

    // console.log("listing")
    try{
        const allprod=await productData.find({})
        const urlData = {
            pageTitle: 'LIST PRODUCT',
            pro:allprod
        };
       
        res.render("admin/listProduct.ejs",{ urlData })
    }
    catch(error){
        console.log(error.message)
    }
}

const edit=async(req,res)=>{

    // console.log("hello")
    try{
        const catego = await categData.findOne({ _id: req.body.productCategory });
        const dbd=req.params.id
        // console.log(dbd)
const pdata=await productData.findById(dbd)

console.log(pdata)
res.render("admin/editProduct.ejs",{pdata})
    }
    catch(error){
        console.log(error.message)
    }
}

module.exports={
    addproduct,
    listProducts,
    edit
    
}