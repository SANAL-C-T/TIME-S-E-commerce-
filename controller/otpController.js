const userData = require("../model/userSchema");
const otpData = require("../model/otpSchema");

const otpEntryForm = async (req, res) => {
    try {
        res.render("user/otp.ejs");
    } catch (error) {
        console.log(error.message);
    }
};

// const otpVerify = async (req, res) => {
//     try {
//         let str = "";
//         str += req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5;

//         const enteredOTP = Number(str);
//         const generatedOTP = req.session.otp;

//         console.log("Entered OTP:", enteredOTP);
//         console.log("Generated OTP:", generatedOTP);

//         if (enteredOTP === generatedOTP) {
//             console.log("OTP matched. Redirecting to /saveData");
//             res.redirect("/saveData");
//         } else {
//             console.log("Invalid OTP. Sending error response.");
//             res.locals.errorMessage = 'This is an error message from the backend.';
//         }
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ error: "Internal Server Error" });
//     }
// };

const otpVerify = async (req, res) => {
    try {
        let str = "";
        str += req.body.otp1 + req.body.otp2 + req.body.otp3 + req.body.otp4 + req.body.otp5;

        const enteredOTP = Number(str);
        const generatedOTP = req.session.otp;

        console.log("Entered OTP:", enteredOTP);
        console.log("Generated OTP:", generatedOTP);

        if (enteredOTP === generatedOTP) {
            console.log("OTP matched. Redirecting to /saveData");
            res.redirect("/saveData");
        } else {
           
            res.locals.errorMessage = 'Invalid OTP. Please try again.';
            
            res.render("user/otp.ejs");
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports = {
    otpEntryForm,
    otpVerify,
};
