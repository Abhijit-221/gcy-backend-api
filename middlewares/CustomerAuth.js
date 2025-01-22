const passport = require("passport");
const { CustomResponse, ResponseCode } = require("../config/constants");

const response = new CustomResponse();
const CustomerAuth = (req,res,next)=>{
    
        passport.authenticate('jwt',{session:false},(err,user,info)=>{
            console.log('err:',err);
            console.log('user:',user);
            console.log('info:',info.name);
            if(err){
                return res.status(ResponseCode.UNAUTHORIZED).json(
                    response.setUnauthorized(err,"Invalid token.")
                )
            }
            if(!user){
                if (info?.name === "TokenExpiredError") {
                  return res.status(ResponseCode.UNAUTHORIZED).json(
                      response.setUnauthorized("TokenExpiredError","Token has expired.")
                  )
                }
                if (info?.name === "JsonWebTokenError") {
                  return res.status(ResponseCode.UNAUTHORIZED).json(
                      response.setUnauthorized("JsonWebTokenError",info.message || "Invalid JWT token")
                  )
                }
                return res.status(ResponseCode.UNAUTHORIZED).json(
                  response.setUnauthorized("Unauthorized",info.message || "Authentication failed")
                )
                
            }
            req.user = user;
            next();
        })(req, res, next);       

};
module.exports=CustomerAuth;