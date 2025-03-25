const exppress = require('express');
const variantRouter = exppress.Router();
const CustomerAuth = require('../../middlewares/CustomerAuth');
const VariantController = require('../../controllers/customer/VariantController');

variantRouter.get('/get',CustomerAuth,VariantController.getVarientList);
// variantRouter.post('/refresh',AuthController.refreshToken);
module.exports=variantRouter;