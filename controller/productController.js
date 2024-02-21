const productData=require("../model/productSchema");
const categData=require("../model/categorySchema")


//adding product to database.
const addproduct=async(req,res)=>{


    console.log("test incoming images::::",req.files)
    try{
        const filePath=[]
        req.files.forEach(element => {
            filePath.push(element.filename)
        });
        //  console.log(filePath)
            console.log("bodyData in addproduct:::",req.body);//has all the datas of upload, including image.


            console.log("image files",JSON.stringify(req.files));

         const productImageObject = {
            image1: `/${filePath[0]}`,
            image2: `/${filePath[1]}`,
            image3: `/${filePath[2]}`,
            image4: `/${filePath[3]}`,
            image5: `/${filePath[4]}`,
        };
console.log("fffrfrfrrf",productImageObject)

            const vari={
                productsize:req.body.productsize,
                productcolour:req.body.productcolour
            }
        // console.log("incoming:",req.body.productCategory)
        const category = await categData.findOne({ _id: req.body.productCategory });
            console.log("category data in addproduct::::",category)


        const addproductDetails=new productData({
            productName:req.body.productName,
            productCategory: category._id,
            productDescription:req.body.productDescription,
            productPrice:req.body.productPrice,
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


//listing of product
const listProducts = async (req, res) => {
    try {
        const allprod = await productData.find()
            .populate({
                path: "productCategory",
                model: "category",
                select: "categoryName"
            });

        const urlData = {
            pageTitle: 'LIST PRODUCT',
            pro: allprod
        };

        res.render("admin/listProduct.ejs", { urlData });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};


//for editing of the added product, listing to the edit field.
const edit=async(req,res)=>{
    try{
        const catego = await categData.findOne({ _id: req.body.productCategory });
        const dbd=req.params.id
        // console.log(dbd)
        const y=await categData.find({Categorystatus:true})
        const x =await productData.findById(dbd);
        console.log("X",x)
        let r="EDIT ADDED PRODUCT"
        const urlData={
            proData:x,
            cate:y,
            pageTitle:r
        }
        console.log("-----//////---/////////-----////////--------")
        res.render("admin/editProduct.ejs",{urlData})
    }
    catch(error){
        console.log(error.message)
    }
}

//saving the editted data to database.
// const saveedit=async(req,res)=>{

// console.log("product edit data comming")
// console.log("product id:",req.params.id)
// console.log("body:",req.body)


//     try{
//     let pid=req.params.id
//     let index=req.imageIndexes;
//     // console.log("product id:",req.params.id)

//     const alreadyAdded = await productData.findOne({ _id: pid });
//     let existingImage = alreadyAdded.productImage;



// let incoming=[]
// req.files.forEach((x)=>{
//     console.log(x.filename)

//     let filepath=`/${x.filename}`

//     incoming.push(filepath)
// })

// let imgarr=[];
// imgarr.push(existingImage[0].image1)
// imgarr.push(existingImage[0].image2)
// imgarr.push(existingImage[0].image3)
// imgarr.push(existingImage[0].image4)
// imgarr.push(existingImage[0].image5)

//   for (let i = 0; i < imgarr.length; i++) {
       
//   }
//         // console.log("incomming:::",incoming)


//         const productImageObject1 = {
//             image1: incoming[0],
//             image2: incoming[1],
//             image3: incoming[2],
//             image4: incoming[3],
//             image5: incoming[4],
//         };

// // console.log("productobject:",productImageObject1)


// console.log("test...............test..................test")
// const varii={
// productsize:req.body.productsize,
// productcolour:req.body.productcolour

// }
// console.log(req.body.productsize) //true

// const category = await categData.findOne({ _id: req.body.productCategory });//true
// console.log(category)//true

// const updatedata = await productData
//     .updateOne({ _id: pid }, {
//         $set: {
//             productName: req.body.productName,
//             productDescription: req.body.productDescription,
//             productCategory: category._id,
//             productPrice: req.body.productPrice,
//             variant: varii,
//             productImage: productImageObject1,
//             stockCount: req.body.stockCount
//         }
//     })
//    res.redirect("/admin/listProduct")

//     }
//     catch(error){
//         console.log(error.message)
//     }
// }

const saveedit = async (req, res) => {
    console.log("product edit data coming");
    console.log("product id:", req.params.id);
    console.log("body:", req.body);

    try {
        let index=[]
        let pid = req.params.id;
      
        if (req.files && req.files.length > 0) {
            let ind = req.body.imageIndexes;
            ind.forEach((x) => {
                index.push(Number(x));
            });


        const alreadyAdded = await productData.findOne({ _id: pid });
        let existingImage = alreadyAdded.productImage;

        let incoming = [];
        req.files.forEach((x) => {
            console.log(">><<<",x.filename);
            let filepath = `/${x.filename}`;
            incoming.push(filepath);
        });

        let imgarr = [];
        imgarr.push(existingImage[0].image1);
        imgarr.push(existingImage[0].image2);
        imgarr.push(existingImage[0].image3);
        imgarr.push(existingImage[0].image4);
        imgarr.push(existingImage[0].image5);
        let editarry = [];

        // Replace existing images with incoming images at specified indexes
        for (let i = 0; i < imgarr.length; i++) {
            let replaced = false;
        
            for (let j = 0; j < index.length; j++) {
                if (i === index[j]) {
                    editarry.push(incoming[j]);
                    replaced = true;
                    break;
                }
            }
        
            if (!replaced) {
                editarry.push(imgarr[i]);
            }
        }
        
        console.log(editarry);
    //     for(let i=0;i<imgarr.length;i++){
    //         for(let j=0;j<index.length;j++){
    //             if(i==index[j]){
    //                 editarry.push(incoming[i])
    //                 console.log("222",incoming[i])   
    //             }
    //             else{
    //                 editarry.push(imgarr[i])

    //                 console.log("111111",imgarr[i],i)
    //                 break
    //             }
    //         }
    //     }

    //    console.log(editarry)


        const productImageObject1 = {
            image1: editarry[0],
            image2: editarry[1],
            image3: editarry[2],
            image4: editarry[3],
            image5: editarry[4],
        };

        const varii = {
            productsize: req.body.productsize,
            productcolour: req.body.productcolour,
        };

        const category = await categData.findOne({ _id: req.body.productCategory });

        const updatedata = await productData.updateOne(
            { _id: pid },
            {
                $set: {
                    productName: req.body.productName,
                    productDescription: req.body.productDescription,
                    productCategory: category._id,
                    productPrice: req.body.productPrice,
                    variant: varii,
                    productImage: productImageObject1,
                    stockCount: req.body.stockCount,
                },
            }
        );

        res.redirect("/admin/listProduct");
    } else{
        const alreadyAdded = await productData.findOne({ _id: pid });
        let existingImage = alreadyAdded.productImage;
        let imgarr = [];
        imgarr.push(existingImage[0].image1);
        imgarr.push(existingImage[0].image2);
        imgarr.push(existingImage[0].image3);
        imgarr.push(existingImage[0].image4);
        imgarr.push(existingImage[0].image5);
        let editarry = [];
        
        const productImageObject1 = {
            image1: imgarr[0],
            image2: imgarr[1],
            image3: imgarr[2],
            image4: imgarr[3],
            image5: imgarr[4],
        };

        const varii = {
            productsize: req.body.productsize,
            productcolour: req.body.productcolour,
        };

        const category = await categData.findOne({ _id: req.body.productCategory });

        const updatedata = await productData.updateOne(
            { _id: pid },
            {
                $set: {
                    productName: req.body.productName,
                    productDescription: req.body.productDescription,
                    productCategory: category._id,
                    productPrice: req.body.productPrice,
                    variant: varii,
                    productImage: productImageObject1,
                    stockCount: req.body.stockCount,
                },
            }
        );

        res.redirect("/admin/listProduct");
    }

}catch (error) {
        console.log(error.message);
    }
};

const Deleteproduct = async (req, res) => {
    try {
        const item = req.params.id;

        const del = await productData.updateOne({ _id: item }, { $set: { isDeleted: true } });
      console.log("deleted")
      res.redirect("/admin/listProduct")
    } catch (error) {
        console.log(error.message);
    
    }
};

const restoreproduct=async(req,res)=>{
    try{
        let id=req.params.id;
await productData.updateOne({_id:id},{$set:{isDeleted:false}})
res.redirect("/admin/listProduct")
    }
    catch(error){
        console.log(error.message)
    }
}






module.exports={
    addproduct,
    listProducts,
    edit,
    saveedit,
    Deleteproduct,
    restoreproduct
    
}