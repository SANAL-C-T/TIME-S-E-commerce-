const mongoose = require('mongoose');
const userData = require("../model/userSchema");
const orderHistoryData=require("../model/orderhistoryschema");
const productDatas = require("../model/productSchema");
const cartData = require("../model/cartSchema");
const JWTtoken = require("jsonwebtoken");
const Razorpay = require("razorpay");
const moment=require("moment")

require('dotenv').config();
const razKey=process.env.RAZORPAY_ID_KEY;
const razSec=process.env.RAZORPAY_SECRET_KEY;
const secret = process.env.jwt_user_secret;

var instance = new Razorpay({
    key_id:razKey,
    key_secret: razSec,
  });
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
        let pdata = await productDatas.findById(selectedProduct);



        console.log("pdata",pdata)
        let productsadded = {
            products: selectedProduct,
            quantity: 1,
            productName: pdata.productName ,
            productImage:pdata.productImage[0].image1  ,
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
// console.log(frontendData)

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
        // console.log(deleteIndex,id )
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

        // console.log("Updated Cart:", updatedCart);

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
      
    //   console.log("del prod::::::::",totalPrice)
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
   
console.log(".-=-=-= add address to purchase in cart controller is runing now")
 
     
    
    try{
var name;
var email;
var mob;
            const savedAddress = req.body.Value;
            var paymentMode = req.body.paymentMethod;
            const tosaveaddressCheckbox=req.body.saveaddressCheckbox;
       
          let phoneNumber =req.body.phoneNumber  
          let house =  req.body.house
          let street = req.body.street
          let location = req.body.location
          let landmark =   req.body.landmark
          let city =  req.body.city
          let state =  req.body.state
          let Country =req.body.Country 
          let pincode =   req.body.pincode
    
      
        console.log("===savedAddress coming to try block of add address to purchase::",savedAddress)
        console.log("////paymentMode coming to try block of add address to purchase:::::",paymentMode)


let addresssss= {
    phoneNo:  phoneNumber,
    houseNo: house,
    street: street,
    location: location,
    landmark: landmark,
    city: city,
    state: state,
    Country: Country,
    pincode: pincode,
   
  }
            console.log("[][][]the typed address comming to try block of add address to purchase]]",addresssss)//true

            let saveaddressCheckbox= tosaveaddressCheckbox;
            console.log("has checked saved address checkbox:::",saveaddressCheckbox) //true

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


const userD=await userData.findOne({_id:usersid})
name=userD.username;
email=userD.email;
mob=userD.phone;
    if(saveaddressCheckbox==true){
        const addressFromSaved = req.body.Value;
        console.log(" >><<<>><<user need to save the address to db, now in saveaddressCheckbox:true")
        //it is stored in users database.
        await userData.findOneAndUpdate({_id:usersid},   { $push: { Address: addresssss } },
            { new: true } // Return the modified document
        );

        await cartData.findOneAndUpdate(
            { userid: usersid },
            { $set: { Address: addressFromSaved } },
        );
    }               //below code takes address from the database.
                   
    
    
    else if(addresssss.phoneNo === undefined){ //this is because, when saved address is used there wont be any data in new address form.
                       console.log("%%%% user id using saved address from database  , now in else if block of add address to purchase")
                       
                        const addressFromSaved = req.body.Value;

                        try {
                        const updatedCartData = await cartData.findOneAndUpdate(
                            { userid: usersid },
                            { $set: { Address: addressFromSaved } },
                        );
                        
                        //   console.log("Updated Cart Data:", updatedCartData);
                        } catch (error) {
                        console.error(error);
                        }
                        
                    }

            else{//we are not useing the saved data nor want it to save to saved address...
                //we are adding to cart, so it is not stored for future use.
                console.log("***** user is typing the address  , now in else block of save address to purchase")
                let addresssss= {

                    phoneNo:  phoneNumber,
                    houseNo: house,
                    street: street,
                    location: location,
                    landmark: landmark,
                    city: city,
                    state: state,
                    Country: Country,
                    pincode: pincode,
                
                }
                console.log("#### typed address from else block of add address to purchase:::",addresssss)//true
                let strAddress = `phoneNo:${addresssss.phoneNo} houseNo:${addresssss.houseNo} street:${addresssss.street} location:${addresssss.location} landmark:${addresssss.landmark} city:${addresssss.city} state:${addresssss.state} Country:${addresssss.Country} pincode:${addresssss.pincode}`;
                console.log("@@@@@ str OF typedAddress:::",strAddress)  //true



                await cartData.findOneAndUpdate({userid: usersid}, { $set: { Address: strAddress} } ,
            
                );
            }

            console.log("$$$$ paymentMode in else block of add address to purchase:::",paymentMode)

                if(paymentMode=="COD"){
                    await cartEraseAccording("COD", usersid, req, res);
                }

                else if(paymentMode=="Razorpay"){
                
                    let inCart=await cartData.findOne({userid: usersid})

                    
                    var instance = new Razorpay({ key_id: razKey, key_secret: razSec })
                    
                    var options = {
                        amount: inCart.OrderTotalPrice*100,  // amount in the smallest currency unit
                        currency: "INR",
                        receipt: inCart._id
                    };
                    instance.orders.create(options, function(err, order) {
                        console.log("/...razorpay sending order.../",order);
                        if(!err){
                            res.status(200).send({  //yes id is received in frontend.
                                success:true,
                                msg:"order created",
                                order_id:order.id,
                                amount:inCart.OrderTotalPrice*100,
                                key_id:razKey,
                                username:name,
                                email:email,
                                phone:mob
                                
                            })
                        }
                        else{
                            res.status(400)
                        }
                    });
                    await cartEraseAccording("razorpay", usersid, req, res);
                }

            else if(paymentMode=="MyWallet"){    
                await cartEraseAccording("MyWallet", usersid, req, res);
            }

//here we are adding all the data to the order history collection.
       
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

 console.log("9999",cartHistory)
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
        let index=parseInt(req.params.index);
        console.log(index)
        let UserId=await userExtractionFromJwt(req,res)
       await userData.updateOne( //this is updating it to null, ad no object id is there
            { _id: UserId },
            {
              $unset: {
                [`Address.${index}`]: 1
              },
              
            }
          );
        await userData.updateOne( //this is deleting the address from array
            { _id: UserId },
            {
              $pull: {
                Address: null 
              }
            }
          );
          res.redirect("/savedaddress")
    }
    catch(error){
        console.log(error.message)
    }
}



//.....logic to save the address... when the user reaches the checkout page................
const savedAddress=async(req,res)=>{

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
        res.render("user/savedAddress.ejs",{database})
    }
    catch(error){
        console.log(error.message)
    }
}



async function cartEraseAccording(PayMode,usersid,req,res){
    console.log("in heleper function")
    let presentCart=await cartData.findOne({userid: usersid})
    let date=Date.now()
    var formatedDate=moment(date).format('D-MM-YYYY, dddd, h:mm a')
    console.log(formatedDate)
    const purchaseHistory = new orderHistoryData({
        userid: usersid,
        OrderDate: formatedDate,
        orderId: presentCart._id,
        paymentMethod: PayMode,
        address: presentCart.Address,
        items:presentCart.items,
        OrderTotalPrice:presentCart.OrderTotalPrice,
        Status:"pending"
    });



    await purchaseHistory.save(); //save the data.
    await cartData.deleteOne({userid: usersid})
    // res.redirect("/home")
}






async function userExtractionFromJwt(req,res){

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
        return usersid;
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