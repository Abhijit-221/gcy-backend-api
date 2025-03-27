const { default: mongoose } = require("mongoose");
const { CustomResponse, ResponseCode, _ , Events } = require("../../config/constants");
const { AddressDataValidate, CustomerAddress } = require("../../models/customer/Address");
const AddressEvents = Events.customer.address;
const ObjectId = mongoose.Types.ObjectId;

module.exports={
    /**
     * @filename AddressController.js
     * @method addAddress
     * @router POST /api/tezrati/v1/customer/address/add
     * @params
     * @Auther Abhijit swain
     * @desc This API for add address.
     * @autherization CustomerAuth
     */
    addAddress:async(req,res)=>{
        console.log('Inside AddressController addAddress API...');
        const response=new CustomResponse();
        try{
            let inputData=_.pick(req.body,[
                'name',
                'phNo',
                'altPhNo',
                'landmark1',
                'landmark2',
                'houseNo',
                'city',
                'pin',
                'receiveTime',
            ]);
            let result = await AddressDataValidate(inputData,AddressEvents.add);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors,'Invalid inputs')
                )
            }
            //let check duplicate 
            // let dupAddress = await CustomerAddress.findOne({
            //     landmark1:inputData.landmark1,
            //     pin:inputData.landmark1,
            //     city:inp
            // })
            //let check primary address
            let checkPrimary = await CustomerAddress.findOne({
                isPrimary:true,
                isDeleted:false
            })
            inputData.user_id = req.user.id;
            inputData.createdBy = req.user.id;
            inputData.isPrimary = checkPrimary?false:true;
            let addressCreate = await CustomerAddress.create(inputData);
            return res.status(ResponseCode.CREATED).json(
                response.setCreated(addressCreate,'Address Added Successfully')
            );

        }catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,'Internal server error')
            )
        }

    },
    /**
     * @filename AddressController.js
     * @method updateAddress
     * @router POST /api/tezrati/v1/customer/address/update
     * @params
     * @Auther Abhijit swain
     * @desc This API for update address.
     * @autherization CustomerAuth
     */
    updateAddress:async(req,res)=>{
        console.log('Inside AddressController addAddress API...');
        const response=new CustomResponse();
        try{
            let inputData = _.pick(req.body,[
                'add_id',
                'name',
                'phNo',
                'altPhNo',
                'landmark1',
                'landmark2',
                'houseNo',
                'city',
                'pin',
                'receiveTime',
                'isPrimary'
            ]);
            let result = await AddressDataValidate(inputData,AddressEvents.update);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors,'Invalid inputs')
                )
            }
            let address = await CustomerAddress.findOne({
                _id:new ObjectId(inputData.add_id),
                isActive:true,
                isDeleted:false,
                user_id:new ObjectId(req.user.id)
            });
            if(!address){
                return res.status(ResponseCode.NOT_FOUND).json(
                    response.setNotfound('Address not found','Address not found')
                )
            }
            if(inputData.isPrimary){
                let updateIfPrime = await await CustomerAddress.updateOne({
                    // isActive:true,
                    isDeleted:false,
                    user_id:new ObjectId(req.user.id),
                    isPrimary:true
                },{isPrimary:false});
            }
            let updateData = {
                ...inputData,
                updatedBy:req.user.id,
                updatedAt:Date.now(),
            }
            delete updateData.add_id;
            let updateAddress = await CustomerAddress.updateOne({
                _id:new ObjectId(inputData.add_id),
                isDeleted:false,
                isActive:true,
                user_id:new ObjectId(req.user.id)
            },updateData);
            return res.status(ResponseCode.OK).json(
                response.setSuccess(updateAddress,"Address updated success.")
            )

        }catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,'Internal server error')
            )
        }
    },
    /**
     * @filename AddressController.js
     * @method deleteAddress
     * @router POST /api/tezrati/v1/customer/address/delete
     * @params
     * @Auther Abhijit swain
     * @desc This API for delete address.
     * @autherization CustomerAuth
     */
    deleteAddress: async(req,res)=>{
        console.log('Inside AddressController deleteAddress API...');
        const response=new CustomResponse();
        try{
            let inputData = _.pick(req.body,['add_id']);
            let result = await AddressDataValidate(inputData,AddressEvents.remove);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors,'Invalid inputs')
                )
            }
            //let check this address exist or not
            let address = await CustomerAddress.findOne({
                _id:new ObjectId(inputData.add_id),
                isDeleted:false,
                user_id:new ObjectId(req.user.id)
                // isActive:true
            });
            if(!address){
                return res.status(ResponseCode.NOT_FOUND).json(
                    response.setNotfound('Address not found','Address not found')
                )
            }
            let deleteAddress=await CustomerAddress.findByIdAndUpdate({
                _id:new ObjectId(inputData.add_id),
                isDeleted:false,
                user_id:new ObjectId(req.user.id)
            },{isDeleted:true});
            return res.status(ResponseCode.OK).json(
                response.setSuccess(deleteAddress,"Address deleted success.")
            )

        }catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,'Internal server error')
            )
        } 
    },
    /**
     * @filename AddressController.js
     * @method getAddress
     * @router POST /api/tezrati/v1/customer/address/get
     * @params
     * @Auther Abhijit swain
     * @desc This API for delete address.
     * @autherization CustomerAuth
     */
    getAddress: async(req,res)=>{
        console.log('Inside AddressController getAddress API...');
        const response=new CustomResponse();
        try{
            let address=await CustomerAddress.find({
                isDeleted:false,
                isActive:true,
                user_id:new ObjectId(req.user.id)
            }).sort({'createdAt':-1});
            return res.status(ResponseCode.OK).json(
                response.setSuccess(address,"Address fetched successfully.")
            )

        }catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,'Internal server error')
            )
        } 
    },
    /**
     * @filename AddressController.js
     * @method addressGetById
     * @router POST /api/tezrati/v1/customer/address/delete
     * @params
     * @Auther Abhijit swain
     * @desc This API for delete address.
     * @autherization CustomerAuth
     */
    addressGetById: async(req,res)=>{
        console.log('Inside AddressController addressGetById API...');
        const response=new CustomResponse();
        try{
            let address=await CustomerAddress.find({
                isDeleted:false,
                isActive:true,
                user_id:new ObjectId(req.user.id)
            }).sort({'createdAt':-1});
            return res.status(ResponseCode.OK).json(
                response.setSuccess(address,"Address found.")
            )

        }catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,'Internal server error')
            )
        } 
    },

}