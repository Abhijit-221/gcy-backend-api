const mongoose = require('mongoose');
const {Events,Validator, ValidationRules, ValidatinMessage}=require('../../config/constants');
const {Schema} = mongoose;
const ProductGroupEvents=Events.product.productGroup;
const ProductGroupValidator = ValidationRules.product.productGroup;
const ObjectId = mongoose.Types.ObjectId;

const productImage = new Schema({
    path:{type:String,trim:true},
    filename:{type:String,trim:true},
    displayOrder:{type:Number,trim:true},
})

const ProductGroupSchema = new Schema({
    productName:{
        type:String,
        required:true,
        trim:true
    },
    category: {//subcategory
        type:mongoose.SchemaTypes.ObjectId,
        ref:'category',
        // required:true,
        trim:true
    },
    productImage:{
        type:[productImage],
        required:false
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

const ProductGroup = mongoose.model('productGroup', ProductGroupSchema);
//Input data validate 
const ProductGroupDataValidate = (data,event)=>{
    let rules={};
    let msg={};
    switch(event){
        case ProductGroupEvents.update:
            rules={
                ...ProductGroupValidator.update
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
module.exports={ProductGroup,ProductGroupDataValidate};