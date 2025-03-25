const exppress = require('express');
const productRouter = exppress.Router();
const CustomerAuth = require('../../middlewares/CustomerAuth');
const ProductController = require('../../controllers/customer/ProductController');

productRouter.post('/get',CustomerAuth,ProductController.products);
// productRouter.post('/refresh',AuthController.refreshToken);
module.exports=productRouter;