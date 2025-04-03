const express = require('express');
const router = express.Router();

const authRouter = require('./customer/AuthRouter');
const sellerRouter = require('./seller/AuthRoutes');
const categoryRouter = require('./product/CategoryRoutes');
const variantRouter = require('./product/VariantRoutes');
const unitTypeRouter = require('./product/UnitTypeRoutes');
const productRouter = require('./product/ProductRoutes');
const brandRouter = require('./product/BrandRoutes');
const customerProductRouter = require('./customer/ProductRouter');
const customerBrandRouter = require('./customer/BrandRouter');
const customerVariantRouter = require('./customer/VariantRouter');
const customerAddressRouter = require('../routes/customer/AddressRouter');
const cartRouter = require('./customer/CartRouter');
const setupRoutes = (app) => {
    // app.use('/api', routes); // Attach the routes to /api
    app.use('/api/tezrati/customer/v1/auth', authRouter);
    app.use('/api/tezrati/seller/v1/auth',sellerRouter);
    app.use('/api/tezrati/seller/v1/category',categoryRouter);
    app.use('/api/tezrati/seller/v1/variant',variantRouter);
    app.use('/api/tezrati/seller/v1/unit-type',unitTypeRouter);
    app.use('/api/tezrati/seller/v1/product',productRouter);
    app.use('/api/tezrati/seller/v1/brand',brandRouter);
    app.use('/api/tezrati/v1/customer/product', customerProductRouter);
    app.use('/api/tezrati/v1/customer/brand', customerBrandRouter);
    app.use('/api/tezrati/v1/customer/variant', customerVariantRouter);
    app.use('/api/tezrati/v1/customer/address', customerAddressRouter);
    app.use('/api/tezrati/v1/customer/cart', cartRouter);

  };
//customer auth routes

module.exports = setupRoutes;
