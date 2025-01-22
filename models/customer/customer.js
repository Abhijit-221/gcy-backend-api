const mongoose = require('mongoose');
const {Events,Validator, ValidationRules, ValidatinMessage}=require('../../config/constants');
const {Schema} = mongoose;
const CustomerEvents = Events.customer;
const CustomerValidation = ValidationRules.customer;
const CustomerValidationMsg=ValidatinMessage.customer;
const bcrypt = require('bcrypt');

const CustomerSchema = new Schema({
    userName:{
        type:String,
        required:true,
    },
    email: {
        type:String,
        required:true
    },
    phone:{
        type:String,
        // required:true
    },
    password: {
        type:String,
        required:true
    },
    fullName:{
        type:String,
    },
    profilePic:{
        type:String,
    },
    refreshToken:{
        type:String,
    },
    otp:{
        type:String,
    },
    otpExpires:{
        type:Number
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

    CustomerSchema.pre('save', async function(next) {
        if (this.isModified('password')) {
            try {
                // Hash password logic (using bcrypt for example)
                const hashedPassword = await bcrypt.hash(this.password, 10);
                this.password = hashedPassword;
            } catch (error) {
                next(error); // Pass error to next middleware or callback
            }
        }
        next(); // Proceed with saving the document
    });
const Customer = mongoose.model('customer', CustomerSchema);
//Input data validate 
const CustomerDataValidate = (data,event)=>{
    let rules={};
    let msg={};
    switch(event){
        case CustomerEvents.signup:
            rules={
                ...CustomerValidation.signup
            };
            msg={
                ...CustomerValidationMsg.signup
            };
        break;
        case CustomerEvents.login:
            rules={
                ...CustomerValidation.login
            };
            msg={
                ...CustomerValidationMsg.login
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
module.exports={Customer,CustomerDataValidate}