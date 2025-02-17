const { find } = require("lodash");
const { ResponseCode, _, CustomResponse, Events } = require("../../config/constants");
const { Brand } = require("../../models/product/brand");
const { ProductDataValidate, Product } = require("../../models/product/product");
const { ProductGroup } = require("../../models/product/productGroup");
const { Variant } = require("../../models/product/variant");
const ProductEvents = Events.product.products;
const { mongoose } = require("mongoose");
const { Category } = require("../../models/product/category");
const { UnitType } = require("../../models/product/unitType");
const ObjectId = mongoose.Types.ObjectId;
const { unlinkFiles, unlinkExistFiles } = require('../../helpers/unlinkFile');

module.exports = {
    /**
     * @filename ProductController.js
     * @method createProduct
     * @router POST /api/tezrati/v1/product/create
     * @params
     * @Auther Abhijit swain
     * @desc create product.
     * @autherization SellerAuth
     */
    createProduct: async (req, res, next) => {
        console.log('Inside ProductController createProduct API...');
        const response = new CustomResponse();
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            let loginUser = req.seller;
            let inputData = _.pick(req.body, [
                'brandName',
                'productName',
                'category',
                'variant_id',
                'unit_type',
                'quantity',
                'usedFor',
                'processingType',
                'price',
                'maximumShelfLife',
                'foodPreference',
                'dietaryPreference',
                'organic',
                'addedPreservatives',
                'ingredients',
                'nutrientContent',
                'netQuantity',
                'containerType',
                'legalDisclaimer',
                'genericName',
                'countryOrigin',
                'manufacturerDetails',
                'importerDetails',
                'packerDetails',
                'description'
            ]);
            let result = await ProductDataValidate(inputData, ProductEvents.create);
            if (result.hasError) {
                await unlinkFiles(req.files);
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors, 'Invalid inputs.')
                );
            }
            console.log('req.file:', req.files);
            //let validate the brand and if brand not exist then create brand
            /**let check category exist or not */
            let category = await Category.findOne({ _id: new ObjectId(inputData.category), isActive: true, isDeleted: false });
            if (!category) {
                await unlinkFiles(req.files);
                return res.status(ResponseCode.NOT_FOUND).json(
                    response.setNotfound({ errorMsg: 'Category not found check category id.' }, 'Category not found.')
                )
            }
            /**Brand */
            let brand = await Brand.aggregate([
                {
                    $addFields: {
                        normalizedField: {
                            $toLower: {
                                $replaceAll: { input: "$brandName", find: " ", replacement: "" }
                            }
                        }
                    }
                },
                {
                    $match: {
                        normalizedField: inputData.brandName.replace(/\s+/g, "").toLowerCase()
                    }
                }
            ]);

            console.log('brand:', brand);

            /**Brand */
            //check product name exist or not if not exist then create a product group on this product name
            /**Product name */
            let productGroup = await ProductGroup.aggregate([
                {
                    $addFields: {
                        normalizedField: {
                            $toLower: {
                                $replaceAll: { input: '$productName', find: " ", replacement: "" }
                            }
                        }
                    }
                },
                {
                    $match: {
                        normalizedField: inputData.productName.replace(/\s+/g, "").toLowerCase()
                    }
                }
            ]);
            // if(productGroup.length){
            //     await ProductGroup.create()
            //     return res.status(ResponseCode.CONFLICT).json(response.setConflict('','Product already exist.'))
            // }
            /**Product name */

            //let check variation
            let variation = await Variant.findOne({
                _id: new ObjectId(inputData.variant_id),
                isActive: true,
                isDeleted: false
            });
            if (!variation) {
                await unlinkFiles(req.files);
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound({ errorMsg: 'Variant not found. Check variant_id' }, 'Variant not found.'));
            }

            //let check unit type 
            let unitType = await UnitType.findOne({
                _id: new ObjectId(inputData.unit_type), isActive: true, isDeleted: false,
            });
            if (!unitType) {
                await unlinkFiles(req.files);
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound({ errorMsg: 'Unit type not found. check unit_type' }, 'Unit type not found.'));
            }
            //create product with transaction process 
            try {
                let brandData = {};
                if (!brand.length) {
                    const brandDoc = new Brand({
                        brandName: inputData.brandName,
                        createdBy: loginUser.id,
                        updatedBy: loginUser.id,
                    });
                    brandData = await brandDoc.save({ session });
                } else {
                    brandData = brand[0];
                }
                let productGroupData = {};
                if (!productGroup.length) {
                    const productGrp = new ProductGroup({
                        productName: inputData.productName,
                        category: inputData.category,
                        createdBy: loginUser.id,
                        updatedBy: loginUser.id,
                    });
                    productGroupData = await productGrp.save({ session });
                } else {
                    productGroupData = productGroup[0]
                }
                let existProduct = await Product.findOne({
                    brand_id: brandData._id,
                    productGroupId: productGroupData._id,
                    variant_id: inputData.variant_id,
                    isActive: true,
                    isDeleted: false,
                });
                if (existProduct) {
                    // await unlinkFiles(req.files);
                    throw ({ code: 'ProductExist', message: 'Product already exist.' });
                }
                let updatedData = { ...inputData, brand_id: brandData._id, productGroupId: productGroupData._id, createdBy: loginUser.id, updatedBy: loginUser.id };
                if (req.files && req.files.productImage && req.files.productImage.length) {
                    updatedData.productImage = req.files.productImage.map((img, index) => ({
                        path: img.path,
                        filename: img.filename,
                        displayOrder: index + 1
                    }));
                }
                console.log('updatedData:', updatedData);
                const product = new Product(updatedData);
                const productData = await product.save({ session });
                await session.commitTransaction();
                return res.status(ResponseCode.CREATED).json(response.setCreated(productData, 'Product successfully added.'));
            }
            catch (error) {
                console.log('error:', error);
                await unlinkFiles(req.files);
                if (error.code = 'ProductExist') {
                    return res.status(ResponseCode.CONFLICT).json(
                        response.setConflict({ errorMsg: error.message }, error.message)
                    )
                }
                await session.abortTransaction();
                throw error;
            }

        }
        catch (error) {
            console.log('Internal server error:', error);
            await unlinkFiles(req.files);
            // await session.abortTransaction();
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error, 'Internal server error.'));
        }
    },
    /**
     * @filename ProductController.js
     * @method updateProduct
     * @router POST /api/tezrati/v1/product/update
     * @params
     * @Auther Abhijit swain
     * @desc update product.
     * @autherization SellerAuth
     */
    updateProduct: async (req, res) => {
        console.log('Inside ProductController updateProduct API...');
        const response = new CustomResponse();
        try {
            let inputData = _.pick(req.body, [
                'productId',
                'productGroupId',
                'brand_id',
                'variant_id',
                'unit_type',
                'quantity',
                'usedFor',
                'processingType',
                'price',
                'maximumShelfLife',
                'foodPreference',
                'dietaryPreference',
                'organic',
                'addedPreservatives',
                'ingredients',
                'nutrientContent',
                'netQuantity',
                'containerType',
                'legalDisclaimer',
                'genericName',
                'countryOrigin',
                'manufacturerDetails',
                'importerDetails',
                'packerDetails',
                'description'
            ]);
            //let validate input data
            let result = await ProductDataValidate(inputData, ProductEvents.update);
            if (result.hasError) {
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(result.errors, 'Invalid inputs'));
            }
            //let check Product exist or not 
            let product = await Product.findOne({
                _id: new ObjectId(inputData.productId),
                isDeleted: false
            });
            if (!product) {
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound('Product not found'));
            }
            //let check ids 
            let errormessage = [];
            let errorObj=[]
            if (inputData.brand_id) {
                let brand = await Brand.findOne({
                    _id: new ObjectId(inputData.brand_id),
                    isDeleted: false
                });
                if (!brand) {
                    errorObj.push({
                        "brand_id": "Invalid brand id",
                        // "message": "Brand not found."
                    });
                    errormessage.push("Brand not found")
                }
            }
            if (inputData.productGroupId) {
                let productGroup = await ProductGroup.findOne({
                    _id: new ObjectId(inputData.productGroupId),
                    isDeleted: false
                });
                if (!productGroup) {
                    errorObj.push({
                        "productGroupId": "Invalid productGroupId",
                        // "message": "Product name not exist."
                    });
                    errormessage.push("Product name not exist")
                }
                //let check other product
                let checkOtherProduct = await Product.findOne({
                    productGroupId:new ObjectId(inputData.productGroupId),
                    variant_id:new ObjectId(inputData.variant_id||product.variant_id),
                    isDeleted:false,
                    _id:{$ne:new ObjectId(inputData.productId)}
                });
                if (checkOtherProduct) {
                    errorObj.push({
                        "productGroupId": "Invalid productGroupId",
                        // "message": "Product name not exist."
                    });
                    errormessage.push("Product name already exist")
                }
            }
            if (inputData.variant_id) {
                let variant = await Variant.findOne({
                    _id: new ObjectId(inputData.variant_id),
                    isDeleted: false
                });
                if (!variant) {
                    errorObj.push({
                        "variant_id": "Invalid variant id",
                        // "message": "Variant not found."
                    });
                    errormessage.push("Variant not found");
                }
                //let check other product
                let checkOtherProduct = await Product.findOne({
                    productGroupId:new ObjectId(inputData.productGroupId||product.productGroupId),
                    variant_id:new ObjectId(inputData.variant_id),
                    isDeleted:false,
                    _id:{$ne:new ObjectId(inputData.productId)}
                });
                if (checkOtherProduct) {
                    errorObj.push({
                        "variant_id": "Invalid variant_id",
                        // "message": "Product name not exist."
                    });
                    errormessage.push("Product variation already exist")
                }
            }
            if (inputData.unit_type) {
                let unit = await UnitType.findOne({
                    _id: new ObjectId(inputData.unit_type),
                    isDeleted: false
                });
                if (!unit) {
                    errorObj.push({
                        "unit_type": "Invalid unit type",
                        // "message": "Unit type not found."
                    });
                    errormessage.push( "Unit type not found");
                }
            }
            if(errormessage.length){
                
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound(errorObj,errormessage.join(',').concat('.')))
            }
            //let check if the other product on this productId or variation
            // let checkOtherProduct = await Product.findOne({
            //     where:{
            //         isDeleted:false,
            //         $or:[
            //             {productGroupId:inputData.productGroupId},
            //             {$and:[
            //                 {productGroupId:inputData}
            //             ]}
            //         ]
            //     }
            // })
            let updateData = {
                ...inputData,
                updatedBy: req.seller.id,
                updatedAt: Date.now()
            };
            //let update Product
            let updateProduct = await Product.updateOne({
                _id: new ObjectId(inputData.productId),
                isDeleted: false
            }, updateData);
            let updatedProduct = await Product.findOne({
                _id: new ObjectId(inputData.productId),
                isDeleted: false
            });

            return res.status(ResponseCode.OK).json(response.setSuccess(updatedProduct, 'Product updated.'));

        }
        catch (error) {
            console.log('Internal server error:', error);
            await unlinkFiles(req.files);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error, 'Internal server error.'));
        }
    },
    /**
     * @filename ProductController.js
     * @method updateProductImage
     * @router POST /api/tezrati/v1/product/update
     * @params
     * @Auther Abhijit swain
     * @desc update product image.
     * @autherization SellerAuth
     */
    updateProductImage: async (req, res) => {
        console.log('Inside ProductController updateProductImage API...');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['product_id','remove_ids']);
            console.log('inputData:',inputData);
            let result = await ProductDataValidate(inputData,ProductEvents.update_image);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(result.errors,'Invalid inputs'));
            }
            let product = await Product.findOne({
                _id:new ObjectId(inputData.product_id),
                isDeleted:false
            });
            if(!product){
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound('Product not found.check product_id','Product not found.'));
            }
            if(inputData.remove_ids && inputData.remove_ids.length){
                // console.log(product.productImage.length);
                for(img of inputData.remove_ids){
                    // let index = product.productImage.findIndex((item) => item._id == img._id);
                    let updateData = await Product.updateOne({_id:new ObjectId(inputData.product_id),isDeleted:false},{
                        $pull: { productImage: { _id: new ObjectId(img._id) } } 
                    })
                }
            }
            let currentIndex=product.productImage && product.productImage.length?product.productImage[product.productImage.length-1].displayOrder:0;
            console.log('currentzindex:',currentIndex);
            let updateData = {};
            if (req.files && req.files.productImage && req.files.productImage.length) {
                updateData.productImage = req.files.productImage.map((img, index) => {
                    currentIndex=currentIndex + 1
                    return {
                        path: img.path,
                        filename: img.filename,
                        displayOrder: currentIndex
                    }
                });
            }
            return res.status(ResponseCode.OK).json(response.setSuccess({},'Image uploaded successfuly.'))
            
        }
        catch(error){
            console.log('Internal server error:', error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,INTERNAL_SERVERERROR));
        }
    }
}