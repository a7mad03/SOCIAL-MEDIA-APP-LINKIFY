const multer = require('multer');


const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, )
    },

});

const postUpload = multer({
    storage : 
});