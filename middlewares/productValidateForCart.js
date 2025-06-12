const { ResponseCode, CustomResponse } = require("../config/constants");
const { Product } = require("../models/product/product");
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
module.exports=async (req,res,next)=>{
    let response= new CustomResponse();
    // console.log('items:',req.body.items);
    if(req.body.items){
        // let productIds=[];
        for(let item of req.body.items){
            let product = await Product.findOne(
                {
                    _id:new ObjectId(item.productId),
                    isDeleted:false,
                    isActive:true
                }
            );
            if(!product){
                return res.status(ResponseCode.NOT_FOUND).json(
                    response.setNotfound('Product not found,check productId.','Product not found')
                )
            }
            if(product && product.quantity<item.quantity){
                return res.status(ResponseCode.NOT_FOUND).json(
                    response.setNotfound('Product not available.','Out of stock')
                )
            }
            // if(productIds.includes(item.productId)){
            //     req.items=
            // }
            
        }
        next();
    }
    else{
        return res.status(ResponseCode.BAD_REQUEST).json(
            response.setBadrequest('Please provide items.','Please provide items')
        );
    }
}