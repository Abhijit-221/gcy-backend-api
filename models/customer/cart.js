const mongoose = require('mongoose');
const {Events,ValidationRules,ValidatinMessage,Validator}=require('../../config/constants');
const CartEvents = Events.customer.cart;
const CartValidationRules = ValidationRules.customer.cart;
const CartSchema = new mongoose.Schema({
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'products', required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            },
            totalPrice: {
                type: Number,
                required: true
            }
        }
    ],
    totalAmount: {
        type: Number, required: true,
        default: 0
    },
    discount: {
        type: Number, default: 0
    },
    finalAmount: {
        type: Number, required: true,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'ordered', 'abandoned'],
        default: 'active'
    },
    createdBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'customers',
        required: true,
    },
    updatedBy: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'customers',
        required: false,
    },
    createdAt: {
        type: Number,
        default: Date.now(),
    },
    updatedAt: {
        type: Number,
        default: Date.now()
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
});

const Cart = mongoose.model('cart', CartSchema);

//Input data validate 
const CartDataValidate = (data,event)=>{
    let rules={};
    let msg={};
    switch(event){
        case CartEvents.add:
            rules={
                ...CartValidationRules.add
            };
        break;
        case CartEvents.remove:
            rules={
                ...CartValidationRules.remove
            };
        break;
        default:
    }
    const validation = new Validator(data,rules,msg);
    let results={};
    if(validation.passes()){
        return results['hasError']=false;
    }
    if(validation.fails()){
        results['hasError']=true;
        results.errors=validation.errors;
        return results;
    }
}
module.exports = { Cart,CartDataValidate};
