"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const multer = require('multer');
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed!'));
    }
};
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB limit
    },
});
exports.upload = upload;
//# sourceMappingURL=upload.middleware.js.map