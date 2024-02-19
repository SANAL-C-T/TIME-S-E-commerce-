const userData = require("../model/userSchema")
const productDatas = require("../model/productSchema")
const cartData = require("../model/cartSchema")
const JWTtoken = require("jsonwebtoken")
require('dotenv').config();
const secret = process.env.jwt_user_secret


const cartadd = async (req, res) => {
    try {
        let selectedProduct = req.params.prodid;
        let usersid;
        const usertoken = req.cookies.usertoken;
       
        JWTtoken.verify(usertoken, secret, (err, decoded) => {
            if (err) {
                console.error('JWT verification failed:', err.message);
            } else {
                const userdetail = decoded.id;
                usersid = userdetail._id;
            }
        });

 


        let productsadded = {
            products: selectedProduct,
            quantity: 1
        }



        console.log(usersid)
        const addcart = await cartData.findOneAndUpdate(
            { userid: usersid },
            { $push: { items: productsadded } },
            { upsert: true, new: true }
        );
        

        let products = await productDatas.findOne({ _id: selectedProduct })
// let itemINcart=await cartData.findOne({userid:usersid})
// .populate('products')
// .exec((err,pro)=>{
//     if(err){
//         console.log(err);
//         return;
//     }
//     res.render("user/cart.ejs")
// })
try {
    // const itemINcart = await cartData.findOne({ userid: usersid })
    //     .populate('items.products')
    //     .exec();


    const itemINcart = await cartData.findOne({ userid: usersid })
    .populate({
        path:'items.products',  //field in current schema
        model:'products', //name of other collection schema
    })
console.log("data coming ",itemINcart)

let cartItem={
    cart: itemINcart
}
// console.log("Product Name:", cartItem.cart.items[1].products.productName);



// console.log("0000",cartItem.cart.items)

    res.render("user/cart.ejs", {cartItem});
} catch (error) {
    console.error(error);
    // Handle the error appropriately, perhaps by sending an error response.
    res.status(500).send("Internal Server Error");
}






    }
    catch (error) {
        console.log(error.message)
    }
}



module.exports = {
    cartadd
}