const { ResponseCode, Events, CustomResponse,_ } = require("../../config/constants");
const { CustomerDataValidate, Customer } = require("../../models/customer/customer");
const CustomerEvent = Events.customer;
const bcrypt = require('bcrypt');
const { generateToken, verifyToken, generateAccessToken } = require("../../helpers/jwtAuth");
const jwt = require('jsonwebtoken');
/**AuthController.js*/
module.exports = {
    /**
     * @filename AuthController.js
     * @method signup
     * @router POST /api/tezrati/v1/auth/signup
     * @params
     * @Auther Abhijit swain
     * @autherization
     */
    signup: async(req,res)=>{
        console.log('Inside customer AuthController signup API....');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['email','userName','password']);
            let results = await CustomerDataValidate(inputData,CustomerEvent.signup);
            if(results.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(response
                    .setStatus(ResponseCode.BAD_REQUEST)
                    .setError(results.errors.errors)
                    .setMessage("Invalid input data.")
                )
            }
            //let check existing user
            let existingUserEmail = await Customer.findOne({
                email:inputData.email,
                isDeleted:false
            });
            if(existingUserEmail){
                return res.status(ResponseCode.BAD_REQUEST).json(response
                    .setStatus(ResponseCode.BAD_REQUEST)
                    .setError({msg:"This Email already exist."})
                    .setMessage("This Email already exist.")
                )
            }
            //let check username
            let existingUserName = await Customer.findOne({
                userName:inputData.userName,
                isDeleted:false
            });
            if(existingUserName){
                return res.status(ResponseCode.BAD_REQUEST).json(response
                    .setStatus(ResponseCode.BAD_REQUEST)
                    .setError({msg:"This user name already exist."})
                    .setMessage("This user name already exist.")
                )
            }
            let createUser = await Customer.create(inputData);
            res.status(ResponseCode.CREATED).json(
                response
                .setStatus(ResponseCode.CREATED)
                .setData(createUser)
                .setMessage("Customer created successfully")
            );
        }
        catch(error){
            console.log(error)
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response
                .setStatus(ResponseCode.INTERNAL_SERVERERROR)
                .setError(error)
                .setMessage("Internal server error")
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
    login: async(req,res)=>{
        console.log('Inside customer AuthController login API....');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['email','password']);
            let results = await CustomerDataValidate(inputData,CustomerEvent.login);
            if(results.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(results.errors,"Invalid input data.")
                )           
            }
            //let check customer exist or not 
            let user = await Customer.findOne({email:inputData.email,isDeleted:false});
            if(!user){
                return res.status(ResponseCode.NOT_FOUND).json(
                    response.setNotfound("User not found on this email.","User not found on this email.")
                )    
            }
            if(!user.isActive){
                return res.status(ResponseCode.FORBIDDEN).json(
                    response.setForbidden("You account has suspended.","You account has suspended.")
                )    
            }
            let comparePassword = await bcrypt.compare(inputData.password,user.password);
            if(!comparePassword){
                return res.status(ResponseCode.FORBIDDEN).json(
                    response.setForbidden("Enter a valid password.","Enter a valid password.")
                )  
            }
            let {AccessToken,RefreshToken} = await generateToken({id:user.id});
            return res.status(ResponseCode.OK).json(
                response.setSuccess({AccessToken,RefreshToken},'Login successfully')
            ) 

        }
        catch(error){
            console.log(error)
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,'Internal server error')
            )
        }
    },
    /**
     * @filename AuthController.js
     * @method refreshToken
     * @router POST /api/tezrati/customer/v1/auth/refresh
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
    getCustomer: async(req,res)=>{
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
    

}