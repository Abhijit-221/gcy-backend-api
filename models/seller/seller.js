const mongoose = require('mongoose');
const {Events,Validator, ValidationRules, ValidatinMessage}=require('../../config/constants');
const {Schema} = mongoose;
const SellerEvents = Events.seller;
const SellerValidation = ValidationRules.seller;
const SellerValidationMsg=ValidatinMessage.seller;
const bcrypt = require('bcrypt');
const ObjectId = mongoose.Types.ObjectId;


const SellerSchema = new Schema({
    userName:{
        type:String,
        required:true,
        trim:true
    },
    email: {
        type:String,
        required:true,
        trim:true
    },
    country_code:{
        type:String,
        trim:true,
        default:"+91"
    },
    phone:{
        type:String,
        trim:true
        // required:true
    },
    password: {
        type:String,
        required:true,
        trim:true
    },
    fullName:{
        type:String,
        trim:true
    },
    profilePic:{
        type:{
            path:{type:String,trim:true},
            filename:{type:String,trim:true},
        },
        required:false
    },
    businessName:{
        type:String,
        trim:true
    },
    businessType: { 
        type: String,
        allowNull: false ,
        trim:true
    },
    registrationNumber: { 
        type: String,
        allowNull: false,
        trim:true
    },
    taxId: {
        type: String,
        allowNull: false,
        trim:true
     },
    businessAddress: {
        type: String,
        allowNull: false,
        trim:true
     },
    city: {
        type: String,
        allowNull: false,
        trim:true
     },
    state: {
        type: String,
        allowNull: false,
        trim:true
     },
    postalCode: {
        type: String,
        allowNull: false,
        trim:true
     },
    country: {
        type: String,
        allowNull: false,
        trim:true
     },
    bankAccountName: {
        type: String,
        allowNull: false,
        trim:true
     },
    bankAccountNumber: {
        type: String,
        allowNull: false,
        trim:true
     },
    bankName: {
        type: String,
        allowNull: false,
        trim:true
     },
    swiftCode: {
        type: String,
        allowNull: false,
        trim:true
     },
    storeName: {
        type: String,
        allowNull: false,
        trim:true
     },
    storeDescription: {
        type: String,
        allowNull: false,
        trim:true
     },
    storeCategory: {
        type: String,
        allowNull: false,
        trim:true
     },
    agreementAccepted: {
        type: String,
        allowNull: false,
        trim:true
     },
    govId: {
        type: String,
        allowNull: false,
        trim:true
     },
    proofOfAddress: {
        type:{
            path:{type:String,trim:true},
            filename:{type:String,trim:true},
        },
        required:false
     },
    GSTIN:{
        type: String,
        allowNull: false,
        trim:true
    },
    refreshToken:{
        type:String,
        trim:true
    },
    otp:{
        type:String,
        trim:true
    },
    otpExpires:{
        type:Number,
        trim:true
    },
    isApproved:{
        type:Boolean,
        default:false
    },
    approvedBy:{
        type:String,
        trim:true,
    },
    isActive:{
        type:Boolean,
        default:true
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    createdAt:{
        type:Number,
        default:Date.now()
    },
    updatedAt:{
        type:Number,
        default:Date.now()
    }

    });

    SellerSchema.pre('save', async function(next) {
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
const Seller = mongoose.model('seller', SellerSchema);
//Input data validate 
const SellerDataValidate = (data,event)=>{
    let rules={};
    let msg={};
    switch(event){
        case SellerEvents.signup:
            rules={
                ...SellerValidation.signup
            };
            msg={
                ...SellerValidationMsg.signup
            };
        break;
        case SellerEvents.login:
            rules={
                ...SellerValidation.login
            };
            msg={
                ...SellerValidationMsg.login
            };
        break;
        case SellerEvents.profile_update:
            rules={
                ...SellerValidation.profile_update
            };
            msg={
                ...SellerValidationMsg.profile_update
            };
            break;
        default:
    }
    const validation = new Validator(data,rules,msg);
    let results={};
    if(validation.passes()){
        if (event===SellerEvents.profile_update && !ObjectId.isValid(data.seller_id)) {
            results['hasError']=true;
            results.errors="Invalid seller_id";
            return results;
        }
        return results['hasError']=false;
    }
    if(validation.fails()){
        results['hasError']=true;
        results.errors=validation.errors;
        return results;
    }
    
}
module.exports={Seller,SellerDataValidate}