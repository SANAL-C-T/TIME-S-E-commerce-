const mongoose = require('mongoose');
const userData = require("../model/userSchema")
const orderHistoryData=require("../model/orderhistoryschema")
const productDatas = require("../model/productSchema")
const cartData = require("../model/cartSchema")
const JWTtoken = require("jsonwebtoken")
require('dotenv').config();
const secret = process.env.jwt_user_secret

//-------------------- logics from here-------------------------------------------



//..................product add to cart..........................
const cartadd = async (req, res) => {
    try {
        //----------------------------verify user--------
        let selectedProduct = req.params.prodid; //getting product id
        let usersid;
        const usertoken = req.cookies.usertoken; //getting the token

        // verifying the token for getting userid
        JWTtoken.verify(usertoken, secret, (err, decoded) => {
            if (err) {
                console.error('JWT verification failed:', err.message);
            } else {
                const userdetail = decoded._id;
                usersid = userdetail;
            }
        });

        //----------------------------verify user end--------

        // Getting the product details
        let pdata = await productDatas.findById(selectedProduct).select('productPrice');
        let productsadded = {
            products: selectedProduct,
            quantity: 1,
            price: pdata.productPrice
        }

        // checking if the cart has the product or not
        const already = await cartData.findOne({ userid: usersid, 'items.products': selectedProduct })

        // if it does not exist, it will be added to the cart
        if (already === null) {
            const addcart = await cartData.findOneAndUpdate(
                { userid: usersid },
                { $push: { items: productsadded } },
                { upsert: true, new: true }
            );

            const itemINcart = await cartData.findOne({ userid: usersid })
                .populate({
                    path: 'items.products',
                    model: 'products',
                });

            // calculating the total price in the cart
            const totalPrice = itemINcart.items.reduce((acc, item) => {
                return acc + item.price;
            }, 0);

            // update total price in the cart
            await cartData.updateOne({ userid: usersid }, { $set: { OrderTotalPrice: totalPrice } });

            console.log("after adding price to cart::", totalPrice);  //true....
            console.log("1 data coming to if block of cartadd::", itemINcart);



            const INcart = await cartData.findOne({ userid: usersid })
            .populate({
                path: 'items.products',
                model: 'products',
            });
            let cartItem = {
                cart: INcart
            };

            res.render("user/cart.ejs", { cartItem });

        } else {
            // if it already exists, show an alert
            res.locals.errorMessage = 'Product exists in the cart, so increase the QTY.';

            const itemINcart = await cartData.findOne({ userid: usersid })
                .populate({
                    path: 'items.products',
                    model: 'products',
                });

            // calculating the total price in the cart
            const totalPrice = itemINcart.items.reduce((acc, item) => {
                return acc + item.price;
            }, 0);

            // update total price in the cart
            await cartData.updateOne({ userid: usersid }, { $set: { OrderTotalPrice: totalPrice } });

            let cartItem = {
                cart: itemINcart
            };

            console.log("total price in else block::", totalPrice);
            res.render("user/cart.ejs", { cartItem });
        }

    } catch (error) {
        console.log(error.message)
        res.status(500).send("Internal Server Error");
    }
}















//.......logic to show the cart page in direct go...............

const showcart = async (req, res) => {
    try {
        let usersid;
        const usertoken = req.cookies.usertoken; // Corrected to use 'res' instead of 'req'
        
        // Verifying the token to get the userid
        JWTtoken.verify(usertoken, secret, (err, decoded) => {
            if (err) {
                console.error('JWT verification failed:', err.message);
            } else {
                const userdetail = decoded._id;
                usersid = userdetail;
            }
        });

        const itemINcart = await cartData.findOne({ userid: usersid })
            .populate({
                path: 'items.products',  //field in the current schema
                model: 'products', //name of the other collection schema
            });

if(itemINcart==null){

    res.render("user/emptcart.ejs");
    // console.log("nullllll")
}
        let cartItem = {
            cart: itemINcart
        };

        // console.log("Product Name:", cartItem.cart.items[1].products.productName);
        res.render("user/cart.ejs", { cartItem });
    } catch (error) {
        console.log(error.message);
    }
};



//------------------------------------------------------------------------
//cart quantity management ........................

const qyt=async(req,res)=>{
    try{

        let usersid;
        const usertoken = req.cookies.usertoken;
       
        JWTtoken.verify(usertoken, secret, (err, decoded) => {
            if (err) {
                console.error('JWT verification failed:', err.message);
            } else {
                const userdetail = decoded._id;
                usersid = userdetail;
            }
        });
       
       
        let cartGetData=await cartData.findOne({userid:usersid})

let frontendData=req.body
console.log(frontendData)

await cartData.updateOne(
    { userid: usersid },
    {
      $set: {
        [`items.${frontendData.index}.quantity`]: frontendData.quantity,
        [`items.${frontendData.index}.price`]: frontendData.price
      }
    }
  );


  const itemINcart = await cartData.findOne({ userid: usersid })
  .populate({
      path:'items.products',  //field in current schema
      model:'products', //name of other collection schema
  })
      //console.log("data coming ",itemINcart)

      let cartItem={
          cart: itemINcart
      }
// console.log("Product Name:", cartItem.cart.items[1].products.productName);


//calculating the total price in the cart
const totalPrice = itemINcart.items.reduce((acc, item) => {
  return acc + item.price;
}, 0);


await cartData.updateOne({ userid: usersid },{$set: {OrderTotalPrice:totalPrice}});

res.status(200).json({ success: true, totalPrice: totalPrice, message: "Total price updated successfully" });
    }
    catch(error){
        console.log(error.message)
    }
}


//----------------------------------------------------------------------------
//cart item delete.........................................
const itemdel = async (req, res) => {
    try {
        const deleteIndex = req.body.deleteIndex;
        const id = req.body.id;


        console.log(deleteIndex,id )
        // Verify user token and extract user ID
        const usersid = await new Promise((resolve, reject) => {
            const usertoken = req.cookies.usertoken;
            JWTtoken.verify(usertoken, secret, (err, decoded) => {
                if (err) {
                    console.error('JWT verification failed:', err.message);
                    reject(err);
                } else {
                    const userdetail = decoded._id;
                    resolve(userdetail);
                }
            });
        });

        // Update the cart and get the updated document
        const updatedCart = await cartData.findOneAndUpdate(
            { userid: usersid },
            { $pull: { items: { "products": new mongoose.Types.ObjectId(id) } } },
            { new: true } // To get the updated document
        );

        console.log("Updated Cart:", updatedCart);




        const itemINcart = await cartData.findOne({ userid: usersid })
        .populate({
            path:'items.products',  //field in current schema
            model:'products', //name of other collection schema
        })
            //console.log("data coming ",itemINcart)
      
            let cartItem={
                cart: itemINcart
            }
      // console.log("Product Name:", cartItem.cart.items[1].products.productName);
      
      
      //calculating the total price in the cart
      const totalPrice = itemINcart.items.reduce((acc, item) => {
        return acc + item.price;
      }, 0);
      
      console.log("del prod::::::::",totalPrice)
      await cartData.updateOne({ userid: usersid },{$set: {OrderTotalPrice:totalPrice}});

        res.redirect("/cart")
       

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};




//...........................................
//display the checkout page
const proceedToaddress=async(req,res)=>{
    try{
        const usersid = await new Promise((resolve, reject) => {
            const usertoken = req.cookies.usertoken;
            JWTtoken.verify(usertoken, secret, (err, decoded) => {
                if (err) {
                    console.error('JWT verification failed:', err.message);
                    reject(err);
                } else {
                    const userdetail = decoded._id;
                    resolve(userdetail);
                }
            });
        });



        const user=await userData.findOne({_id:usersid})
        const cart=await cartData.findOne({userid:usersid})


        const database={
            userdata:user,
            cartdata:cart
        }
        res.render("user/checkout.ejs",{database})
    }
    catch(error){
        console.log(error.message)
    }
}


//.................................................
//storing the incoming data from checkout page

const addAddressToPurchase=async(req,res)=>{
    try{
        console.log("formdata coming")
console.log("address incoming body just test::::::",req.body)


let addresssss= {

    phoneNo: req.body.phonenumber,
    houseNo: req.body.house,
    street: req.body.street,
    location: req.body.location,
    landmark: req.body.landmark,
    city: req.body.city,
    state: req.body.state,
    Country: req.body.Country,
    pincode: req.body.pincode,
   
  }
// console.log(addresssss)

let saveaddressCheckbox= req.body.saveaddressCheckbox


const usersid = await new Promise((resolve, reject) => {
    const usertoken = req.cookies.usertoken;
    JWTtoken.verify(usertoken, secret, (err, decoded) => {
        if (err) {
            console.error('JWT verification failed:', err.message);
            reject(err);
        } else {
            const userdetail = decoded._id;
            resolve(userdetail);
        }
    });
});


// const userD=await userData.findOne({_id:usersid})
//console.log(userD)

if(saveaddressCheckbox==='on'){
    //it is stored in users database.
    await userData.findOneAndUpdate({_id:usersid},   { $push: { Address: addresssss } },
        { new: true } // Return the modified document
      );

      await cartData.findOneAndUpdate(
        { userid: usersid },
        { $set: { Address: addressFromSaved } },
      );

}
else if(addresssss.phoneNo === undefined){
    const addressFromSaved = req.body.fromDbAddressRadio;

    try {
      const updatedCartData = await cartData.findOneAndUpdate(
        { userid: usersid },
        { $set: { Address: addressFromSaved } },
      );
    
      console.log("Updated Cart Data:", updatedCartData);
    } catch (error) {
      console.error(error);
    }
    
}

else{
    //we are adding to cart, so it is not stored for future use.

    let addresssss= {

        phoneNo: req.body.phonenumber,
        houseNo: req.body.house,
        street: req.body.street,
        location: req.body.location,
        landmark: req.body.landmark,
        city: req.body.city,
        state: req.body.state,
        Country: req.body.Country,
        pincode: req.body.pincode,
       
      }

      let strAddress = `phoneNo:${addresssss.phoneNo} houseNo:${addresssss.houseNo} street:${addresssss.street} location:${addresssss.location} landmark:${addresssss.landmark} city:${addresssss.city} state:${addresssss.state} Country:${addresssss.Country} pincode:${addresssss.pincode}`;



    //console.log(strAddress)
    await cartData.findOneAndUpdate({userid: usersid}, { $set: { Address: strAddress  } } ,
  
      );
}




let presentCart=await cartData.findOne({userid: usersid})


console.log("testttttt:::",presentCart.items)

const purchaseHistory = new orderHistoryData({
    userid: usersid,
    OrderDate: Date.now(),
    paymentMethod: req.body.paymentMethod,
    address: presentCart.Address,
    items:presentCart.items,
    OrderTotalPrice:presentCart.OrderTotalPrice,
    Status:"pending"
});

await purchaseHistory.save();

await cartData.deleteOne({userid: usersid})





    res.redirect("/home")
    }
    catch(error){
        console.log(error.message)
    }
}



//....................... logic to get user order history..........................................

const history=async(req,res)=>{
    try{ const usersid = await new Promise((resolve, reject) => {
        const usertoken = req.cookies.usertoken;
        JWTtoken.verify(usertoken, secret, (err, decoded) => {
            if (err) {
                console.error('JWT verification failed:', err.message);
                reject(err);
            } else {
                const userdetail = decoded._id;
                resolve(userdetail);
            }
        });
    });

       let cartHistory= await orderHistoryData.find({userid:usersid})
// console.log("9999",cartHistory)
        res.render("user/trackhistory.ejs",{cartHistory})
    }
    catch(error){
        console.log(error.message)
    }
}



//..........logic to cancel the order by the user.......................
const cancelOrder=async(req,res)=>{
    try{
let orderId=req.params.id;
let index=req.body.index;

console.log("in userside",orderId,index)

await orderHistoryData.updateOne(
    { _id: orderId },
    { $set: { Status: "User cancelled" } }
  );

let statusFromDb=await orderHistoryData.findOne({ _id: orderId }).select("Status")

//   if(statusFromDb.Status=="User cancelled"){
//     let productItems = await orderData.findOne({ _id: orderId }).select('items');

//     for (const element of productItems.items) {
//         console.log(element.quantity, element.products);
//         await productData.updateOne({ _id: element.products }, { $inc: { stockCount: element.quantity } });
//     }
// }
  

  res.redirect("/orderHistory")
    }
    catch(error){
        console.log(error.message)
    }
}


//..........logic to delete the previously saved address.......................

const deleteAddress=async(req,res)=>{
    try{

    }
    catch(error){
        console.log(error.message)
    }
}



//.....logic to save the address... when the user reaches the checkout page................
const savedAddress=async(req,res)=>{
    try{

    }
    catch(error){
        console.log(error.message)
    }
}






//.................. exports ...........................................................................
module.exports = {
    cartadd,
    qyt,
    itemdel,
    showcart,
    proceedToaddress,
    history,
    addAddressToPurchase,
    cancelOrder,
    deleteAddress,
    savedAddress

}