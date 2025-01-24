const mongoose = require('mongoose');
const {Events,Validator, ValidationRules, ValidatinMessage}=require('../../config/constants');
const {Schema} = mongoose;
const UnitTypeEvents = Events.product.unitType;
const UnitTypeValidation = ValidationRules.product.unitType;
// const CategoryValidationMsg=ValidatinMessage.category;
// const ObjectId = mongoose.Types.ObjectId;


const UnitTypeSchema = new Schema({
    unit_type:{
        type:String,
        required:true,
        trim:true
    },
    unit_count:{
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

const UnitType = mongoose.model('unitType', UnitTypeSchema);
//Input data validate 
const UnitTypeDataValidate = (data,event)=>{
    let rules={};
    let msg={};
    switch(event){
        case UnitTypeEvents.create:
            rules={
                ...UnitTypeValidation.create
            };   
        break;
        case UnitTypeEvents.update:
            rules={
                ...UnitTypeValidation.update
            };
        break;
        case UnitTypeEvents.delete:
            rules={
                ...UnitTypeValidation.delete
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
module.exports={UnitType,UnitTypeDataValidate};