const exppress = require('express');
const sellerRouter = exppress.Router();
const passport = require('passport');
const AuthController = require('../../controllers/seller/AuthController');
const SellerAuth = require('../../middlewares/SellerAuth');
const uploadFile = require('../../middlewares/fileUploadWithCloud');
const profileMimeType = [
    'image/jpeg',
    'image/png',
];
const profilePayload = {
    fields:[
        {name: 'profilePic', maxCount: 1},
        {name:'proofOfAddress', maxCount: 1}
    ],
    dest_path:'seller',
    allowedMimeTypes:profileMimeType,
    msg:"File size must be less that 5MB",
    size:1024*1024*5
};


sellerRouter.post('/signup',AuthController.signup);
sellerRouter.post('/login',AuthController.login);
sellerRouter.get('/get',SellerAuth,AuthController.getSeller);
sellerRouter.post('/refresh',AuthController.refreshToken);
sellerRouter.post('/profile-update',SellerAuth,uploadFile(profilePayload),AuthController.updateProfile);

module.exports=sellerRouter;