const exppress = require('express');
const cartRouter = exppress.Router();
const CustomerAuth = require('../../middlewares/CustomerAuth');
const CartController = require('../../controllers/customer/CartController');
const productValidate = require('../../middlewares/productValidateForCart');
cartRouter.post('/add',CustomerAuth,productValidate,CartController.addToCart);
// brandRouter.post('/refresh',AuthController.refreshToken);
module.exports=cartRouter;