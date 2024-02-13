
const user = require("../model/userSchema");
const JWTtoken = require('jsonwebtoken');
const jwtcode = process.env.jwt_user_secret // Replace with your actual secret key

const active = async (req, res, next) => {
    try {
        const usertoken = req.cookies.usertoken;

        JWTtoken.verify(usertoken, jwtcode, async (error, decoded) => {
            if (error) {
                console.error('Error verifying token:', error.message);
               
                res.redirect("/logout");
                return;
            } else {
             
                const userId = decoded.id;
                console.log('User ID:', userId._id);

               
                const userArray = await user.find({ _id: userId._id });
                if (userArray.length === 0 || userArray[0].status === false) {
                    console.log("User is blocked or not found. Redirecting to /logout");
                    res.redirect("/logout");
                    return; 
                }
              

                
                next();
            }
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports = {
    active
};
