const { CustomResponse, ResponseCode } = require("../../config/constants");
const { Brand } = require("../../models/product/brand");
const { default: mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports={
    /**
     * @filename BrandController.js
     * @method getBrands
     * @router POST /api/tezrati/v1/customer/brand/get
     * @params
     * @Auther Abhijit swain
     * @desc This API for get brands.
     * @autherization CustomerAuth
     */
    getBrands: async (req, res) => {
        console.log('Inside BrandController getBrands API..');
        const response = new CustomResponse();

        try{
            let {search}=req.query;
            //let get all brands
            let searchQuery = search?{$or: [
                { brandName: { $regex: search, $options: "i" } },
            ]}:{};
            

            let brands = await Brand.find({
                isDeleted: false,
                isActive:true,
                ...searchQuery
            });
            return res.status(ResponseCode.OK).json(response.setSuccess(brands,"Brands fetched successfully."));
            
            
        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,"Internal server error"));
        }
    },
}