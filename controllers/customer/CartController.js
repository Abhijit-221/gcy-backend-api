const { CustomResponse, ResponseCode, _, Events } = require("../../config/constants");
const { CartDataValidate, Cart } = require("../../models/customer/cart");
const { Product } = require("../../models/product/product");
const CartEvents = Events.customer.cart;
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;


module.exports = {
    /**
     * @filename CartController.js
     * @method addToCart
     * @router POST /api/tezrati/v1/customer/cart/add
     * @params
     * @Auther Abhijit swain
     * @desc This API for prodcut add to cart.
     * @autherization CustomerAuth
     */
    addToCart: async (req, res) => {
        console.log('Inside CartController addToCart API..');
        const response = new CustomResponse();
        try {
            let inputData = _.pick(req.body, ['items']);//,'totalAmount','discount','finalAmount'
            let result = await CartDataValidate(inputData, CartEvents.add);
            if (result.hasError) {
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors, 'Invalid inputs')
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
                status: 'active',
                createdBy: new ObjectId(req.user.id),
                isDeleted: false
            });
            // console.log("cart:", cart);
            let createCart;
            if (cart) {
                for (item of inputData.items) {
                    let cartItem = await Cart.findOne({
                        status: 'active',
                        createdBy: new ObjectId(req.user.id),
                        isDeleted: false,
                        // 'items.productId':new ObjectId(item.productId)
                    },
                        { items: { $elemMatch: { productId: new ObjectId(item.productId) } } }, // Project only matching item

                    );
                    // console.log('cartItem:', cartItem);
                    if (cartItem) {
                        let totalQty = cartItem.items[0].quantity + item.quantity;
                        // console.log('total quantity:', totalQty);
                        await Cart.updateOne({
                            status: 'active',
                            createdBy: new ObjectId(req.user.id),
                            isDeleted: false,
                            // items: { $elemMatch: { productId: new ObjectId(item.productId) } }
                            // 'items.productId':item.productId
                        }, {
                            $set: {
                                'items.$[i].quantity': totalQty,
                                'items.$[i].price': cartItem.items[0].price,
                                'items.$[i].totalPrice': cartItem.items[0].price * totalQty,
                            }
                        }, {
                            arrayFilters: [
                                {
                                    "i.productId": new ObjectId(item.productId)
                                }
                            ]
                        });
                    }
                    else {
                        // console.log('item:---', item);
                        await Cart.findOneAndUpdate({
                            status: 'active',
                            createdBy: new ObjectId(req.user.id),
                            isDeleted: false,
                            // 'items.productId':item.productId
                        }, {
                            $push: {
                                items: {
                                    productId: item.productId,
                                    quantity: item.quantity,
                                    price: item.price,
                                    totalPrice: item.price * item.quantity
                                }
                            },

                        },);
                    }
                }
                createCart = await Cart.findOneAndUpdate({
                    status: 'active',
                    createdBy: new ObjectId(req.user.id),
                    isDeleted: false
                }, [
                    {
                        $set: {
                            totalAmount: {
                                $sum: "$items.totalPrice", // Calculate totalAmount dynamically
                            },
                            finalAmount: {
                                $sum: "$items.totalPrice"
                            }
                        },
                    },
                ], { new: true }// Update the cart and return the updated document
                );
            }
            else {

                let total = inputData.items.reduce((acc, el) => {
                    el.totalPrice = el.price * el.quantity;
                    inputData.totalPrice = el.price * el.quantity;
                    return acc = acc + el.totalPrice;
                }, 0);
                // console.log('total:', total);
                inputData.totalAmount = total;
                inputData.finalAmount = total;
                inputData.createdBy = req.user.id;
                // console.log("inputData:",inputData);
                createCart = await Cart.create(inputData);
            }
            return res.status(ResponseCode.CREATED).json(
                response.setCreated(createCart, 'Product add to cart successfully.')
            )
        }
        catch (error) {
            console.log('Internal server error:', error);

            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error, 'Internal server error')
            )
        }
    },
    /**
     * @filename CartController.js
     * @method removeFromCart
     * @router POST /api/tezrati/v1/customer/cart/remove
     * @params
     * @Auther Abhijit swain
     * @desc This API for prodcut remove from cart.
     * @autherization CustomerAuth
     */
    removeFromCart: async (req, res) => {
        console.log('Inside CartController remove from cart API');
        const response = new CustomResponse();
        try {
            let inputData = _.pick(req.body, ['cart_id', 'items',]);
            let result = await CartDataValidate(inputData, CartEvents.remove);
            if (result.hasError) {
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors, 'Invalid inputs')
                )
            }
            let getCart = await Cart.findOne({
                _id: inputData.cart_id,
                createdBy: req.user.id,
                isDeleted: false,
                status: 'active'
            }
            );
            if (!getCart) {
                return res.status(ResponseCode.NOT_FOUND).json(
                    response.setNotfound('Cart not found or you are not authorized to access this cart.', 'Cart not found.')
                );
            }
            // let updateItems={};
            let quantityCheck = inputData.items.every(item => {
                let existingItem = getCart.items.find(i => i.productId.toString() === item.productId.toString());
                if (existingItem) {
                    if (existingItem.quantity < item.quantity) {
                        return false; // Quantity to remove exceeds available quantity in cart
                    }
                } else {
                    return false; // Item not found in cart
                }
                return true; // All items have valid quantities
            });
            if (!quantityCheck) {
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest('Quantity to remove exceeds available quantity in cart.', 'Quantity to remove exceeds available quantity in cart.')
                );
            }
            let updateItems = getCart.items.map(item => {
                let inputItem = inputData.items.find(i => i.productId.toString() === item.productId.toString());
                // console.log('inputItem:', inputItem);
                if (inputItem) {
                    item.quantity = item.quantity - inputItem.quantity;
                    item.totalPrice = item.quantity * item.price;
                }
                return item;
                // if()
            });
            const totalAmount = updateItems.reduce((sum, i) => sum + i.totalPrice, 0);
            // console.log('updateItems:',updateItems,totalAmount);
            await Cart.updateOne(
                {
                    _id: inputData.cart_id,
                    createdBy: req.user.id,
                    isDeleted: false,
                    status: 'active',
                    isDeleted: false
                },
                {
                    $set: {
                        items: updateItems, // Filter out items with zero quantity
                        totalAmount: totalAmount, // Update totalAmount dynamically
                        finalAmount: totalAmount // Update finalAmount dynamically
                    },
                }
            );
            // Check if all items have zero quantity
            let updatedCart = await Cart.updateOne(
                {
                    _id: inputData.cart_id,
                    createdBy: req.user.id,
                    isDeleted: false,
                    status: 'active',
                    items: {
                        $elemMatch: {
                            quantity: { $lt: 0 } // Ensure at least one item has quantity > 0
                        }
                    }
                },
                {
                    $set: {
                        status: "abandoned",
                        isDeleted: true,
                    }
                },
                {
                    new: true, // Return the updated document
                }

            );
            return res.status(ResponseCode.OK).json(
                response.setSuccess(updatedCart, 'Cart fetched successfully.')
            );
        }
        catch (error) {
            console.log('Internal server error:', error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error, 'Internal server error')
            )
        }
    },
    /**
     * @filename CartController.js
     * @method getMyCart
     * @router POST /api/tezrati/v1/customer/cart/mycart
     * @params
     * @Auther Abhijit swain
     * @desc This API for prodcut get my cart.
     * @autherization CustomerAuth
     */
    getMyCart: async (req, res) => {
        console.log('Inside CartController getMyCart API');
        const response = new CustomResponse();
        try {
            const userId = req.user.id;
            let cart = await Cart.aggregate([
                {
                    $match: {
                        createdBy: new ObjectId(userId),
                        isDeleted: false,
                        status: 'active',
                    }
                },
                {
                    $project:{
                        _id: 1,
                        totalAmount: 1,
                        finalAmount: 1,
                        discount: 1,
                        status: 1,
                        createdAt: 1,
                        updatedAt: 1,
                        createdBy: 1,
                        updatedBy: 1,
                        items: {
                            $filter: {
                            input: "$items",
                            as: "item",
                            cond: { $gt: ["$$item.quantity", 0] }  // only include items with quantity > 0
                            }
                        }
                    }
                }
            ]);
            // if(!cart){
            //     return res.status(ResponseCode.NOT_FOUND).json(
            //         response.setNotfound('Cart not found.','Cart not found')
            //     );
            // }
            return res.status(ResponseCode.OK).json(
                response.setSuccess(cart, 'Cart fetched successfully.')
            );

        }
        catch (error) {
            console.log('Internal server error:', error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(
                response.setServerError(error, 'Internal server error')
            )
        }
    }

}