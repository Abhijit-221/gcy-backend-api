const mongoose = require('mongoose');
const {Events,Validator, ValidationRules, ValidatinMessage}=require('../../config/constants');
const {Schema} = mongoose;
const VariantEvents = Events.product.variant;
const VariantValidation = ValidationRules.product.variant;
// const CategoryValidationMsg=ValidatinMessage.category;
// const ObjectId = mongoose.Types.ObjectId;


const VariantSchema = new Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    sortName:{
        type:String,
        required:true,
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

const Variant = mongoose.model('variant', VariantSchema);
//Input data validate 
const VariantDataValidate = (data,event)=>{
    let rules={};
    let msg={};
    switch(event){
        case VariantEvents.create:
            rules={
                ...VariantValidation.create
            };   
        break;
        case VariantEvents.update:
            rules={
                ...VariantValidation.update
            };
        break;
        case VariantEvents.delete:
            rules={
                ...VariantValidation.delete
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
module.exports={Variant,VariantDataValidate};