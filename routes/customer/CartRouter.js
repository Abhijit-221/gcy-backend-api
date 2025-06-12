const exppress = require('express');
const cartRouter = exppress.Router();
const CustomerAuth = require('../../middlewares/CustomerAuth');
const CartController = require('../../controllers/customer/CartController');
const productValidate = require('../../middlewares/productValidateForCart');
cartRouter.post('/add',CustomerAuth,productValidate,CartController.addToCart);
cartRouter.post('/remove',CustomerAuth,productValidate,CartController.removeFromCart);
cartRouter.get('/mycart',CustomerAuth,CartController.getMyCart);

// brandRouter.post('/refresh',AuthController.refreshToken);
module.exports=cartRouter;