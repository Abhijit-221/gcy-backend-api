const express = require('express');
const SellerAuth = require('../../middlewares/SellerAuth');
const ProductController = require('../../controllers/products/ProductController');
const uploadFile = require('../../middlewares/fileUploadWithCloud');
const ProductGroupController = require('../../controllers/products/ProductGroupController');
const productRouter = express.Router();

const productImgMimeType = [
    'image/jpeg',
    'image/png',
];
const Payload = {
    fields:[
        {name: 'productImage', maxCount: 5},
    ],
    dest_path:'product',
    allowedMimeTypes:productImgMimeType,
    msg:"File size must be less that 5MB",
    size:1024*1024*5
};
productRouter.post('/create',SellerAuth,uploadFile(Payload),ProductController.createProduct);
productRouter.post('/update',SellerAuth,ProductController.updateProduct);
productRouter.post('/update-images',SellerAuth,SellerAuth,uploadFile(Payload),ProductController.updateProductImage);

productRouter.get('/get',SellerAuth,ProductController.products);
// productRouter.get('/for-product',SellerAuth,UnitTypeController.getUnitTypeForProduct);

//product group routes
productRouter.post('/update-product-group',SellerAuth,ProductGroupController.updateProductGroup);
productRouter.get('/get-product-group',SellerAuth,ProductGroupController.getProductGroup);
module.exports = productRouter ;