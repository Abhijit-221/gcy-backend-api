const { find } = require("lodash");
const { ResponseCode,_,CustomResponse, Events } = require("../../config/constants");
const { Brand } = require("../../models/product/brand");
const { ProductDataValidate, Product } = require("../../models/product/product");
const { ProductGroup } = require("../../models/product/productGroup");
const { Variant } = require("../../models/product/variant");
const ProductEvents = Events.product.products;
const { mongoose } = require("mongoose");
const { Category } = require("../../models/product/category");
const { UnitType } = require("../../models/product/unitType");
const ObjectId = mongoose.Types.ObjectId;
const {unlinkFiles,unlinkExistFiles} = require('../../helpers/unlinkFile');

module.exports={
    /**
     * @filename ProductController.js
     * @method createProduct
     * @router POST /api/tezrati/v1/product/create
     * @params
     * @Auther Abhijit swain
     * @desc create product.
     * @autherization SellerAuth
     */
    createProduct:async (req,res,next)=>{
        console.log('Inside ProductController createProduct API...');
        const response = new CustomResponse();
        const session = await mongoose.startSession();
        session.startTransaction();
        try{
            let loginUser = req.seller;
            let inputData = _.pick(req.body,[
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
            let result = await ProductDataValidate(inputData,ProductEvents.create);
            if(result.hasError){
                await unlinkFiles(req.files);
                return res.status(ResponseCode.BAD_REQUEST).json(
                    response.setBadrequest(result.errors,'Invalid inputs.')
                );
            }
            console.log('req.file:',req.files);
            //let validate the brand and if brand not exist then create brand
            /**let check category exist or not */
            let category = await Category.findOne({_id:new ObjectId(inputData.category),isActive:true,isDeleted:false});
            if(!category){
                await unlinkFiles(req.files);
                return res.status(ResponseCode.NOT_FOUND).json(
                    response.setNotfound({errorMsg:'Category not found check category id.'},'Category not found.')
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
           
            console.log('brand:',brand);

            /**Brand */
            //check product name exist or not if not exist then create a product group on this product name
            /**Product name */
            let productGroup = await ProductGroup.aggregate([
                {$addFields:{
                    normalizedField:{
                        $toLower:{
                            $replaceAll:{ input:'$productName',find:" ",replacement:""}
                        }
                    }
                }},
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
                _id:new ObjectId(inputData.variant_id),
                isActive:true,
                isDeleted:false
            });
            if(!variation){
                await unlinkFiles(req.files);
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound({errorMsg:'Variant not found. Check variant_id'},'Variant not found.'));
            }

            //let check unit type 
            let unitType = await UnitType.findOne({
                _id:new ObjectId(inputData.unit_type),isActive:true,isDeleted:false,
            }) ;
            if(!unitType){
                await unlinkFiles(req.files);
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound({errorMsg:'Unit type not found. check unit_type'},'Unit type not found.'));
            }
            //create product with transaction process 
            try{
                let brandData ={};
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
                if(!productGroup.length){
                    const productGrp = new ProductGroup({
                        productName: inputData.productName,
                        category: inputData.category,
                        createdBy: loginUser.id,
                        updatedBy: loginUser.id,
                    });
                    productGroupData = await productGrp.save({ session });
                }else{
                    productGroupData = productGroup[0]
                }
                let existProduct = await Product.findOne({
                    brand_id:brandData._id,
                    productGroupId:productGroupData._id,
                    variant_id:inputData.variant_id,
                    isActive:true,
                    isDeleted:false,
                });
                if(existProduct){
                    // await unlinkFiles(req.files);
                    throw ({code:'ProductExist',message:'Product already exist.'});
                }
                let updatedData = {...inputData,brand_id:brandData._id,productGroupId:productGroupData._id,createdBy:loginUser.id,updatedBy:loginUser.id};
                if(req.files && req.files.productImage && req.files.productImage.length){
                    updatedData.productImage = req.files.productImage.map((img,index)=>({
                        path:img.path,
                        filename:img.filename,
                        displayOrder:index+1
                    }));
                }
                console.log('updatedData:',updatedData);
                const product = new Product(updatedData);
                const productData = await product.save({ session });
                await session.commitTransaction();
                return res.status(ResponseCode.CREATED).json(response.setCreated(productData,'Product successfully added.'));
            }
            catch(error){
                console.log('error:',error);
                await unlinkFiles(req.files);
                if(error.code = 'ProductExist'){
                    return res.status(ResponseCode.CONFLICT).json(
                        response.setConflict({errorMsg:error.message},error.message)
                    )
                }
                await session.abortTransaction();
                throw error;
            }

        }
        catch(error){
            console.log('Internal server error:',error);
            await unlinkFiles(req.files);
            // await session.abortTransaction();
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,'Internal server error.'));
        }
    }
}