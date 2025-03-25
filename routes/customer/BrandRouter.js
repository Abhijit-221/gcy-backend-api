const exppress = require('express');
const brandRouter = exppress.Router();
const CustomerAuth = require('../../middlewares/CustomerAuth');
const BrandController = require('../../controllers/customer/BrandController');

brandRouter.get('/get',CustomerAuth,BrandController.getBrands);
// brandRouter.post('/refresh',AuthController.refreshToken);
module.exports=brandRouter;