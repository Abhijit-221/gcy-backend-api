const exppress = require('express');
const categoryRouter = exppress.Router();
const AuthController = require('../../controllers/seller/AuthController');
const SellerAuth = require('../../middlewares/SellerAuth');
const uploadFile = require('../../middlewares/fileUploadWithCloud');
const CategoryController = require('../../controllers/products/CategoryController');
const profileMimeType = [
    'image/jpeg',
    'image/png',
];
const categoryPayload = {
    fields:[
        {name: 'catImage', maxCount: 1},
    ],
    dest_path:'category',
    allowedMimeTypes:profileMimeType,
    msg:"File size must be less that 5MB",
    size:1024*1024*5
};


categoryRouter.post('/create',SellerAuth,uploadFile(categoryPayload),CategoryController.addCategory);
categoryRouter.post('/update',SellerAuth,uploadFile(categoryPayload),CategoryController.updateCategory);
categoryRouter.post('/delete',SellerAuth,CategoryController.deleteCategory);
categoryRouter.get('/for-seller/get',SellerAuth,CategoryController.getCategory);


module.exports=categoryRouter;