const { response } = require("express");
const { ResponseCode,_, CustomResponse, Events } = require("../../config/constants");
const { unlinkFiles, unlinkExistFiles } = require("../../helpers/unlinkFile");
const { CategoryDataValidate, Category } = require("../../models/product/category");
const CategoryEvents = Events.category;
const { mongoose } = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
module.exports = {
    /**
     * @filename CategoryController.js
     * @method addCategory
     * @router POST /api/tezrati/v1/category/create
     * @params
     * @Auther Abhijit swain
     * @autherization
     */
    addCategory: async (req, res) => {
        console.log('Inside CategoryController addCategory API...');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['categoryName','parentId','level']);
            inputData.catImage = req.files.catImage? req.files.catImage[0].path:'';
            let result = await CategoryDataValidate(inputData,CategoryEvents.addCategory);
            if(result.hasError){
                await unlinkFiles(req.files);
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(result.errors,"Invalid inputs."));
            }
            let prepairData = {};
            if(inputData.parentId){
                let checkParentCategory = await Category.findOne({
                    _id:new ObjectId(inputData.parentId),
                    isDeleted:false,
                });
                if(!checkParentCategory){
                    await unlinkFiles(req.files);
                    return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound(
                        {errorMsg:"Parent category not found.",},"Parent category not found."
                    ));
                }
                //let check if there is exist subcategory for this parent category
                let checkCategoryExist = await Category.findOne({
                    categoryName:inputData.categoryName,
                    isDeleted:false,
                    parentId:new ObjectId(inputData.parentId),
                });
                if(checkCategoryExist){
                    await unlinkFiles(req.files);
                    return res.status(ResponseCode.CONFLICT).json(response.setConflict(
                        {errorMsg:"Category already exist.",},"Category already exist."
                    ))
                }
                prepairData.categoryName = inputData.categoryName;
                prepairData.parentId = inputData.parentId;
                prepairData.level = checkParentCategory.level+1;
            }
            else{
                //let check category is exist or not 
                let checkCategory = await Category.findOne({
                        categoryName:inputData.categoryName,
                        isDeleted:false,
                        level:0
                });
                if(checkCategory){
                    await unlinkFiles(req.files);
                    return res.status(ResponseCode.CONFLICT).json(response.setConflict({errorMsg:"This category already exists."},"This category already exist."))
                }
                prepairData = {
                    categoryName:inputData.categoryName,
                    level:0,
                    createdBy:req.seller.id,
                }
            }
            prepairData.catImage = {path:req.files.catImage[0].path,filename:req.files.catImage[0].filename};
            prepairData.createdBy = req.seller.id;
            let categoryCreate = await Category.create(prepairData);
            return res.status(ResponseCode.CREATED).json(response.setCreated(categoryCreate,"Category added successfully."));


        }
        catch(error){
            await unlinkFiles(req.files);
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,"Internal server error."));
            
        }
    },
    /**
     * @filename CategoryController.js
     * @method addCategory
     * @router POST /api/tezrati/v1/category/update
     * @params
     * @Auther Abhijit swain
     * @autherization
     */
    updateCategory:async (req,res)=>{
        console.log('Inside CategoryController updateCategory API...');
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['catId','categoryName','isActive']);
            let result = await CategoryDataValidate(inputData,CategoryEvents.updateCategory);
            if(result.hasError){
                await unlinkFiles(req.files);
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(result.errors,"Invalid inputs."));
            }
            //let check category exist or not 
            let checkCategory = await Category.findOne({
                _id:new ObjectId(inputData.catId),
                isDeleted:false
            });
            if(!checkCategory){
                await unlinkFiles(req.files);
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound({errorMsg:"Category not found. Invalid catId"},"Category not found."))
            }
            //let check Exist category Name
            let checkIfExistName = await Category.findOne({
                categoryName:inputData.categoryName,
                isDeleted:false,
                parentId:checkCategory.parentId,
                _id:{$ne:new ObjectId(inputData.catId)}
            });
            if(checkIfExistName){
                await unlinkFiles(req.files);
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest({errorMsg:"Category name already exist."},"Category name already exist."));
            }
            if(inputData.isActive){
                inputData.isActive=inputData.isActive && inputData.isActive==true?true:false;
            }
            let updateData = {...inputData};
            updateData.updatedBy = req.seller.id;
            delete updateData.catId;
            if(req.files.catImage){
                await unlinkExistFiles({profilePic:checkCategory.catImage});
                updateData.catImage={path:req.files.catImage[0].path,filename:req.files.catImage[0].filename};
            }
            let updateCategory = await Category.findOneAndUpdate({
                _id:new ObjectId(inputData.catId),
                isDeleted:false
            },updateData);
            return res.status(ResponseCode.OK).json(response.setSuccess(updateCategory,"Category updated successfully."));

        }
        catch(error){
            await unlinkFiles(req.files);
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,"Internal server error."));
            
        }
    },
    /**
     * @filename CategoryController.js
     * @method deleteCategory
     * @router POST /api/tezrati/v1/category/delete
     * @params
     * @Auther Abhijit swain
     * @desc Delete category.
     * @autherization
     */
    deleteCategory: async(req,res)=>{
        console.log("Inside CategoryController deleteCategory API...");
        const response = new CustomResponse();
        try{
            let inputData = _.pick(req.body,['catId']);
            let result = await CategoryDataValidate(inputData,CategoryEvents.deleteCategory);
            if(result.hasError){
                return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(result.errors,"Invalid inputs."));
            }
            let checkCategory = await Category.findOne({
                _id:new ObjectId(inputData.catId),
                isDeleted:false
            });
            if(!checkCategory){
                return res.status(ResponseCode.NOT_FOUND).json(response.setNotfound({errorMsg:"Category not found.check catId"},"Category not found."));
            }
            let deleteCategory=await Category.findOneAndUpdate({
                _id:new ObjectId(inputData.catId),
                isDeleted:false
            },{
                isDeleted:true,
                updatedBy:req.seller.id,
                updatedAt:Date.now()
            });
            return res.status(ResponseCode.OK).json(response.OK(deleteCategory,"Category deleted successfully."));
        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,"Internal server error."));  
        }
    },
    /**
     * @filename CategoryController.js
     * @method getCategory
     * @router GET /api/tezrati/v1/category/parent/get
     * @params
     * @Auther Abhijit swain
     * @desc fetched category.
     * @autherization SellerAuth
     */
    getCategory: async(req,res)=>{
        console.log("Inside CategoryController getParentCategory API...");
        const response = new CustomResponse();
        try{
            let {search,level,parentId}=req.query;
            let searchObj = {};
            if(search){
                searchObj = { categoryName: { $regex: search, $options: "i" } };
            }
            console.log(search);
            let category = await Category.find({
                ...searchObj,
                level:0,
                isDeleted:false
            }).sort({createdAt:1});
            if(level && level!==0){
                if(!parentId){
                    return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest({errorMsg:"Category parentId is required."},"Category parentId is required."));
                }
                category = await Category.find({
                    ...searchObj,
                    level:{$ne:0},
                    parentId:new ObjectId(parentId),
                    // isActive:true,
                    isDeleted:false
                }).sort({createdAt:1});
            }
            
            
            return res.status(ResponseCode.OK).json(response.setSuccess(category,"Category fetched successfully."));
        }
        catch(error){
            console.log('Internal server error:',error);
            return res.status(ResponseCode.INTERNAL_SERVERERROR).json(response.setServerError(error,"Internal server error."));  
        }
    }

}