const mongoose = require('mongoose');
const { CustomResponse, ResponseCode, Events, pagination } = require('../../config/constants');
const { ProductDataValidate, Product } = require('../../models/product/product');
const { Brand } = require('../../models/product/brand');
const { Category } = require('../../models/product/category');
const ProductEvents = Events.product;
const ObjectId = mongoose.Types.ObjectId;
module.exports={
    /**
     * @filename ProductController.js
     * @method products
     * @router POST /api/tezrati/v1/customer/product/get
     * @Auther Abhijit swain
     * @desc This API for get products by category.
     * @autherization CustomerAuth
     */
    products:async(req,res)=>{
        console.log('Inside ProductController products API..');
        const response = new CustomResponse();
        try{
            let {search,category,page,limit,filter}=req.body;
            console.log(new ObjectId(category));
            
            if(category){
                let categoryData = await Category.findOne({
                    _id:new ObjectId(category),
                    isDeleted:false
                });
                console.log("categoryData:",categoryData);
                if(!categoryData){
                    return res.status(ResponseCode.NOT_FOUND).json(
                        response.setNotfound("Category not found","Category not found")
                    )
                }
            }
            page=parseInt(page)?parseInt(page):pagination.page;
            limit=parseInt(limit)?parseInt(limit):pagination.limit;
            skip = page*limit-limit;

            let result = await ProductDataValidate({filter},ProductEvents.productForCustomer);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors,'Invalid inputs')
                )
            }
            let subquery={};
            if(filter){
                //let check brand is exist or not
                if(filter.brand_id && filter.brand_id.length){
                    // let brand=await Brand.findOne({
                    //     _id:{$in:filter.brand_id},
                    //     isDeleted:false
                    // });
                    // if(!brand){
                    //     return res.status(ResponseCode.NOT_FOUND).json(
                    //         response.setNotfound("Brand not found","Brand not found")
                    //     )
                    // }
                    let brandIds=filter.brand_id.map(id=>new ObjectId(id));
                    subquery.brand_id={$in:brandIds}
                }
                if(filter.variant_id && filter.variant_id.length){
                    // let variant=await Brand.findOne({
                    //     _id:{$in:filter.variant_id},
                    //     isDeleted:false
                    // });
                    // if(!variant){
                    //     return res.status(ResponseCode.NOT_FOUND).json(
                    //         response.setNotfound("Variant not found","Variant not found")
                    //     )
                    // }
                    let variantIds = filter.variant_id.map(id=>new ObjectId(id));
                    subquery.variant_id={$in:variantIds};
                }
                if(filter.range){
                    start=filter.range.start?filter.range.start:0;
                    end=filter.range.end?filter.range.end:0;
                    subquery.price={$gte:start,$lte:end}
                }

            }
            console.log("subqueries:",subquery)
            let searchQuery = search?{$or: [
                // { productName: { $regex: `${search}`, $options: "i" } }, // Search in Product collection
                // { quantity: { $regex: search, $options: "i" } }, // Search in Product collection
                { "productGroup.productName": { $regex: search, $options: "i" } } // Search in ProductGroup collection
            ]}:{};
            if(search){

            }
            let products = await Product.aggregate([
                {
                    $match:{
                        isDeleted:false,
                        ...subquery
                    }
                },
                {
                    $lookup: {
                        from:"brands",
                        localField:"brand_id",
                        foreignField:"_id",
                        as:"brand",
                    }
                },
                {
                    $unwind: { path: "$brand", preserveNullAndEmptyArrays: true }
                },
                {
                    $lookup: {
                        from:'productgroups',
                        localField:"productGroupId",
                        foreignField:"_id",
                        as:"productGroup",
                        pipeline:[
                            // {
                            //     $match: {
                            //         productName: { $regex: "search", $options: "i" } 
                            //     }
                            // },
                            {
                                $lookup:{
                                    from:'categories',
                                    localField:'category',
                                    foreignField:'_id',
                                    as:'category'
                                }
                            },
                            {
                                $unwind: { path: "$category", preserveNullAndEmptyArrays: true }
                            }
                        ]
                    }
                },
                {
                    $unwind: { path: "$productGroup", preserveNullAndEmptyArrays: true }
                },
                {
                    $match: {
                        ...searchQuery
                    }
                },
                {
                    $sort: {"productGroup.productName" : 1 } // Sorting by product name
                },
                // { $skip: skip },  // Skip previous pages
                // { $limit: limit }
            ]);
            return res.status(ResponseCode.OK).json(
                response.setSuccess({products},'Products fetched successfully.')
            )
        }
        catch(error){
            console.log('ProductController:Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,'Internal server error')
            )
        }
    }
}