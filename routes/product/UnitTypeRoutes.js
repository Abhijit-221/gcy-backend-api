const express = require('express');
const SellerAuth = require('../../middlewares/SellerAuth');
const UnitTypeController = require('../../controllers/products/UnitTypeController');
const unitTypeRouter = express.Router();

unitTypeRouter.post('/create',SellerAuth,UnitTypeController.createUnitType);
unitTypeRouter.post('/update',SellerAuth,UnitTypeController.updateUnitType);
unitTypeRouter.get('/get',SellerAuth,UnitTypeController.getUnitType);
unitTypeRouter.get('/for-product',SellerAuth,UnitTypeController.getUnitTypeForProduct);

module.exports = unitTypeRouter ;