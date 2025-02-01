const fs = require('fs');
const cloudinary = require('../config/cloudinaryConfig');

//This method for unlink the current uploadded file.
const unlinkFiles = async(filesObj)=>{
    // console.log('fileObject:',filesObj);
    for (const property in filesObj){    
        // fs.unlinkSync(filesObj[`${property}`][0].path);
        if(filesObj[`${property}`]){
            for(let i=0;i<filesObj[`${property}`].length;i++){
                const {result,error}=await cloudinary.uploader.destroy(filesObj[`${property}`][i].filename);
                console.log(result, error);
            }
        }
    }
}

// This method for unlink the existing file which is already stored in our application
const unlinkExistFiles = async(filesObj)=>{
    // console.log('fileObject:',filesObj);
    for (const property in filesObj){ 
        if(filesObj[`${property}`]){
            const {result,error}=await cloudinary.uploader.destroy(filesObj[`${property}`].filename);
            console.log(result, error);
        }   
    }
}

 module.exports = {unlinkFiles,unlinkExistFiles};