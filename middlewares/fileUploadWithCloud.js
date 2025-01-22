const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig');
const { CustomResponse, ResponseCode } = require('../config/constants');

const uploadFile = (payload)=>{
    const response = new CustomResponse();
    return (req,res,next)=>{
        // console.log('payload:',payload);
        let {fields,dest_path,allowedMimeTypes,msg,size}=payload;
        const storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: async (req, file) => {
              return {
                folder: dest_path, // Cloudinary folder name
                public_id: `${Date.now()}_${file.originalname.split('.')[0]}`, // Custom filename
                // allowed_formats: ['jpg', 'jpeg', 'png'], // Allowed file formats
              };
            },
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
            otherOption={limits:{fileSize:size}}
        }
        console.log('otherOption:',otherOption);
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


module.exports = uploadFile;