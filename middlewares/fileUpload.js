const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ResponseCode, CustomResponse } = require('../config/constants');

// Ensure the upload directory exists
const ensureDirExists = (dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};
//file size 
let fileSize = (size)=>{
    const limits = {
        fileSize: size // eg.5 MB in bytes
    };
    return limits;
};

const uploadFile = (payload)=>{
    const response = new CustomResponse();
    return (req,res,next)=>{
        console.log('payload:',payload);
        let {fields,dest_path,allowedMimeTypes,msg,size}=payload;
        const storage = multer.diskStorage({
            destination:(req,file,cb)=>{
                const folderName = file.fieldname; 
                const uploadPath = path.join(dest_path, folderName); // Create folder path dynamically
                // Ensure that the folder exists, create it if it doesn't
                ensureDirExists(uploadPath);
        
                // Set the destination to the dynamically created folder
                cb(null, uploadPath);
            },
            filename: function (req, file, cb) {
                // Append timestamp to avoid name conflicts
                const fileName = Date.now() + '-' + file.originalname;
                cb(null, fileName);
            }
        });
        let otherOption = {};
        if(allowedMimeTypes){
            const fileFilter = (req, file, cb) => {
                if (allowedMimeTypes.includes(file.mimetype)) {
                    cb(null, true);  // Accept the file
                } else {
                    cb(new Error(msg), false);  // Reject the file
                }
            };
            otherOption={fileFilter: fileFilter};
        }
        if(size){
            otherOption={limits:fileSize(size)}
        }
        const upload = multer({
            storage:storage,
            ...otherOption
        });
        // console.log(upload);
        upload.fields(fields)(req, res, (err) => {
            if (err) {
                // Handle Multer errors
                console.error("error:", err.message);
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_SIZE') {
                        return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(err.message,err.message));
                    } else {
                        return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(err.message,err.message));
                    }
                } else {
                    // Other errors
                    console.error(err);
                    return res.status(ResponseCode.BAD_REQUEST).json(response.setBadrequest(err.message,err.message));
                }
            }
            // Continue to the next middleware/controller
            next();
        });
    }
}

module.exports=uploadFile;