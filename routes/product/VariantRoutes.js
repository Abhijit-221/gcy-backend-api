const express = require('express');
const SellerAuth = require('../../middlewares/SellerAuth');
const VariantController = require('../../controllers/products/VariantController');
const variantRouter = express.Router();

variantRouter.post('/create',SellerAuth,VariantController.createVariant);
variantRouter.post('/update',SellerAuth,VariantController.updateVariant);
variantRouter.get('/get',SellerAuth,VariantController.getVarientList);
variantRouter.get('/for-product',SellerAuth,VariantController.getVarientsForProduct);

module.exports = variantRouter;