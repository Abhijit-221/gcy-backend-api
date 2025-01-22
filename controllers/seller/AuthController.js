const { ResponseCode, Events, CustomResponse,_ } = require("../../config/constants");
const SellerEvents = Events.seller;
const bcrypt = require('bcrypt');
const { generateToken, verifyToken, generateAccessToken } = require("../../helpers/jwtAuth");
const jwt = require('jsonwebtoken');
const { SellerDataValidate, Seller } = require("../../models/seller/seller");
const formidable = require("formidable");
const { mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const {unlinkFiles,unlinkExistFiles} = require('../../helpers/unlinkFile');
/**AuthController.js*/
module.exports = {
    /**
     * @filename AuthController.js
     * @method signup
     * @router POST /api/tezrati/seller/v1/signup
     * @params
     * @Auther Abhijit swain
     * @autherization
     */
    signup: async(req,res)=>{
        console.log('Inside seller AuthController signup API....');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['email','userName','password']);
            let results = await SellerDataValidate(inputData,SellerEvents.signup);
            if(results.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(results.errors.errors,"Invalid input data.")
                )
            }
            //let check existing user
            let existingSellerEmail = await Seller.findOne({
                email:inputData.email,
                isDeleted:false
            });
            if(existingSellerEmail){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest({msg:"This Email already exist."},"This Email already exist."))
            }
            //let check username
            let existingSellerName = await Seller.findOne({
                userName:inputData.userName,
                isDeleted:false
            });
            if(existingSellerName){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest({msg:"This user name already exist."},"This user name already exist."))
            }
            let createUser = await Seller.create(inputData);
            res.status(ResponseCode.CREATED).json(
                response.setCreated(createUser,"Seller created successfully")
            );
        }
        catch(error){
            console.log(error)
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,"Internal server error"))
        }
    },
    /**
     * @filename AuthController.js
     * @method login
     * @router POST /api/tezrati/seller/v1/auth/signup
     * @params
     * @Auther Abhijit swain
     * @autherization
     */
    login: async(req,res)=>{
        console.log('Inside customer AuthController login API....');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['email_username','password']);
            let results = await SellerDataValidate(inputData,SellerEvents.login);
            if(results.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(results.errors.errors,"Invalid input data."))           
            }
            //let check customer exist or not 
            let seller = await Seller.findOne({
                $or:[
                    {email:inputData.email_username},
                    {username:inputData.email_username}
                ],
                isDeleted:false
            });
            if(!seller){
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound({error:"User not found"},"User not found"))    
            }
            if(!seller.isActive){
                return res.status(ResponseCode.FORBIDDEN).json(response.setForbidden({error:"You account has suspended."},"You account has suspended."))    
            }
            let comparePassword = await bcrypt.compare(inputData.password,seller.password);
            if(!comparePassword){
                return res.status(ResponseCode.FORBIDDEN).json(response.setForbidden({error:"Enter a valid password."},"Enter a valid password."))  
            }
            let {AccessToken,RefreshToken} = await generateToken({id:seller.id});
            return res.status(ResponseCode.OK).json(response.setSuccess({AccessToken,RefreshToken},"Login successfully.")) 

        }
        catch(error){
            console.log(error)
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,"Internal server error"))
        }
    },
    /**
     * @filename AuthController.js
     * @method refreshToken
     * @router POST /api/tezrati/seller/v1/auth/refresh
     * @params
     * @Auther Abhijit swain
     * @autherization
     */
    refreshToken: async(req,res)=>{
        console.log('Inside AuthController refreshToken API...');
        const response = new CustomResponse();
        try{
            let {refreshToken}=_.pick(req.body,['refreshToken']);
            if(!refreshToken){
                return res.status(ResponseCode.FORBIDDEN).json(
                    response.setBadrequest("Enter refresh token","Refresh token required.")
                )
            }
            console.log(process.env.SCRETKEY);
            jwt.verify(refreshToken, process.env.SCRETKEY, async(err, user) => {
                if (err && err.name === 'TokenExpiredError') {
                  return res.status(ResponseCode.FORBIDDEN).json(
                    response.setForbidden(err,'Token expired login again.')
                  )   
                }else
                if (err ||!user) {
                    return res.status(ResponseCode.FORBIDDEN).json(
                        response.setForbidden(err,err.message||"Invalid token.")
                      )
                }
                let {AccessToken} = await generateAccessToken({id:user.id});
                // console.log('AccessToken:---',AccessToken);
                return res.status(ResponseCode.OK).json(response.setSuccess({AccessToken},"Accesstoken generated successfully."));
              });
        }
        catch(error){
            console.log(error);
            res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,"Internal server error! Try after some time.")
            )
        }
    },

    /**
     * @filename AuthController.js
     * @method login
     * @router POST /api/tezrati/v1/auth/signup
     * @params
     * @Auther Abhijit swain
     * @autherization
     */
    getSeller: async(req,res)=>{
        console.log('Inside customer AuthController login API....');
        const response = new CustomResponse();
        try{
            return res.status(ResponseCode.OK).json(response.setSuccess({},"User fetched.")
            );
        }catch(error){
            console.log(error)
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response
                .setStatus(ResponseCode.INTERNAL_SERVERERROR)
                .setError(error)
                .setMessage("Internal server error")
            );
        }
    },
    /**
     * @filename AuthController.js
     * @method profileUpdate
     * @router POST /api/tezrati/v1/auth/signup
     * @params
     * @Auther Abhijit swain
     * @autherization
     */
    updateProfile: async(req,res)=>{
        console.log('Inside customer AuthController login API....');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,[
                'seller_id',
                'phone',
                'fullName',
                // 'profilePic',
                'businessName',
                'businessType',
                'registrationNumber',
                'taxId',
                'businessAddress',
                'city',
                'state',
                'postalCode',
                'country',
                'bankAccountName',
                'bankAccountNumber',
                'bankName',
                'swiftCode',
                'storeName',
                'storeDescription',
                'storeCategory',
                'agreementAccepted',
                'govId',
                // 'proofOfAddress',
                'GSTIN'
            ]);
            console.log('Input Data:',inputData);
            console.log('file:',req.files);
            let result = await SellerDataValidate(inputData,SellerEvents.profile_update);
            if(result.hasError){
                await unlinkFiles(req.files)
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(result.errors,"Invalid inputs"));
            }
            //let check seller is exist or not 
            let checkSellerExist = await Seller.findOne({
                _id:new ObjectId(inputData.seller_id),
                isDeleted:false
            });
            if(!checkSellerExist){
                await unlinkFiles(req.files)
                return res.status(ResponseCode.NOT_FOUND).json(
                    response.setNotfound({error:"seller_id invalid. User not found."},"User not found.")
                )
            }
            
            let checkExistOther = await Seller.find({
                isDeleted:false,
                $or:[
                    {phone:inputData.phone},
                    {businessName:inputData.businessName},
                    {registrationNumber:inputData.registrationNumber},
                    {taxId:inputData.taxId},
                    {bankAccountNumber:inputData.bankAccountNumber},
                    {govId:inputData.govId},
                    {GSTIN:inputData.GSTIN}
                ],
                _id:{$ne:new ObjectId(inputData.seller_id)}
            })
            if(checkExistOther.length>0){
                let errormessage=[];
                let index=0;
                for (let seller of checkExistOther){

                    if(seller.phone === inputData.phone){
                        errormessage.push(`${index}.Phone number already in use.`);
                    }
                    if(seller.businessName===inputData.businessName){
                        errormessage.push(`${index}.Business name already in use.`);
                    }
                    if(seller.registrationNumber===inputData.registrationNumber){
                        errormessage.push(`${index}.Registration number already in use.`);
                    }
                    if(seller.taxId ===inputData.taxId){
                        errormessage.push(`${index}.Tax ID already in use.`);
                    }
                    if(seller.bankAccountNumber===inputData.bankAccountNumber){
                        errormessage.push(`${index}.Bank account number already in use.`);
                    }
                    if(seller.govId===inputData.govId){
                        errormessage.push(`${index}.Gov ID already in use.`);
                    }
                    if(seller.GSTIN===inputData.GSTIN){
                        errormessage.push(`${index}.GSTIN already in use.`);
                    }
                }
                await unlinkFiles(req.files);
                return res.status(ResponseCode.CONFLICT).json(response.setConflict('',errormessage));
            }
            let updatedData = {...inputData};
            delete updatedData.seller_id;
            if(req.files){
                // console.log('req.files:',req.files);
                if(checkSellerExist.profilePic){
                    await unlinkExistFiles({profilePic:checkSellerExist.profilePic});
                }
                if(checkSellerExist.proofOfAddress){
                    await unlinkExistFiles({proofOfAddress:checkSellerExist.proofOfAddress});
                }
                // console.log('pth:',req.files.profilePic[0].path);
                updatedData.profilePic={path:req.files.profilePic[0].path,filename:req.files.profilePic[0].filename};
                updatedData.proofOfAddress={path:req.files.proofOfAddress[0].path,filename:req.files.proofOfAddress[0].filename};
            }
            let updateProfile = await Seller.findOneAndUpdate({
                _id:inputData.seller_id,
                isDeleted:false
            },updatedData,{new: true,fields: { password: 0 }});
            console.log('updateProfile:',updateProfile);
            res.status(ResponseCode.OK).json(response.setSuccess(updateProfile,"Profile updated successfully."));
        }
        catch(error){
            console.log(error);
            await unlinkFiles(req.files);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,"Internal server error")
            );
        }
    }

}