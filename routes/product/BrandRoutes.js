const express = require('express');
const brandRouter = express.Router();
const SellerAuth = require('../../middlewares/SellerAuth');
const BrandController = require('../../controllers/products/BrandController');

brandRouter.post('/update',SellerAuth,BrandController.updateBrand);
brandRouter.get('/get',SellerAuth,BrandController.getBrands);

module.exports=brandRouter;
