const exppress = require('express');
const addressRouter = exppress.Router();
const CustomerAuth = require('../../middlewares/CustomerAuth');
const AddressController = require('../../controllers/customer/AddressController');
addressRouter.post('/add',CustomerAuth,AddressController.addAddress);
addressRouter.post('/update',CustomerAuth,AddressController.updateAddress);
addressRouter.post('/delete',CustomerAuth,AddressController.deleteAddress);
addressRouter.get('/get',CustomerAuth,AddressController.getAddress);

// brandRouter.post('/refresh',AuthController.refreshToken);
module.exports=addressRouter;