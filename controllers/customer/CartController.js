const { CustomResponse, ResponseCode,_,Events } = require("../../config/constants");
const { CartDataValidate, Cart } = require("../../models/customer/cart");
const { Product } = require("../../models/product/product");
const CartEvents = Events.customer.cart;
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


module.exports={
    /**
     * @filename CartController.js
     * @method addToCart
     * @router POST /api/tezrati/v1/customer/cart/add
     * @params
     * @Auther Abhijit swain
     * @desc This API for prodcut add to cart.
     * @autherization CustomerAuth
     */
    addToCart:async(req,res)=>{
        console.log('Inside CartController addToCart API..');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['items']);//,'totalAmount','discount','finalAmount'
            let result = await CartDataValidate(inputData,CartEvents.add);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors,'Invalid inputs')
                )
            }
            //let check products
            // let notFound=[];
            // let product = inputData.items.map(async(item)=>{
            //     let product = await Product.findById({_id:new ObjectId(item.productId),isDeleted:false,isActive:true});
            //     if(!product){
            //         notFound=item.productId
            //     }
            // })
            //let check if the product is exist on cart then add the quantity.
            let cart = await Cart.findOne({
                status:'active',
                createdBy:new ObjectId(req.user.id),
                isDeleted:false
            });
            console.log("cart:",cart);
            let createCart;
            if(cart){
                for(item of inputData.items){
                    let cartItem = await Cart.findOne({
                        status:'active',
                        createdBy:new ObjectId(req.user.id),
                        isDeleted:false,
                        // 'items.productId':new ObjectId(item.productId)
                    }, 
                    { items: { $elemMatch: { productId: new ObjectId(item.productId) } } }, // Project only matching item
                    
                );
                    console.log('cartItem:',cartItem);
                    if(cartItem){
                        let totalQty = cartItem.items[0].quantity+item.quantity ;
                        console.log('total quantity:',totalQty);
                        await Cart.updateOne({
                            status:'active',
                            createdBy:new ObjectId(req.user.id),
                            isDeleted:false,
                            // items: { $elemMatch: { productId: new ObjectId(item.productId) } }
                            // 'items.productId':item.productId
                        },{
                            $set:{
                                'items.$[i].quantity':totalQty,
                                'items.$[i].price':cartItem.items[0].price,
                                'items.$[i].totalPrice':cartItem.items[0].price*totalQty,
                            }
                        },{
                            arrayFilters:[
                                {
                                    "i.productId":new ObjectId(item.productId)
                                }
                            ]
                        });
                    }
                    else{
                        console.log('item:---',item);
                        await Cart.findOneAndUpdate({
                            status:'active',
                            createdBy:new ObjectId(req.user.id),
                            isDeleted:false,
                            // 'items.productId':item.productId
                        },{
                            $push:{
                                items:{
                                    productId:item.productId,
                                    quantity:item.quantity,
                                    price:item.price,
                                    totalPrice:item.price*item.quantity
                                }
                            },
                            
                        },);
                    }
                }
                createCart = await Cart.findOneAndUpdate({
                    status:'active',
                    createdBy:new ObjectId(req.user.id),
                    isDeleted:false
                },[
                    {
                        $set: {
                            totalAmount: {
                                $sum: "$items.totalPrice", // Calculate totalAmount dynamically
                            },
                            finalAmount:{
                                $sum: "$items.totalPrice"
                            }
                        },
                    },
                ],{ new: true }
                );
            }
            else{
                
                let total=inputData.items.reduce((acc,el)=>{
                    el.totalPrice=el.price*el.quantity;
                    inputData.totalPrice=el.price*el.quantity;
                    return acc=acc+el.totalPrice;
                },0);
                console.log('total:',total);
                inputData.totalAmount=total;
                inputData.finalAmount=total;
                inputData.createdBy=req.user.id;
                // console.log("inputData:",inputData);
                createCart = await Cart.create(inputData);
            }
            return res.status(ResponseCode.CREATED).json(
                response.setCreated(createCart,'Product add to cart successfully.')
            )
        }
        catch(error){
            console.log('Internal server error:',error);
            
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error,'Internal server error')
            )
        }
    },
    /**
     * @filename CartController.js
     * @method addToCart
     * @router POST /api/tezrati/v1/customer/cart/add
     * @params
     * @Auther Abhijit swain
     * @desc This API for prodcut add to cart.
     * @autherization CustomerAuth
     */
    updateCart: async(req,res)=>{
        
    }
}