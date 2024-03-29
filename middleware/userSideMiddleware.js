require('dotenv').config();//data comming from env file from root folder.

const nodemailer=require("nodemailer")

const email = process.env.COMPANY_EMAIL;
const pass = process.env.SECRE_PASS;
const otpGenerator = require('otp-generator');
const userData = require('../model/userSchema');
//----------=-----------=-------------=----------=------------=
const sentEmail= async(req,res,next)=>{
    try{

        let usermailid;
        let name;

      if(req.body.email==null){
        usermailid= req.session.email;
        name= req.session.username;

        req.body.username =req.session.username ;
        req.body.email= req.session.email ;
        req.body.password= req.session.password;
        req.body.phone= req.session.phone;
        console.log("using data in session")
      }else{
        usermailid=req.body.email; //body parser is defined in server file, so no need to specife here also.
        name=req.body.username;
        req.session.username = req.body.username;
        req.session.email = req.body.email;
        req.session.password = req.body.password;
        req.session.phone = req.body.phone;
        console.log("using direct data")
       
      }
      //will have to give output in both case.
        console.log("useremailid",usermailid)
        console.log("username:",name)



       
      console.log("session check data",req.session.email)
   
      

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: email,
              pass: pass,
            
            }
           
          });
        
console.log(name)
          const code=otpGenerator.generate(5, { upperCaseAlphabets: false,  lowerCaseAlphabets: false, specialChars: false });


        let mailOptions = {
            from: email,
            to: usermailid,
            subject: 'Email verification process ',
            html: `
                <h1>Hello ${name} welcome to TIME-S Ecommerce!</h1> 

                <h3>Please enter the provided OTP: <h1>${code}</h1> for the verification of your email ID.</h3>
            `,
            
        };
        
        console.log("OTP:",Number(code))
        req.session.otp=Number(code)
        transporter.sendMail(mailOptions, function(err, data) {
            if (err) {
              console.log("Error in sending email:  " + err);
            } else {
              console.log("Email sent successfully");
            }
          });
        
        
    next()
    }


    
    catch(error){
        console.log("email not sent catched error:",error.message)
    }
    }


//----------=-------------=-----------=--------------=--------------



module.exports={
    sentEmail,
  
}