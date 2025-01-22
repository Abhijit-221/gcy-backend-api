const { ResponseCode,_,CustomResponse, Events } = require("../../config/constants");
const { VariantDataValidate, Variant } = require("../../models/product/varient");
const VariantEvents = Events.product.variant;
const { mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports={
    /**
     * @filename VariantController.js
     * @method createVariant
     * @router POST /api/tezrati/v1/variant/create
     * @params
     * @Auther Abhijit swain
     * @desc Variant create.
     * @autherization SellerAuth
     */
    createVariant: async (req,res)=>{
        console.log('Inside VariantController createVariant API...');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['name']);
            let result = await VariantDataValidate(inputData,VariantEvents.create);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors,'Invalid inputs.')
                )
            }
            //let check if the variant is exist.
            let checkVariant = await Variant.findOne({
                name:inputData.name,
                isDeleted:false
            });
            if(checkVariant){
                return res.status(ResponseCode.CONFLICT).json(
                    response.setConflict({errorMsg:'Variant already exist.'},'Variant already exist.')
                )
            }
            //generate a sort name code 
            function generate(char,str){
                if(!str){
                    return char+1;
                }
                let arr = str.split(char)[1];
                
                let k= parseInt(arr)+1;
                return char+k
            };
            let variants = await Variant.findOne({}).sort({createdAt:-1}).limit(1);
            inputData.sortName=await generate('T',variants?variants.sortName:'');
            console.log(inputData);
            inputData.createdBy = req.seller.id;
            inputData.updatedBy = req.seller.id;
            let variant = await Variant.create(inputData);
            return res.status(ResponseCode.CREATED).json(
                response.setCreated(variant,'Variants created successfully.')
            )
        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,"Internal server error.")
            )
        }
    },
    /**
     * @filename VariantController.js
     * @method updateVariant
     * @router POST /api/tezrati/v1/variant/update
     * @params
     * @Auther Abhijit swain
     * @desc Variant update.
     * @autherization SellerAuth
     */
    updateVariant: async (req,res)=>{
        console.log('Inside VariantController updateVariant API...');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['variantId','name','isActive']);
            let result = await VariantDataValidate(inputData,VariantEvents.update);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors,'Invalid inputs.')
                )
            }
            //let validate the varient id 
            let checkVariantExist = await Variant.findOne({
                _id:new ObjectId(inputData.variantId),
                isDeleted:false
            });
            if(!checkVariantExist){
                return res.status(ResponseCode.NOT_FOUND).json(
                    response.setNotfound({errorMsg:"Variant not found."},"Variant not found.")
                )
            }
            //let check if the variant is exist.
            let checkVariant = await Variant.findOne({
                name:inputData.name,
                _id:{$ne:new ObjectId(inputData.variantId)},
                isDeleted:false
            });
            if(checkVariant){
                return res.status(ResponseCode.CONFLICT).json(
                    response.setConflict({errorMsg:'Variant already exist.'},'Variant already exist.')
                )
            }
            console.log(inputData);
            let updatedData = {
                ...inputData,
                updatedBy : req.seller.id,
            };
            delete updatedData.variantId;
            if(inputData.isActive){
                updatedData.isActive = inputData.isActive===true||inputData.isActive==='true'?true:false;
            }
            let variant = await Variant.findByIdAndUpdate({
                _id:new ObjectId(inputData.variantId),
                isDeleted:false
            },updatedData);
            return res.status(ResponseCode.OK).json(
                response.setSuccess(variant,'Variants updated successfully.')
            )
        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,"Internal server error.")
            )
        }
    },
    /**
     * @filename VariantController.js
     * @method getVarientList
     * @router GET /api/tezrati/v1/variant/get
     * @params
     * @Auther Abhijit swain
     * @desc get varient lists.
     * @autherization SellerAuth
     */
    getVarientList: async (req,res)=>{
        console.log('Inside VariationController getVariationList API..');
        const response = new CustomResponse();
        try{
            //let get the variants
            let variants = await Variant.find({
                isDeleted:false,
            }).sort({name:1});
            return res.status(ResponseCode.OK).json(response.setSuccess(variants,'All variant fetched successfully.'));            

        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,"Internal server error.")
            )
        }
    },
    /**
     * @filename VariantController.js
     * @method getVarientsForProduct
     * @router POST /api/tezrati/v1/variant/for-product
     * @params
     * @Auther Abhijit swain
     * @desc get varient lists for add product.
     * @autherization SellerAuth
     */
    getVarientsForProduct: async (req,res)=>{
        console.log('Inside VariationController getVarientsForProduct API..');
        const response = new CustomResponse();
        try{
            //let get the variants
            let variants = await Variant.find({
                isDeleted:false,
                isActive:true,
            }).sort({name:1});
            return res.status(ResponseCode.OK).json(response.setSuccess(variants,'All variant fetched successfully.'));            

        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,"Internal server error.")
            )
        }
    },
    /**
     * @filename VariantController.js
     * @method deleteVariation
     * @router POST /api/tezrati/v1/variant/delete
     * @params
     * @Auther Abhijit swain
     * @desc get varient lists for add product.
     * @autherization SellerAuth
     */
    deleteVariation:async(req,res)=>{

    }

}