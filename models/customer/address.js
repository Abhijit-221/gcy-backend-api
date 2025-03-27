const { Schema, SchemaType, default: mongoose, mongo } = require("mongoose");
const { Events,Validator,ValidationRules } = require("../../config/constants");
const AddressEvents = Events.customer.address;
const AddressRules = ValidationRules.customer.address;
const AddressSchema = new Schema({
    user_id:{
        type: mongoose.SchemaTypes.ObjectId,
        ref:'customers',
        trim:true,
        required:true,
    },
    name:{
        type:String,
        trim:true,
        required:true,
    },
    phNo:{
        type:String,
        trim:true,
        required:true,
    },
    altPhNo:{
        type:String,
        trim:true,
    },
    landmark1:{
        type:String,
        trim:true,
        required:true,
    },
    landmark2:{
        type:String,
        trim:true,
        // required:true,
    },
    houseNo:{
        type:String,
        trim:true,
        required:true,
    },
    city:{
        type:String,
        trim:true,
        required:true,
    },
    pin:{
        type: Number,
        trim:true,
        required:true,
        // min: [6, 'Must be at least 6, got {VALUE}'],
        // max: [8, 'Must be at least 6, got {VALUE}'],
    },
    receiveTime:{
        type: String,
        enum: ['work', 'home'],
        required: true
    },
    createdBy:{
        type: mongoose.SchemaTypes.ObjectId,
        ref:'customers',
        trim:true,
        required:true,
    },
    updatedBy:{
        type: mongoose.SchemaTypes.ObjectId,
        ref:'customers',
        trim:true,
    },
    createdAt:{
        type:Number,
        default:Date.now(),
    },
    updatedAt:{
        type:Number,
        default:Date.now()
    },
    isPrimary:{
        type:Boolean,
        default:false
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
    
});

const CustomerAddress = mongoose.model('customerAddress',AddressSchema);
// //Input data validate 
const AddressDataValidate = (data,event)=>{
    let rules={};
    let msg={};
    switch(event){
        case AddressEvents.add:
            rules={
                ...AddressRules.create
            };
           
        break;
        case AddressEvents.update:
            rules={
                ...AddressRules.update
            };
           
        break;
        case AddressEvents.remove:
            rules={
                ...AddressRules.delete
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
module.exports={CustomerAddress,AddressDataValidate};