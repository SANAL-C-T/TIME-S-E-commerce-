

const userhaveToken = async (req, res, next) => {
    try {
        
        console.log("jwt toke outside if in user have token 0:", req.cookies.usertoken);
        const usertoken = req.cookies.usertoken;
        if (usertoken) {
            console.log("jwt toke in use")
            res.redirect("/home")
        } else {
            next()
        }
    }
    catch (error) {
        console.log(error.message)
    }
}


const userhaveToken1 = async (req, res, next) => {
    try {
        
        console.log("jwt toke outside if in havetoken 1:", req.cookies.usertoken);
        const usertoken = req.cookies.usertoken;
        if (usertoken) {
            console.log("jwt toke in use")
            next()

        } else {
            res.redirect("/login")
        }

    }
    catch (error) {
        console.log(error.message)
    }
}


const userhaveToken2 = async (req, res, next) => {
    try {

        console.log("jwt toke outside if in havetoken 2:", req.cookies);
        const usertoken = req.cookies.token;
        if (usertoken) {
            res.redirect("/home")
            console.log("jwt toke in use havetoken2")
        } else {
            next()
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const userhaveToken3 = async (req, res, next) => {
    try {
        console.log("jwt toke outside if")
        console.log("in havetoken 3:", req.cookies);
        const usertoken = req.cookies.token;
        if (usertoken) {
            console.log("jwt toke in use havetoken3")
            next()
        } else {
            res.redirect("/admin/enter")
        }
    }
    catch (error) {
        console.log(error.message)
    }
}


const aboutToken = async (req, res, next) => {
    try {
      
        const usertoken = req.cookies.usertoken;
        if (usertoken) {
            console.log("jwt toke in use user logged in so about page  {aboutTOKEN}")
            res.redirect("/about")
        } else {
            console.log("no jwt toke in  user logged in so about. page {aboutTOKEN}")
            next()
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

const aboutToken2 = async (req, res, next) => {
    try {
      
        const usertoken = req.cookies.usertoken;
        if (usertoken) {
            console.log("jwt toke in  user logged in so about page   {aboutTOKEN2}")
            next( )
        } else {
            console.log("no jwt toke so about. page {aboutTOKEN2}")
            res.redirect("/about.")
        }
    }
    catch (error) {
        console.log(error.message)
    }
}





module.exports = {
    userhaveToken,
    userhaveToken1,
    userhaveToken2,
    userhaveToken3,
    aboutToken,
    aboutToken2

}