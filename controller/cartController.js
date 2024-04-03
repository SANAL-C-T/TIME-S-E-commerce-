const mongoose = require('mongoose');
const userData = require("../model/userSchema");
const orderHistoryData = require("../model/orderhistoryschema");
const productDatas = require("../model/productSchema");
const walletData = require("../model/walletSchema")
const cartData = require("../model/cartSchema");
const couponData = require("../model/couponSchema")
const JWTtoken = require("jsonwebtoken");
const Razorpay = require("razorpay");
const moment = require("moment");
const categoryData = require('../model/categorySchema');
const crypto = require('crypto');
const { Console } = require('console');
require('dotenv').config();
const razKey = process.env.RAZORPAY_ID_KEY;
const razSec = process.env.RAZORPAY_SECRET_KEY;
const secret = process.env.jwt_user_secret;

var instance = new Razorpay({
    key_id: razKey,
    key_secret: razSec,
});
//-------------------- logics from here-------------------------------------------



//..................product add to cart............................................
const cartadd = async (req, res) => {   // need to optmise this code, due to time limitation....
    try {
        //----------------------------verify user--------
        const selectedProduct = req.params.prodid; //getting product id from front end
        const usersid = req.userid;//this is comming from jwt authentication



        // for checking if the product has offer....
        let hasOffer = await productDatas.findOne(
            { _id: selectedProduct },
            { haveProductOffer: 1 }
        );

        console.log("hasOffer", hasOffer ? hasOffer.haveProductOffer : false);

        // for checking if the category has offer
        let pdata = await productDatas.findById(selectedProduct);
        let catiDS = pdata.productCategory;
        let haveCategoryOffer = await categoryData.findOne(
            { _id: catiDS },
            { hasCatOffer: 1 }
        );

        console.log("hascateOffer", haveCategoryOffer ? haveCategoryOffer.hasCatOffer : false);


        let productDiscountPercentage = 0;
        let catDiscountpercentage = 0;

        // Calculate product discount percentage if the product has an offer
        if (hasOffer && hasOffer.haveProductOffer) {
            let productOfferPrice = await productDatas.findOne(
                { _id: selectedProduct },
                { 'offer.Discountvalue': 1 }
            );
            productDiscountPercentage = productOfferPrice && productOfferPrice.offer && productOfferPrice.offer.length > 0 ?
                (productOfferPrice.offer[0].Discountvalue || 0) : 0;
        }

        // Calculate category discount percentage if the category has an offer
        if (haveCategoryOffer && haveCategoryOffer.hasCatOffer) {
            let categoryOfferValue = await categoryData.findOne(
                { _id: catiDS },
                { 'catOffer.catDiscountValue': 1 }
            );
            catDiscountpercentage = categoryOfferValue && categoryOfferValue.catOffer && categoryOfferValue.catOffer.length > 0 ?
                (categoryOfferValue.catOffer[0].catDiscountValue || 0) : 0;
        }


        let newPrice;
        let percentageDiscount;
        // if both cat offer and prod offer, take the min product price after discount.
        if (hasOffer && !haveCategoryOffer) {
            newPrice = pdata.productPrice - (pdata.productPrice * (productDiscountPercentage / 100));
        } else if (hasOffer && haveCategoryOffer) {
            newPrice = Math.min(
                pdata.productPrice - (pdata.productPrice * (productDiscountPercentage / 100)),
                pdata.productPrice - (pdata.productPrice * (catDiscountpercentage / 100))
            );

            percentageDiscount = Math.max(productDiscountPercentage, catDiscountpercentage)

        } else if (!hasOffer && haveCategoryOffer) {
            newPrice = pdata.productPrice - (pdata.productPrice * (catDiscountpercentage / 100));
        } else {
            newPrice = pdata.productPrice;
        }

        newPrice = Math.round(newPrice);
        console.log("New Price:", newPrice);
        console.log("Max discount percentage :", percentageDiscount);

        let Discount = pdata.productPrice - newPrice;
        Discount = Math.round(Discount);
        let hasdiscount = false;

        if (Discount > 0) {
            hasdiscount = true;
        }
        else {
            hasdiscount = false;
        }
        console.log("dicountPrice::::", Discount)

        await productDatas.findOneAndUpdate(
            { _id: selectedProduct },
            { $set: { OfferPrice: newPrice } }
        );



        let qyt = pdata.stockCount
        // console.log("pdata",pdata)
        let productsadded = {
            products: selectedProduct,
            quantity: 1,
            productName: pdata.productName,
            productImage: pdata.productImage[0].image1,
            price: newPrice,
            DiscountedAmount: Discount,
            discounted: hasdiscount,
            percentageDiscounted: percentageDiscount
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

            await productDatas.findOneAndUpdate(
                { _id: selectedProduct },
                { $set: { stockCount: qyt - 1 } }
            );


            //........................
            const checkProductDeleted = await cartData.findOne({ userid: usersid })
                .populate({
                    path: 'items.products',
                    model: 'products',
                    match: { isDeleted: false }
                });

            // console.log("checkProductDeleted::::", checkProductDeleted);

            const filteredItems = checkProductDeleted.items.filter(item => item.products !== null);

            const Price = filteredItems.reduce((acc, item) => {
                return acc + item.price;
            }, 0);


            await cartData.updateOne(
                { userid: usersid },
                { $set: { items: filteredItems, OrderTotalPrice: Price } }
            );

            //..................
            const cart = await cartData.findOne({ userid: usersid })
                .populate({
                    path: 'items.products',
                    model: 'products',
                });


            let cartItem = {
                cart: cart
            };
            res.render("user/cart.ejs", { cartItem });

        } else {
            // if it already exists in the cart, show an alert, so the user can use increment button
            res.locals.errorMessage = 'Product exists in the cart, so increase the QTY.';

            const itemINcart = await cartData.findOne({ userid: usersid })
                .populate({
                    path: 'items.products',
                    model: 'products',

                });

            // sum up all price in the cart
            const totalPrice = itemINcart.items.reduce((acc, item) => {
                return acc + item.price;
            }, 0);

            // adding total price in the cart
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
        const usersid = req.userid;//from JWT AUTHENTICATION

        const itemINcart = await cartData.findOne({ userid: usersid })
            .populate({
                path: 'items.products',
                model: 'products',
            });

        if (itemINcart == null) {
            res.render("user/emptcart.ejs");
        }




        if (itemINcart.couponApplied == true) {
            console.log("has coupon used>>>>>>")

            let cartItem = {
                cart: itemINcart
            };

            // console.log("Product Name:", cartItem.cart.items[1].products.productName);
            res.render("user/cart.ejs", { cartItem });

        }

        else {

            const checkProductDeleted = await cartData.findOne({ userid: usersid })
                .populate({
                    path: 'items.products',
                    model: 'products',
                    match: { isDeleted: false }
                });

            // console.log("checkProductDeleted::::", checkProductDeleted);




            const filteredItems = checkProductDeleted.items.filter(item => item.products !== null);

            const totalPrice = filteredItems.reduce((acc, item) => {
                return acc + item.price;
            }, 0);


            await cartData.updateOne(
                { userid: usersid },
                { $set: { items: filteredItems, OrderTotalPrice: totalPrice } }
            );



            let cartItem = {
                cart: itemINcart
            };

            // console.log("Product Name:", cartItem.cart.items[1].products.productName);
            res.render("user/cart.ejs", { cartItem });
        }

    } catch (error) {
        console.log(error.message);
    }
};



//------------------------------------------------------------------------
//.............................cart quantity management ........................

const qyt = async (req, res) => {
    try {
        let frontendData = req.body
        const usersid = req.userid;//from JWT AUTHENTICATION
        // let cartGetData = await cartData.findOne({ userid: usersid })

        console.log("dfdfdff::::", frontendData)
        await cartData.updateOne(
            { userid: usersid },
            {
                $set: {
                    [`items.${frontendData.index}.quantity`]: frontendData.quantity,
                    [`items.${frontendData.index}.price`]: frontendData.price,
                    [`items.${frontendData.index}.actualPrice`]: frontendData.ActualPriceWithoutOffer,
                }
            }
        );
        const itemINcart = await cartData.findOne({ userid: usersid })
            .populate({
                path: 'items.products',  //field in current schema
                model: 'products', //name of other collection schema
            })
        //console.log("data coming ",itemINcart)

        let cartItem = {
            cart: itemINcart
        }
        // console.log("Product Name:", cartItem.cart.items[1].products.productName);

        //calculating the total price in the cart (final amount...)
        const totalPrice = itemINcart.items.reduce((acc, item) => {
            return acc + item.price;
        }, 0);



        await cartData.updateOne({ userid: usersid }, { $set: { OrderTotalPrice: totalPrice } });
        res.status(200).json({ success: true, totalPrice: totalPrice, message: "Total price updated successfully" });
    }
    catch (error) {
        console.log(error.message)
    }
}

//----------------------------------------------------------------------------

//stock update,, up
const stockup = async (req, res) => {
    try {
        console.log("received STOCK up");
        const UserId = req.userid; //from JWT AUTHENTICATION
        let cart = await cartData.findOne({ userid: UserId });
        let frontendData = req.body;
        let updatedItem = cart.items[frontendData.index];
        let productID = updatedItem.products;
        await productDatas.updateOne({ _id: productID }, { $inc: { stockCount: -1 } });
        res.status(200).json({ success: true, message: "Stock count updated successfully." });
    } catch (error) {
        console.log(error.message);
        // Send error response
        res.status(500).json({ success: false, error: error.message });
    }
};

//stock down when quantity is reduces
const stockdown = async (req, res) => {
    try {
        console.log("received STOCK down")
        const UserId = req.userid;//from JWT AUTHENTICATION
        let cart = await cartData.findOne({ userid: UserId });
        let frontendData = req.body
        let updatedItem = cart.items[frontendData.index];
        let productID = updatedItem.products;
        await productDatas.updateOne({ _id: productID }, { $inc: { stockCount: 1 } })
        res.status(200).json({ success: true, message: "Stock count updated successfully." });
    }
    catch (error) {
        console.log(error.message)
    }
}



//cart item delete.........................................
const itemdel = async (req, res) => {
    try {
        const deleteIndex = req.body.deleteIndex;
        const id = req.body.id;
        const qyt = parseInt(req.body.currentQyt);

        // console.log("+++++++******"    ,deleteIndex,   id,    qyt)

        const usersid = req.userid;//from JWT AUTHENTICATION
        const getQuantity = await cartData.findOne(
            { userid: usersid, "items.products": new mongoose.Types.ObjectId(id) },
            { "items.$": 1, _id: 0 }
        );

        if (getQuantity && getQuantity.items && getQuantity.items.length > 0) {
            var quantityy = getQuantity.items[0].quantity;
            // console.log("Quantity:", quantityy);
        } else {
            console.log("Product not found in the cart");
        }

        let stockFromDb = await productDatas.findOne({ _id: id })

        let restoreFORDeletedStockCount = stockFromDb.stockCount + quantityy;
        // console.log("upstock", restoreFORDeletedStockCount)
        await productDatas.findOneAndUpdate({ _id: id }, { $set: { stockCount: restoreFORDeletedStockCount } })

        // Update the cart and get the updated document
        const updatedCart = await cartData.findOneAndUpdate(
            { userid: usersid },
            { $pull: { items: { "products": new mongoose.Types.ObjectId(id) } } },
            { new: true } // To get the updated document
        );

        // console.log("Updated Cart:", updatedCart);

        const itemINcart = await cartData.findOne({ userid: usersid })
            .populate({
                path: 'items.products',  //field in current schema
                model: 'products', //name of other collection schema
            })
        //console.log("data coming ",itemINcart)

        let cartItem = {
            cart: itemINcart
        }
        // console.log("Product Name:", cartItem.cart.items[1].products.productName);

        //calculating the total price in the cart
        const totalPrice = itemINcart.items.reduce((acc, item) => {
            return acc + item.price;
        }, 0);

        //   console.log("del prod::::::::",totalPrice)
        await cartData.updateOne({ userid: usersid }, { $set: { OrderTotalPrice: totalPrice } });

        res.redirect("/cart")


    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


//...........................................
//display the checkout page
const proceedToaddress = async (req, res) => {
    try {
        const usersid = req.userid;//from JWT AUTHENTICATION
        const user = await userData.findOne({ _id: usersid })
        const cart = await cartData.findOne({ userid: usersid })
        console.log("::::::cart:::::::::", cart)
        if (cart == null) {
            res.redirect("/cart")
        }
        const database = {
            userdata: user,
            cartdata: cart
        }
        res.render("user/checkout.ejs", { database })
    }
    catch (error) {
        console.log(error.message)
    }
}



//.................................................
//storing the incoming data from checkout page
var razOrderID;
const addAddressToPurchase = async (req, res) => {

    console.log("//////add address to purchase in cart controller is runing now////")
    try {
        var name;
        var email;
        var mob;

        const savedAddress = req.body.Value;
        var paymentMode = req.body.paymentMethod;
        const tosaveaddressCheckbox = req.body.saveaddressCheckbox;

        const phoneNumber = req.body.phoneNumber
        const house = req.body.house
        const street = req.body.street
        const location = req.body.location
        const landmark = req.body.landmark
        const city = req.body.city
        const state = req.body.state
        const Country = req.body.Country
        const pincode = req.body.pincode


        // console.log("===savedAddress coming to try block of add address to purchase::", savedAddress)
        // console.log("////paymentMode coming to try block of add address to purchase:::::", paymentMode)


        let addresssss = {
            phoneNo: phoneNumber,
            houseNo: house,
            street: street,
            location: location,
            landmark: landmark,
            city: city,
            state: state,
            Country: Country,
            pincode: pincode,

        }
        // console.log("the typed address comming to try block of add address to purchase...", addresssss)//true

        let saveaddressCheckbox = tosaveaddressCheckbox;
        // console.log("has checked saved address checkbox:::", saveaddressCheckbox) //true


        const usersid = req.userid;//from JWT AUTHENTICATION

        const userD = await userData.findOne({ _id: usersid })
        name = userD.username;
        email = userD.email;
        mob = userD.phone;
        if (saveaddressCheckbox == true) {
            const addressFromSaved = req.body.Value;
            // console.log(" >><<<>><<user need to save the address to db, now in saveaddressCheckbox:true")
            //it is stored in users database.
            await userData.findOneAndUpdate({ _id: usersid }, { $push: { Address: addresssss } },
                { new: true } // Return the modified document
            );

            await cartData.findOneAndUpdate(
                { userid: usersid },
                { $set: { Address: addressFromSaved } },
            );
        }               //below code takes address from the database.



        else if (addresssss.phoneNo === undefined) { //this is because, when saved address is used there wont be any data in new address form.
            // console.log("%%%% user id using saved address from database  , now in else if block of add address to purchase")

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

        else {//we are not useing the saved data nor want it to save to saved address...
            //we are adding to cart, so it is not stored for future use.
            // console.log("***** user is typing the address  , now in else block of save address to purchase")
            let addresssss = {

                phoneNo: phoneNumber,
                houseNo: house,
                street: street,
                location: location,
                landmark: landmark,
                city: city,
                state: state,
                Country: Country,
                pincode: pincode,

            }
            // console.log("#### typed address from else block of add address to purchase:::", addresssss)//true
            let strAddress = `phoneNo:${addresssss.phoneNo} houseNo:${addresssss.houseNo} street:${addresssss.street} location:${addresssss.location} landmark:${addresssss.landmark} city:${addresssss.city} state:${addresssss.state} Country:${addresssss.Country} pincode:${addresssss.pincode}`;
            // console.log("@@@@@ str OF typedAddress:::", strAddress)  //true



            await cartData.findOneAndUpdate({ userid: usersid }, { $set: { Address: strAddress } },

            );
        }

        // console.log("$$$$ paymentMode in else block of add address to purchase:::", paymentMode)

        if (paymentMode == "COD") {
            const success = await cartEraseAccording("COD", usersid, req, res);
            if (success) {
                console.log("passed cod")

                res.json({ COD: true });
            } else {
                console.log("failed cod"); // Failure case
                res.json({ COD: false });
            }
        }

        else if (paymentMode == "Razorpay") {
            console.log("in raz pay")

            let inCart = await cartData.findOne({ userid: usersid })


            var instance = new Razorpay({ key_id: razKey, key_secret: razSec })

            var options = {
                amount: inCart.OrderTotalPrice * 100,  // amount in the smallest currency unit
                currency: "INR",
                receipt: inCart._id
            };

            instance.orders.create(options, function (err, order) {
                // console.log("razorpay sending order", order);
                if (!err) {
                    razOrderID = order.id;
                    res.status(200).send({ //the data is being send to the frontend, for showing the payment interface.
                        success: true,
                        msg: "order created",
                        order_id: order.id, //yes id is received in frontend.
                        amount: inCart.OrderTotalPrice * 100,
                        key_id: razKey,
                        username: name,
                        email: email,
                        phone: mob
                    })
                }
                else {
                    res.status(400)
                }
            });
            // 

            // if (onlinePay) {
            //     console.log("passed onlinePay")
            //     res.json({razPay:true});
            // } else {
            //     console.log("failed onlinePay"); // Failure case
            //     res.json({ razPay: false });
            // }
        }

        else if (paymentMode == "MyWallet") {

            const balance = await walletData.findOne({ userId: usersid }, { avaliable: 1 })
            const netBalance = balance.avaliable;
            let inCart = await cartData.findOne({ userid: usersid })
            let amount = inCart.OrderTotalPrice;
            console.log("balance::::", netBalance)
            // console.log("paymentamount::::", amount)
            if (netBalance >= amount && netBalance != "undefined") {
                let newNalance = netBalance - amount;
                await walletData.findOneAndUpdate({ userId: usersid }, { $set: { avaliable: newNalance, remark: "Product purchased" } })
                const walletPay = await cartEraseAccording("MyWallet", usersid, req, res);
                res.json({ wallet: true });
            }
            else {
                console.log("no balance wallet")
                res.json({ wallet: false });
            }

        }
        //here we are adding all the data to the order history collection.

    }
    catch (error) {
        console.log(error.message)
    }
}

const handlePaymentData = async (req, res) => {
    try {
        const { payment_id, order_id, signature } = req.body;
        const usersid = req.userid;//from JWT AUTHENTICATION
        // Handle the received payment data as needed
        console.log("Payment ID:", payment_id);
        console.log("Order ID:", order_id);
        console.log("Signature:", signature);

        // console.log("usersid:::",usersid)

        let concatenatedParams = razOrderID + "|" + payment_id;

        const generateSignature = (data, Sec) => {
            const hmac = crypto.createHmac('sha256', Sec);
            hmac.update(data);
            return hmac.digest('hex');
        };

        const generated_signature = generateSignature(concatenatedParams, razSec);
        console.log('generated_signature::', generated_signature);

        if (generated_signature === signature) {
            console.log('Payment verification is successful');
            const clearCart = await cartEraseAccording("razorpay", usersid, req, res);
            if (clearCart == true) {
                res.status(200).json("payment verified");
            } else {
                res.status(500).json("payment not verified");
            }

        } else {
            console.log('Payment verification failed');
        }



    }
    catch (error) {
        console.log(error.message)
    }
}



async function cartEraseAccording(PayMode, usersid, req, res) {

    try {

        console.log("in heleper function to delete the cart after payment")
        let presentCart = await cartData.findOne({ userid: usersid })
        // console.log("presentCart:::",presentCart)
        // console.log("usersid:::",usersid)
        // console.log("PayMode:::",PayMode)

        let date = Date.now()
        var formatedDate = moment(date).format('D-MM-YYYY')
        // console.log("DATEEEE:::",formatedDate)

        const purchaseHistory = new orderHistoryData({
            userid: usersid,
            OrderDate: formatedDate,
            OrderDateGraph: date,
            orderId: presentCart._id,
            paymentMethod: PayMode,
            address: presentCart.Address,
            items: presentCart.items,
            OrderTotalPrice: presentCart.OrderTotalPrice,
            Status: "pending",
            couponCode: presentCart.CouponCode,
            discountedByCoupon: presentCart.couponApplied,
            discountgiven: presentCart.couponValue
        });

        await purchaseHistory.save(); //save the data.
        await cartData.deleteOne({ userid: usersid })
        // console.log("true")

        return true;
    }
    catch (error) {
        console.log("false")
        console.log(error.message)
        return false;
    }

}

// async function userExtractionFromJwt(req, res) {

//     try {
//         const usersid = await new Promise((resolve, reject) => {
//             const usertoken = req.cookies.usertoken;
//             JWTtoken.verify(usertoken, secret, (err, decoded) => {
//                 if (err) {
//                     console.error('JWT verification failed:', err.message);
//                     reject(err);
//                 } else {
//                     const userdetail = decoded._id;
//                     resolve(userdetail);
//                 }
//             });
//         });
//         return usersid;
//     }
//     catch (error) {
//         console.log(error.message)
//     }

// }














//....................... logic to get user order history..........................................

const history = async (req, res) => {
    try {
        const usersid = req.userid;//from JWT AUTHENTICATION
        let cartHistory = await orderHistoryData.find({ userid: usersid })
        //  console.log("show orderHistory",cartHistory)
        res.render("user/trackhistory.ejs", { cartHistory })
    }
    catch (error) {
        console.log(error.message)
    }
}



//..........logic to cancel the order by the user.......................
const cancelOrder = async (req, res) => {
    try {
        let orderId = req.params.id;
        let index = req.body.index;
        // console.log("in userside",orderId,index)
        await orderHistoryData.updateOne(
            { _id: orderId },
            { $set: { Status: "User cancelled" } }
        );
        const ForupdationOfQyt = await orderHistoryData.findOne({ _id: orderId }, { items: 1, _id: 0 })

        // console.log(ForupdationOfQyt.items[].products)
        const updatePromises = [];
        ForupdationOfQyt.items.forEach((x) => {
            const pids = x.products;
            const qyt = x.quantity;
            //   console.log(x.products);
            //   console.log(x.quantity);
            // Push each promise into the array
            updatePromises.push(productDatas.findOneAndUpdate({ _id: pids }, { $inc: { stockCount: qyt } }));
        });

        // Use Promise.all to wait for all promises to resolve
        Promise.all(updatePromises)
            .then((results) => {
                console.log("All updates completed successfully");
            })
            .catch((error) => {
                console.error("Error updating stock counts:", error);
            });

        const getprice = await orderHistoryData.findOne({ _id: orderId }, { items: 1, OrderTotalPrice: 1, paymentMethod: 1, _id: 0 });
        if (getprice.paymentMethod != "COD") {
            const dateOn = moment().format('D-MM-YYYY, h:mm a');
            const UserId = req.userid;//from JWT AUTHENTICATION


            const amount = getprice.OrderTotalPrice;
            console.log("AMOUNT", amount)
            //adding money to wallet on CANCELING the product..
            await walletData.findOneAndUpdate(
                { userId: UserId },
                {
                    $set: { creditedOnDate: dateOn, creditAmount: amount, debitedAmount: 0 },
                    $inc: { avaliable: amount }
                },
                { new: true }
            );
        }





        // let statusFromDb=await orderHistoryData.findOne({ _id: orderId }).select("Status")

        //   if(statusFromDb.Status=="User cancelled"){
        //     let productItems = await orderData.findOne({ _id: orderId }).select('items');

        //     for (const element of productItems.items) {
        //         console.log(element.quantity, element.products);
        //         await productData.updateOne({ _id: element.products }, { $inc: { stockCount: element.quantity } });
        //     }
        // }
        res.redirect("/orderHistory")
    }
    catch (error) {
        console.log(error.message)
    }
}



const ReturnOrder = async (req, res) => {
    try {
        let orderId = req.params.id;
        const selectOption = req.body.reason;
        // console.log("opt::::", selectOption)
        let index = req.body.index;
        const deliveredDate = await orderHistoryData.findOne({ _id: orderId }, { DeliveredDate: 1 })
        let deliveryedDATE = parseInt(moment(deliveredDate).format("DD"))
        let returnPeriod = deliveryedDATE + 7;
        let TodaysDate = parseInt(moment(Date.now()).format("DD"))


        if (returnPeriod >= TodaysDate) {
            console.log("can return")

            //  const ForupdationOfQyt=await orderHistoryData.findOne({ _id: orderId },{items:1,OrderTotalPrice:1,_id:0})
            // console.log("hhh",ForupdationOfQyt.OrderTotalPrice)
            // let amount=ForupdationOfQyt.OrderTotalPrice;
            // let UserId=await userExtractionFromJwt(req,res)
            // const dateOn = moment().format("DD-MM-YYYY");
            // const addWallet=new walletData({
            //     userId:UserId,
            // })
            // addWallet.save();
            // await walletData.findOneAndUpdate({userId:UserId},{$set:{creditedOnDate:dateOn},$inc:{avaliable:amount}})
            const ForupdationOfQyt = await orderHistoryData.findOne({ _id: orderId }, { items: 1, OrderTotalPrice: 1, _id: 0 });
            const UserId = req.userid;//from JWT AUTHENTICATION
            const dateOn = moment().format('D-MM-YYYY, h:mm a');

            const amount = ForupdationOfQyt.OrderTotalPrice;
            //adding money to wallet on returning the product..
            await walletData.findOneAndUpdate(
                { userId: UserId },
                {
                    $set: { creditedOnDate: dateOn, creditAmount: amount, debitedAmount: 0 },
                    $inc: { avaliable: amount }
                },
                { new: true }
            );


            // console.log(ForupdationOfQyt.items[].products)
            const updatePromises = [];
            ForupdationOfQyt.items.forEach((x) => {
                const pids = x.products;
                const qyt = x.quantity;
                console.log(x.products);
                console.log(x.quantity);

                // Push each promise into the array
                if (selectOption !== "Defective product") {
                    // Push each promise into the array
                    updatePromises.push(productDatas.findOneAndUpdate({ _id: pids }, { $inc: { stockCount: qyt } }));
                }
            });

            // Use Promise.all to wait for all promises to resolve
            Promise.all(updatePromises)
                .then((results) => {
                    console.log("All updates completed successfully");

                })
                .catch((error) => {
                    console.error("Error updating stock counts:", error);
                });

            await orderHistoryData.updateOne(
                { _id: orderId },
                { $set: { Status: "Returned" } }
            );

            res.redirect("/orderHistory")

        } else {
            console.log("cannot return, return period is over")
            res.redirect("/orderHistory")
        }
    }
    catch (error) {
        console.log(error.message)
    }
}




//..........logic to delete the previously saved address.......................

const deleteAddress = async (req, res) => {
    try {
        const index = parseInt(req.params.index);
        console.log(index)
        const UserId = req.userid;//this is comming from jwt authentication
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
    catch (error) {
        console.log(error.message)
    }
}



//.....logic to save the address... when the user reaches the checkout page................
const savedAddress = async (req, res) => {
    try {
        const usersid = req.userid;//this is comming from jwt authentication
        const user = await userData.findOne({ _id: usersid })
        const cart = await cartData.findOne({ userid: usersid })
        const database = {
            userdata: user,
            cartdata: cart
        }
        res.render("user/savedAddress.ejs", { database })
    }
    catch (error) {
        console.log(error.message)
    }
}







//COUPON APPLYING.....
// var discValue;
// var amount;
// const couponAdd = async (req, res) => {
//     try {
//         const code = req.body.code
//         const usersid = req.userid;//from JWT AUTHENTICATION

//         const couponInDb = await couponData.findOne({ couponCode: code })
//          console.log("coupon value:::", couponInDb.discount)
//        const discValue = couponInDb.discount;

//         //getting price in cart
//         let inCart = await cartData.findOne({ userid: usersid })
//         const amount = inCart.OrderTotalPrice;
//         const isCouponApplied = inCart.couponApplied;
//         //if coupon exists... we proceed...


//         const newAmount = amount - discValue;

//         console.log("newAmount:::", newAmount)

//         await cartData.updateOne({ userid: usersid }, { $set: {OrderTotalPrice: newAmount, Discounted: discValue, couponApplied: true, CouponCode: code } });
//         if (couponInDb != null && isCouponApplied == false) {

//         } else {
//             console.log("coupon dont exist")
//         }

//         //the below line with a message is very important for the working of location.reload , in the frontend.
//         res.status(200).json({ success: true, message: "Coupon applied successfully." });
//     }
//     catch (error) {
//         console.log(error.message)
//     }
// }


const couponAdd = async (req, res) => {
    try {
        const code = req.body.code;
        const usersid = req.userid; // Obtaining user ID from JWT authentication

        // Retrieve coupon details from the database
        const couponInDb = await couponData.findOne({ couponCode: code });
        if (!couponInDb) {
            console.log("Coupon not found.");
            return res.status(200).json({ success: false, message: "Coupon does not exist." });
        }

        // Retrieve cart details for the user
        const inCart = await cartData.findOne({ userid: usersid });
        if (!inCart) {
            console.log("Cart not found.");
            return res.status(400).json({ success: false, message: "Cart not found." });
        }

        // Check if the coupon has already been applied
        if (inCart.couponApplied) {
            console.log("Coupon already applied.");
            return res.status(400).json({ success: false, message: "Coupon already applied." });
        }

        // Calculate the new total price after applying the discount
        const discValue = couponInDb.discount;
        const amount = inCart.OrderTotalPrice;
        const newAmount = amount - discValue;

        // Update the cart data with the new total price and coupon details
        await cartData.updateOne(
            { userid: usersid },
            {
                $set: {
                    OrderTotalPrice: newAmount,
                    Discounted: discValue,
                    couponApplied: true,
                    CouponCode: code,
                    couponValue: discValue
                }
            }
        );

        console.log("Coupon applied successfully.");
        res.status(200).json({ success: true, grandtotal: newAmount, codes: code, message: "Coupon applied successfully." });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
};



//coupon removal.....
const couponremove = async (req, res) => {
    try {
        const usersid = req.userid;//from JWT AUTHENTICATION

        const inCartcOUPON = await cartData.findOne({ userid: usersid })

        let codeFroMDatabase = inCartcOUPON.CouponCode;
        let couponInDb = await couponData.findOne({ couponCode: codeFroMDatabase })

        console.log("coupon value:::", couponInDb.discount)
        let coupValue = couponInDb.discount;
        let inCart = await cartData.findOne({ userid: usersid })
        let cartamount = inCart.OrderTotalPrice;

        let couponremovedPrice = cartamount + coupValue;


        console.log("couponremovedPrice", couponremovedPrice)
        await cartData.updateOne({ userid: usersid }, { $set: { OrderTotalPrice: couponremovedPrice, Discounted: 0, couponApplied: false, CouponCode: "" } });
        //the below line with a message is very important for the working of location.reload , in the frontend.
        res.status(200).json({ success: true, grandtotals: couponremovedPrice, message: "Coupon removed successfully." });
    }
    catch (error) {
        console.log(error.message)
    }
}




const sendSuccess = async (req, res) => {
    try {
        res.render("user/successpage.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}

const sendfailed = async (req, res) => {
    try {
        res.render("user/failedpayment.ejs")
    }
    catch (error) {
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
    savedAddress,
    stockdown,
    stockup,
    ReturnOrder,
    couponAdd,
    couponremove,
    sendSuccess,
    sendfailed,
    handlePaymentData
}