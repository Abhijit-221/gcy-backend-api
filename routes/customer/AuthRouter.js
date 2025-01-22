const exppress = require('express');
const authRouter = exppress.Router();
const AuthController = require('../../controllers/customer/AuthController');
const passport = require('passport');
const CustomerAuth = require('../../middlewares/CustomerAuth');

authRouter.post('/signup',AuthController.signup);
authRouter.post('/login',AuthController.login);
authRouter.get('/get',CustomerAuth,AuthController.getCustomer);
authRouter.post('/refresh',AuthController.refreshToken);
module.exports=authRouter;