const { ResponseCode,_,CustomResponse, Events } = require("../../config/constants");
const { mongoose } = require("mongoose");
const { Variant } = require("../../models/product/variant");
const ObjectId = mongoose.Types.ObjectId;

module.exports={
    /**
     * @filename VariantController.js
     * @method getVarientList
     * @router GET /api/tezrati/v1/customer/variant/get
     * @params
     * @Auther Abhijit swain
     * @desc get varient lists.
     * @autherization CustomerAuth
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
}