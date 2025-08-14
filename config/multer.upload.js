const multer = require('multer');


const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, 'uploads/posts');
    },

    filename : (req, file, cb) => {
        const timestamp = Date.now();
        const originalname = file.originalname.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.-]/g, "");
        
        cb(null, `${timestamp}-${file.originalname}`);
    },
});

const fileFilter = (req, file, cb) => {
    // Accept images only and videos only
    const allowTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/svg", "video/mp4", "video/webm", "video/ogg", "audio/mp3", "audio/wav", "audio/aac", "audio/ogg"];

    if(allowTypes.includes(file.mimetype)) {
        cb(null, true);
    }else {
            cb(new Error("Invalid File Type"), false);
        }
}

const postUpload = multer({
    storage : storage,
    fileFilter : fileFilter,
    limits : {
        fileSize : 15 * 1024 * 1024, // 15MB
    }
});

module.exports = postUpload;