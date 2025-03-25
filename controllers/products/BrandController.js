const { default: mongoose } = require("mongoose");
const { CustomResponse, ResponseCode,_, Events } = require("../../config/constants");
const { Brand, BrandDataValidate } = require("../../models/product/brand");
const BrandEvents = Events.brand;
const ObjectId = mongoose.Types.ObjectId;

module.exports={
    /**
     * @filename BrandController.js
     * @method getBrands
     * @router POST /api/tezrati/v1/brand/get
     * @params
     * @Auther Abhijit swain
     * @desc This API for get brands.
     * @autherization SellerAuth
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
    /**
     * @filename BrandController.js
     * @method updateBrand
     * @router POST /api/tezrati/v1/brand/update
     * @params
     * @Auther Abhijit swain
     * @desc This API for update brand.
     * @autherization SellerAuth
     */
    updateBrand: async (req, res) => {
        console.log('Inside BrandController updateBrand API..');
        const response = new CustomResponse();
        try{
            let inputData=_.pick(req.body,['brand_id','brandName','isActive']);
            let result = await BrandDataValidate(inputData,BrandEvents.update);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(result.errors,"Invalid input"));
            }
            //let check brand
            let brand=await Brand.findOne({
                isDeleted:false,
                _id:new ObjectId(inputData.brand_id)
            });
            if(!brand){
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound("Brand not found","Brand not found"));
            }
            //let update brand
            
            let updateData={
                brandName:inputData.brandName||inputData.brandName,
                isActive:inputData.isActive
            }
            console.log(updateData);
            let updateBrand = await Brand.updateOne({
                isDeleted:false,
                _id:new ObjectId(inputData.brand_id)
            },updateData);
            let updatedBrand = await Brand.findOne({
                isDeleted:false,
                _id:new ObjectId(inputData.brand_id)
            })
            return res.status(ResponseCode.OK).json(response.setSuccess(updatedBrand,"Brand update successfully"));

        }catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,"Internal server error"));
        }
    }
}