const ResponseCode = {
    OK: 200,
    CREATED: 201,
    NOT_FOUND: 404,
    INTERNAL_SERVERERROR:500,
    BAD_REQUEST:400,
    CONFLICT:409,
    UNAUTHORIZED:401,
    FORBIDDEN:403
};
const Events={
    customer:{
        signup:'signup',
        login:'login',
    },
    seller:{
        signup:'seller_signup',
        login:'seller_login',
        profile_update:'profile_update'
    },
    category:{
        addCategory:'add_category',
        updateCategory:'update_category',
        deleteCategory:'delete_category',
    },
    brand:{
        update:'update_brand',
        delete:'delete_brand',
    },
    product:{
        productGroup:{
            update:'update_product_group',
        },
        variant:{
            create:'create_variant',
            update:'update_variant',
            delete:'delete_variant',
        },
        unitType:{
            create:'create_unit_type',
            update:'update_unit_type',
            delete:'delete_unit_type',
        },
        products:{
            create:'create_product',
            update:'update_product',
            delete:'delete_product',
            update_image:'update_image'
        },
        productForCustomer:'product_for_customer'
    }
};
const ValidationRules={
    customer:{
        signup:{
            email:'required|email',
            password:'required|alpha_num|min:8',
            userName:'required|string',
        },
        login:{
            email:'required|email',
            password:'required|alpha_num|min:8',
        }
    },
    seller:{
        signup:{
            userName:'required|string',
            email:'required|email',
            password:'required|alpha_num|min:8',
        },
        login:{
            email_username:'required|email',
            password:'required|alpha_num|min:8',
        },
        profile_update:{
            seller_id:'required|string',
            phone:['regex:/^[0-9]{10,15}$/'],
            fullName:'string',
            // profilePic:'',
            businessName:'string',
            businessType:'string',
            registrationNumber:'string',
            taxId:'string',
            businessAddress:'string',
            city:'string',
            state:'string',
            postalCode:'string|min:5',
            country:'string',
            bankAccountName:'string',
            bankAccountNumber:'string',
            bankName:'string',
            swiftCode:'string',
            storeName:'string',
            storeDescription:'string',
            storeCategory:'string',
            agreementAccepted:'string',
            govId:'string',
            // proofOfAddress:'required|string',
            GSTIN:['regex:/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/']
        }
    },
    category:{
        addCategory:{
            categoryName:'required|string',
            catImage:'required|string',
            parentId:'string',
            level:'integer'
        },
        updateCategory:{
            catId:'required|string',
            categoryName:'string',
            catImage:'string',
            isActive:'boolean'
            // parentId:'string',
            // level:'integer'
        },
        deleteCategory:{
            catId:'required|string',
        }
    },
    Brand:{
        update:{
            brand_id:'required|string',
            brandName:'string',
            isActive:'boolean'
        },
    },
    product:{
        productGroup:{
            update:{
                product_id:'required|string',
                productName:'string',
                category:'string',
                isActive:'boolean'
            }
        },
        variant:{
            create:{
                name:'required|string',
                // sortName:'required|string',
            },
            update:{
                variantId:'required|string',
                name:'string',
                sortName:'string',
            },
            delete:{
                variantId:'required|string',
            }
        },
        unitType:{
            create:{
                unit_type:'required|string',
                unit_count:'required|integer',
            },
            update:{
                unitId:'required|string',
                unit_type:'string',
                unit_count:'integer'
            },
            delete:{
                unitId:'required|string',
            }
        },
        products:{
            create:{
                brandName:'required|string',
                productName:'required|string',
                category:'required|string',
                variant_id:'required|string',
                unit_type:'required|string',
                quantity:'required|integer',
                usedFor:'required|string',
                processingType:'string',
                price:'required|numeric',
                maximumShelfLife:'required|string',
                foodPreference:'required|string',
                dietaryPreference:'string',
                organic:'required|string',
                containerType:'required|string',
                addedPreservatives:'string',
                ingredients:'string',
                nutrientContent:'string',
                netQuantity:'required|integer',
                legalDisclaimer:'required|string',
                genericName: 'string',
                countryOrigin:'required|string',
                manufacturerDetails:'string',
                importerDetails:'string',
                packerDetails:'string',
                description:'string',
            },
            update:{
                productId:'required|string',
                productGroupId:'string',
                brand_id:'string',
                variant_id:'string',
                unit_type:'string',
                quantity:'integer',
                usedFor:'string',
                processingType:'string',
                price:'numeric',
                maximumShelfLife:'string',
                foodPreference:'string',
                dietaryPreference:'string',
                organic:'string',
                containerType:'string',
                addedPreservatives:'string',
                ingredients:'string',
                nutrientContent:'string',
                netQuantity:'integer',
                legalDisclaimer:'string',
                genericName: 'string',
                countryOrigin:'string',
                manufacturerDetails:'string',
                importerDetails:'string',
                packerDetails:'string',
                description:'string',
            },
            update_image:{
                product_id:'required|string',
                remove_ids:'array',
            },
            productForCustomer:{
                // 'filter.price':'numeric',
                'filter.brand_id':'string',
                'filter.variant_id':'string',
                'filter.range.start':'numeric',
                'filter.range.end':'numeric',
            }
        }
    }
};
const ValidatinMessage={
    customer:{
        signup:{
            "required.email": "Without an email we can't reach you!",
            "required.password": "Without an password we can't reach you!",
            "required.userName": "Without an userName we can't reach you!"
        }
    },
    seller:{
        signup:{
            "required.email": "Without an email we can't reach you!",
            "required.password": "Without an password we can't reach you!",
            "required.userName": "Without an userName we can't reach you!"
        },
        login:{
            "required.email_username": "Without an email/user name we can't reach you!",
            "required.password": "Without an password we can't reach you!",
        },
        profile_update:{
            "regex.phone":"Phone number must be less than 15 digit",
            //29ABCDE1234F2Z5
            "regex.phone":[
                "The first 2 digits represent the state code (numeric, 01 to 35 for Indian states)",
                "The next 5 characters are the first five letters of the PAN (Permanent Account Number).",
                "The next 4 digits are the serial number of the PAN.",
                "The 13th character is an alphabetic check code.",
                "The 14th character is an alphanumeric character.",
                "The 15th character is always the letter 'Z'.",
                "The last character is a checksum, which can be alphanumeric."
            ]
        }
    },
    category:{
        addCategory:{
            "required.categoryName": "Category name is required",
            "required.parentId":"Parent id is required",
            "required.level":"Level is required",
        },
        updateCategory:{
            "required.catId": "Category id is required",
        }
    },
    product:{
        variant:{},
        addProduct:{

        }

    }
};
const _= require('lodash');
const Validator = require('validatorjs');

class CustomResponse {
    constructor() {
        this.response = {
            status: 200,     // Default HTTP status
            isError: false,  // Indicates if there's an error
            error: {},       // Error details if any
            data: {},        // Response payload
            message: "",     // Optional message
        };
    }

    setSuccess(data,message){
        this.response.status=ResponseCode.OK;
        this.response.data=data;
        this.response.message=message;
        return this.response;
    }
    setCreated(data,message){
        this.response.status=ResponseCode.CREATED;
        this.response.data=data;
        this.response.message=message;
        return this.response;
    }
    setBadrequest(error,message){
        this.response.status=ResponseCode.BAD_REQUEST;
        this.response.isError=true;
        this.response.error=error;
        this.response.message=message;
        return this.response;
    }
    setNotfound(error,message){
        this.response.status=ResponseCode.NOT_FOUND;
        this.response.isError=true;
        this.response.error=error;
        this.response.message=message;
        return this.response;
    }
    setServerError(error,message){
        this.response.status=ResponseCode.INTERNAL_SERVERERROR;
        this.response.isError=true;
        this.response.error=error;
        this.response.message=message;
        return this.response;
    }
    setConflict(error,message){
        this.response.status=ResponseCode.CONFLICT;
        this.response.isError=true;
        this.response.error=error;
        this.response.message=message;
        return this.response;
    }
    setUnauthorized(error,message){
        this.response.status=ResponseCode.UNAUTHORIZED;
        this.response.isError=true;
        this.response.error=error;
        this.response.message=message;
        return this.response;
    }
    setForbidden(error,message){
        this.response.status=ResponseCode.FORBIDDEN;
        this.response.isError=true;
        this.response.error=error;
        this.response.message=message;
        return this.response;
    }
    
    
    /**
     * Set the HTTP status code
     * @param {number} statusCode - HTTP status code
     * @returns {ApiResponse}
     */
    setStatus(statusCode) {
        this.response.status = statusCode;
        return this;
    }

    /**
     * Mark the response as an error and provide error details
     * @param {Object} error - Error details or message
     * @returns {ApiResponse}
     */
    setError(error) {
        this.response.isError = true;
        this.response.error = error;
        return this;
    }

    /**
     * Set the response data
     * @param {Object} data - Response data payload
     * @returns {ApiResponse}
     */
    setData(data) {
        this.response.data = data;
        return this;
    }

    /**
     * Set a message for the response
     * @param {string} message - A descriptive message
     * @returns {ApiResponse}
     */
    setMessage(message) {
        this.response.message = message;
        return this;
    }

    /**
     * Get the formatted response object
     * @returns {Object} - Final response object
     */
    toObject() {
        return this.response;
    }
};
const AccessTokenExpiry="1d";
const RefreshTokenExpiry="10d";
const pagination={
    page:1,
    limit:10,
}

module.exports={
    ResponseCode,
    Events,
    ValidationRules,
    ValidatinMessage,
    _,
    Validator,
    CustomResponse,
    AccessTokenExpiry,
    RefreshTokenExpiry,
    pagination
};