const { ResponseCode,_,CustomResponse, Events } = require("../../config/constants");
const UnitTypeEvents = Events.product.unitType;
const { mongoose } = require("mongoose");
const { UnitType, UnitTypeDataValidate } = require("../../models/product/unitType");
const ObjectId = mongoose.Types.ObjectId;

module.exports={
    /**
     * @filename VariantController.js
     * @method createUnitType
     * @router POST /api/tezrati/v1/unit-type/create
     * @params
     * @Auther Abhijit swain
     * @desc Unit type create.
     * @autherization SellerAuth
     */
    createUnitType:async(req,res)=>{
        console.log('Inside UnitTypeController createUnitType API...');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['unit_type','unit_count']);
            let result = await UnitTypeDataValidate(inputData,UnitTypeEvents.create);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(result.errors,"Invalid inputs"));
            }
            //let check unit type is exist or not
            let checkUnitType = await UnitType.findOne({
                unit_type:inputData.unit_type,
                isDeleted:false
            });
            if(checkUnitType){
                return res.status(ResponseCode.CONFLICT).json(response.setConflict({errorMsg:"Unit type already exist"},"Unit type already exist"));
            }
            inputData.createdBy = req.seller.id;
            inputData.updatedBy = req.seller.id;
            let unitType = await UnitType.create(inputData);
            return res.status(ResponseCode.CREATED).json(response.setCreated(unitType,"Unit type created successfully"));
        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,'Internal server error.'));
        }
    },
    /**
     * @filename VariantController.js
     * @method updateUnitType
     * @router POST /api/tezrati/v1/unit-type/update
     * @params
     * @Auther Abhijit swain
     * @desc Unit type update.
     * @autherization SellerAuth
     */
    updateUnitType:async(req,res)=>{
        console.log('Inside UnitTypeController updateUnitType API...');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['unitId','unit_type','unit_count','isActive']);
            let result = await UnitTypeDataValidate(inputData,UnitTypeEvents.update);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(result.errors,"Invalid inputs"));
            }
            //let check unit type is exist or not
            let checkUnitType = await UnitType.findOne({
                _id:new ObjectId(inputData.unitId),
                isDeleted:false
            });
            if(!checkUnitType){
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound({errorMsg:"Unit type not exist"},"Unit type not exist"));
            }
            let otherUnitType = await UnitType.findOne({
                unit_type:inputData.unit_type,
                isDeleted:false,
                _id:{$ne:new ObjectId(inputData.unitId)}
            });
            if(otherUnitType){
                return res.status(ResponseCode.CONFLICT).json(response.setConflict({errorMsg:"Unit type already exist"},"Unit type already exist"));
            }
            inputData.updatedBy = req.seller.id;
            if(inputData.isActive){
                inputData.isActive = inputData.isActive==='true'||inputData.isActive===true?true:false;
            }
            let unitType = await UnitType.findOneAndUpdate({
                _id:new ObjectId(inputData.unitId),
                isDeleted:false
            },inputData);
            return res.status(ResponseCode.CREATED).json(response.setCreated(unitType,"Unit type update successfully"));
        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,'Internal server error.'));
        }
    },
    /**
     * @filename VariantController.js
     * @method getUnitType
     * @router POST /api/tezrati/v1/unit-type/get
     * @params
     * @Auther Abhijit swain
     * @desc Get unit type.
     * @autherization SellerAuth
     */
    getUnitType:async(req,res)=>{
        console.log('Inside UnitTypeController getUnitType API...');
        const response = new CustomResponse();
        try{
            let {search}=req.query;
            let searchQuery = search?{unit_type:{ $regex: search, $options: "i" }}:{};
            let unitType = await UnitType.find({
                isDeleted:false,
                ...searchQuery
            }).sort({unit_type:1});
            return res.status(ResponseCode.OK).json(response.setSuccess(unitType,"Unit type fetched successfully."));

        }catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,'Internal server error.'));
        }

    },
    /**
     * @filename VariantController.js
     * @method getUnitTypeForProduct
     * @router POST /api/tezrati/v1/unit-type/for-product
     * @params
     * @Auther Abhijit swain
     * @desc Get unit type for product.
     * @autherization SellerAuth
     */
    getUnitTypeForProduct:async(req,res)=>{
        console.log('Inside UnitTypeController getUnitTypeForProduct API...');
        const response = new CustomResponse();
        try{
            let {search}=req.query;
            let searchQuery = search?{unit_type:{ $regex: search, $options: "i" }}:{};
            let unitType = await UnitType.find({
                isDeleted:false,
                isActive:true,
                ...searchQuery
            }).sort({unit_type:1});
            return res.status(ResponseCode.OK).json(response.setSuccess(unitType,"Unit type fetched successfully."));

        }catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,'Internal server error.'));
        }
    }
}