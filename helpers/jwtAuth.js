const jwt = require('jsonwebtoken');
const {AccessTokenExpiry,RefreshTokenExpiry}=require('../config/constants');

const generateToken=async (payload)=>{
    const AccessToken = await jwt.sign(payload,process.env.SCRETKEY,{expiresIn:AccessTokenExpiry});
    const RefreshToken = await jwt.sign(payload,process.env.SCRETKEY,{expiresIn:RefreshTokenExpiry});
    return {AccessToken,RefreshToken}
};
const generateAccessToken=async (payload)=>{
    // console.log(payload);
    const AccessToken = await jwt.sign(payload,process.env.SCRETKEY,{expiresIn:AccessTokenExpiry});
    return {AccessToken}
};
const verifyToken = (token)=>jwt.verify(token,process.env.SCRETKEY);

module.exports={generateToken,generateAccessToken,verifyToken};