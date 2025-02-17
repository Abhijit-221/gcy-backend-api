const mongoose = require('mongoose');
const {Events,Validator, ValidationRules, ValidatinMessage}=require('../../config/constants');
const {Schema} = mongoose;
const ProductEvents = Events.product.products;
const ProductRules = ValidationRules.product.products;
const ObjectId = mongoose.Types.ObjectId;

const productImage = new Schema({
    path:{type:String,trim:true},
    filename:{type:String,trim:true},
    displayOrder:{type:Number,trim:true},
})

const ProductSchema = new Schema({
    brand_id:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'brand',
        required:true,
        trim:true
    },
    productGroupId:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'productGroup',
        required:true,
        trim:true
    },
    variant_id:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'variant',
        required:false,
        trim:true
    },
    unit_type:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'unitType',
        required:false,
        trim:true
    },
    productImage:{
        type:[productImage],
        required:false
    },
    quantity:{
        type:Number,
        required:true,
        trim:true
    },
    usedFor:{
        type:String,
        required:false,
        trim:true
    },
    processingType:{
        type:String,
        required:false,
        trim:true
    },
    price:{
        type:Number,
        required:true,
        trim:true
    },
    maximumShelfLife:{
        type:String,
        required:false,
        trim:true
    },
    foodPreference:{
        type:String,
        required:false,
        trim:true
    },
    dietaryPreference:{
        type:String,
        required:false,
        trim:true
    },
    organic:{//yes/no
        type:String,
        required:false,
        trim:true
    },
    addedPreservatives:{
        type:String,
        required:false,
        trim:true
    },
    ingredients:{
        type:String,
        required:false,
        trim:true
    },
    nutrientContent:{
        type:String,
        required:false,
        trim:true
    },
    netQuantity:{
        type:Number,
        required:false,
        trim:true
    },
    containerType:{
        type:String,
        required:true,
        trim:true
    },
    legalDisclaimer:{
        type:String,
        required:false,
        trim:true
    },
    genericName:{
        type:String,
        required:false,
        trim:true
    },
    countryOrigin:{
        type:String,
        required:false,
        trim:true
    },
    manufacturerDetails:{
        type:String,
        required:false,
        trim:true
    },
    importerDetails:{
        type:String,
        required:false,
        trim:true
    },
    packerDetails:{
        type:String,
        required:false,
        trim:true
    },
    description:{
        type:String,
        required:false,
        trim:true
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    createdBy:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'seller',
        required:true,
    },
    updatedBy:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:'seller',
        required:false,
    },
    createdAt:{
        type:Number,
        default:Date.now(),
    },
    updatedAt:{
        type:Number,
        default:Date.now()
    }

    });

const Product = mongoose.model('product', ProductSchema);
//Input data validate 
const ProductDataValidate = (data,event)=>{
    console.log(data,event);
    
    let rules={};
    let msg={};
    switch(event){
        case ProductEvents.create:
            rules={
                ...ProductRules.create,
            };
            // msg={
            //     ...ProductEvents.addCategory
            // };
        break;
        case ProductEvents.update:
            rules={
                ...ProductRules.update
            }
        break;
        case ProductEvents.update_image:
            rules={
                ...ProductRules.update_image
            }
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
module.exports={Product,ProductDataValidate};