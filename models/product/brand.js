const mongoose = require('mongoose');
const {Events,Validator, ValidationRules, ValidatinMessage}=require('../../config/constants');
const {Schema} = mongoose;
const BrandEvents = Events.brand;
const BrandRules = ValidationRules.Brand;

const BrandSchema = new Schema({
    brandName:{
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

const Brand = mongoose.model('brand', BrandSchema);
// //Input data validate 
const BrandDataValidate = (data,event)=>{
    let rules={};
    let msg={};
    switch(event){
        case BrandEvents.update:
            rules={
                ...BrandRules.update
            };
           
        break;
        default:
    }
    const validation = new Validator(data,rules,msg);
    let results={};
    if(validation.passes()){
        // if (event===CategoryEvents.addCategory && !ObjectId.isValid(data.parentId)) {
        //     results['hasError']=true;
        //     results.errors="Invalid seller_id";
        //     return results;
        // }
        return results['hasError']=false;
    }
    if(validation.fails()){
        results['hasError']=true;
        results.errors=validation.errors;
        return results;
    }
    
}
module.exports={Brand,BrandDataValidate};