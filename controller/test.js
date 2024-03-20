const filter = async (req, res) => {
    try {

        const productType = req.body.productType;//radio button data of selected category.
        const discounted = req.body.discounted;
        const pricesort = req.body.pricesort;
        const pages = req.body.page;
        const usersearch = req.body.ser;
        const pageNumber = parseInt(pages) || 1;
        const itemsPerPage = 4;
        let searching;



        if (usersearch) {
            searching = { productName: { $regex: `^${usersearch}`, $options: 'i' } };
        }

        let products;
        let docCount;
        let serc;
        let SortByPrice

        try {

                        if(productType=="allproducts"){
                            const pages = req.body.page;

                            const pageNumber = parseInt(pages) || 1;
                            const itemsPerPage = 4;


                            products = await productDatas
                            .find({  isDeleted: false })
                            .populate({
                                path: 'productCategory',
                                model: 'category',
                                select: 'categoryName',
                            })
                            .skip((pageNumber - 1) * itemsPerPage)
                            .limit(itemsPerPage)
                            .exec();

                            docCount = await productDatas
                            .find({ isDeleted: false })
                            .populate({
                                path: 'productCategory',
                                model: 'category',
                                select: 'categoryName',
                            })
                            .countDocuments();

                            serc = await productDatas
                            .find({ ...searching, isDeleted: false })
                            .populate({
                                path: 'productCategory',
                                model: 'category',
                                select: 'categoryName',
                            })
                            .skip((pageNumber - 1) * itemsPerPage)
                            .limit(itemsPerPage)
                            .exec();

                            let pageStartindex = (pageNumber - 1) * itemsPerPage;
                            if(pricesort==="Hightolow"){
                                console.log("Hightolow::::::")
                                console.log("price sort in user route  Hightolow::::")
                                SortByPrice = await productDatas
                                .find({ isDeleted: false })
                                .populate({
                                    path: 'productCategory',
                                    model: 'category',
                                    select: 'categoryName',
                                })
                                .sort({ productPrice: -1 });

                            }else{
                                console.log("Hightolow2222::::::")
                                SortByPrice =  console.log("price sort in user route: low to high:::")
                                SortByPrice = await productDatas
                                .find({ isDeleted: false })
                                .populate({
                                    path: 'productCategory',
                                    model: 'category',
                                    select: 'categoryName',
                                }).sort({ productPrice: 1 }); 
                            }

                            console.log("pageStartindex::::",pageStartindex)


                        }

                        console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

                        // should work when the category id is present, but not if selected all products

                                    const category = await categData.findOne({ categoryName: productType });
                                    // Taking the count of documents excluding deleted products
                                                docCount = await productDatas
                                                .find({ 'productCategory': category._id, isDeleted: false })
                                                .populate({
                                                    path: 'productCategory',
                                                    model: 'category',
                                                    select: 'categoryName',
                                                })
                                                .countDocuments();

                                    // Finding the products based on selection excluding deleted products
                                                products = await productDatas
                                                    .find({ 'productCategory': category._id, isDeleted: false })
                                                    .populate({
                                                        path: 'productCategory',
                                                        model: 'category',
                                                        select: 'categoryName',
                                                    })
                                                    .skip((pageNumber - 1) * itemsPerPage)
                                                    .limit(itemsPerPage)
                                                    .exec();

                                
                                        
                                        if(pricesort==="Hightolow"){
                                            console.log("price sort in user route  Hightolow::::")
                                            SortByPrice = await productDatas
                                            .find({ 'productCategory': category._id, isDeleted: false })
                                            .populate({
                                                path: 'productCategory',
                                                model: 'category',
                                                select: 'categoryName',
                                            })
                                            .sort({ productPrice: -1 });

                                        }else{
                                            SortByPrice =  console.log("price sort in user route: low to high:::")
                                            SortByPrice = await productDatas
                                            .find({ 'productCategory': category._id, isDeleted: false })
                                            .populate({
                                                path: 'productCategory',
                                                model: 'category',
                                                select: 'categoryName',
                                            }).sort({ productPrice: 1 }); 
                                        }


                                        console.log("sort data::",SortByPrice)


                        console.log("user searche:",usersearch)

                        if(usersearch!=""){
                            serc = await productDatas
                            .find({ ...searching, isDeleted: false,'productCategory': category._id, })
                            .populate({
                                path: 'productCategory',
                                model: 'category',
                                select: 'categoryName',
                            })
                            .skip((pageNumber - 1) * itemsPerPage)
                            .limit(itemsPerPage)
                            .exec();

                        console.log('search Query:', serc);//is working and getting data.



                        }
    
}
          catch (error) {
            console.log("try inside")
            console.error('Error fetching products:', error);
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(products);
        }

        let pageStartindex = (pageNumber - 1) * itemsPerPage;
        //sending a response body to the frontend as a part of post fetch.
        res.json({
            products,
            pageStartindex,
            docCount,
            productType,
            serc,
            SortByPrice
           
        });











    } catch (error) {
        console.log("try outside")
        console.log(error.message);
    
    }
};

























const filter = async (req, res) => {
    try {

        const productType = req.body.productType;//radio button data of selected category.
        const discounted = req.body.discounted;
        const pricesort = req.body.pricesort;
        const pages = req.body.page;
        const usersearch = req.body.ser;
        const pageNumber = parseInt(pages) || 1;
        const itemsPerPage = 4;
        let searching;



        if (usersearch) {
            searching = { productName: { $regex: `^${usersearch}`, $options: 'i' } };
        }

        let products;
        let docCount;
        let serc;
        let SortByPrice

        try {

                        if(productType=="allproducts"){
                            const pages = req.body.page;

                            const pageNumber = parseInt(pages) || 1;
                            const itemsPerPage = 4;


                            products = await productDatas
                            .find({  isDeleted: false })
                            .populate({
                                path: 'productCategory',
                                model: 'category',
                                select: 'categoryName',
                            })
                            .skip((pageNumber - 1) * itemsPerPage)
                            .limit(itemsPerPage)
                            .exec();

                            docCount = await productDatas
                            .find({ isDeleted: false })
                            .populate({
                                path: 'productCategory',
                                model: 'category',
                                select: 'categoryName',
                            })
                            .countDocuments();

                            serc = await productDatas
                            .find({ ...searching, isDeleted: false })
                            .populate({
                                path: 'productCategory',
                                model: 'category',
                                select: 'categoryName',
                            })
                            .skip((pageNumber - 1) * itemsPerPage)
                            .limit(itemsPerPage)
                            .exec();

                            let pageStartindex = (pageNumber - 1) * itemsPerPage;
                            if(pricesort==="Hightolow"){
                                console.log("Hightolow::::::")
                                console.log("price sort in user route  Hightolow::::")
                                SortByPrice = await productDatas
                                .find({ isDeleted: false })
                                .populate({
                                    path: 'productCategory',
                                    model: 'category',
                                    select: 'categoryName',
                                })
                                .sort({ productPrice: -1 });

                            }else{
                                console.log("Hightolow2222::::::")
                                SortByPrice =  console.log("price sort in user route: low to high:::")
                                SortByPrice = await productDatas
                                .find({ isDeleted: false })
                                .populate({
                                    path: 'productCategory',
                                    model: 'category',
                                    select: 'categoryName',
                                }).sort({ productPrice: 1 }); 
                            }

                            console.log("pageStartindex::::",pageStartindex)


                        }
else{
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

    // should work when the category id is present, but not if selected all products

                const category = await categData.findOne({ categoryName: productType });
                // Taking the count of documents excluding deleted products
                            docCount = await productDatas
                            .find({ 'productCategory': category._id, isDeleted: false })
                            .populate({
                                path: 'productCategory',
                                model: 'category',
                                select: 'categoryName',
                            })
                            .countDocuments();

                // Finding the products based on selection excluding deleted products
                            products = await productDatas
                                .find({ 'productCategory': category._id, isDeleted: false })
                                .populate({
                                    path: 'productCategory',
                                    model: 'category',
                                    select: 'categoryName',
                                })
                                .skip((pageNumber - 1) * itemsPerPage)
                                .limit(itemsPerPage)
                                .exec();

            
                    
                    if(pricesort==="Hightolow"){
                        console.log("price sort in user route  Hightolow::::")
                        SortByPrice = await productDatas
                        .find({ 'productCategory': category._id, isDeleted: false })
                        .populate({
                            path: 'productCategory',
                            model: 'category',
                            select: 'categoryName',
                        })
                        .sort({ productPrice: -1 });

                    }else{
                        SortByPrice =  console.log("price sort in user route: low to high:::")
                        SortByPrice = await productDatas
                        .find({ 'productCategory': category._id, isDeleted: false })
                        .populate({
                            path: 'productCategory',
                            model: 'category',
                            select: 'categoryName',
                        }).sort({ productPrice: 1 }); 
                    }


                    console.log("sort data::",SortByPrice)


    console.log("user searche:",usersearch)

    if(usersearch!=""){
        serc = await productDatas
        .find({ ...searching, isDeleted: false,'productCategory': category._id, })
        .populate({
            path: 'productCategory',
            model: 'category',
            select: 'categoryName',
        })
        .skip((pageNumber - 1) * itemsPerPage)
        .limit(itemsPerPage)
        .exec();

    console.log('search Query:', serc);//is working and getting data.



    }
}
                       
    
}
          catch (error) {
            console.log("try inside")
            console.error('Error fetching products:', error);
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(products);
        }

        let pageStartindex = (pageNumber - 1) * itemsPerPage;
        //sending a response body to the frontend as a part of post fetch.
        res.json({
            products,
            pageStartindex,
            docCount,
            productType,
            serc,
            SortByPrice
           
        });











    } catch (error) {
        console.log("try outside")
        console.log(error.message);
    
    }
};

