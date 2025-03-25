const { default: mongoose } = require("mongoose");
const { CustomResponse, ResponseCode,_, Events } = require("../../config/constants");
const { ProductGroupDataValidate, ProductGroup } = require("../../models/product/productGroup");
const { Category } = require("../../models/product/category");
const ProductGroupEvents = Events.product.productGroup;
const ObjectId = mongoose.Types.ObjectId;

module.exports={
    /**
     * @filename ProductGroupController.js
     * @method updateProductGroup
     * @router POST /api/tezrati/v1/product-group/update
     * @params
     * @Auther Abhijit swain
     * @desc This API for update product group.
     * @autherization SellerAuth
     */
    updateProductGroup: async(req,res)=>{
        console.log('Inside ProductGroupController updateProductGroup API...');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['product_id','productName','category','isActive']);
            let result = await ProductGroupDataValidate(inputData,ProductGroupEvents.update);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(result.errors,'Invalid inputs'));
            }
            //let check product exist or not 
            let productGroup = await ProductGroup.findOne({
                _id:new ObjectId(inputData.product_id),
                isDeleted:false
            });
            if(!productGroup){
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound('Product Group not found','Product Group not found'));
            }
            // let check category exist or not if category update
            if(inputData.category){
                let category=await Category.findOne({
                    _id:new ObjectId(inputData.category),
                    isDeleted:false
                });
                if(!category){
                    return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound('Category not found','Category not found'));
                }
                //let check if this product is already in this category
                if(inputData.productName){
                    let product = await ProductGroup.findOne({
                        productName:inputData.productName,
                        category:new ObjectId(inputData.category),
                        isDeleted:false,
                        _id:{$ne:new ObjectId(inputData.product_id)}
                    });
                    if(product){
                        return res.status(ResponseCode.CONFLICT).json(
                            response.setConflict('Product already exist in this category','Product already exist in this category')
                        );
                    }
                }
            }
            let updateData={...inputData};
            delete updateData.product_id;
            updateData.createdBy = req.seller.id;
            let updateProductGroup = await ProductGroup.updateOne({
                _id:new ObjectId(inputData.product_id),
                isDeleted:false
            },updateData);
            return res.status(ResponseCode.OK).json(
                response.setSuccess(updateProductGroup,'Product group updated successfully')
            )
        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response(error,"Internal server error."));
        }
    },
    /**
     * @filename ProductGroupController.js
     * @method getProductGroup
     * @router POST /api/tezrati/v1/product/get-product-group
     * @params
     * @Auther Abhijit swain
     * @desc This API for get product group.
     * @autherization SellerAuth
     */
    getProductGroup: async(req,res)=>{
        console.log('Inside ProductGroupController getProductGroup API...');
        const response = new CustomResponse();
        try{
            let {search}=req.query;
            let searchQuery = {};
            if(search){
                searchQuery.productName = { $regex: search, $options: 'i' };
            }
            let prodcutGroup = await ProductGroup.find({
                isDeleted:false,
                ...searchQuery,
            }).sort({productName:1});
            return res.status(ResponseCode.OK).json(response.setSuccess(prodcutGroup,'Product groug fetched successfully'));
        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,'Internal server error')
            )
        }
    }
}