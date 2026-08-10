const { v2: cloudinary } = require('cloudinary');

const { env } = require('../config/env');


// Configuration is automatically picked up from process.env.CLOUDINARY_URL
// But we can be explicit if we want:
// cloudinary.config({});

const uploadImageToCloudinary = async (file: any, folder: string = 'items'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder, 
        upload_preset: env.CLOUDINARY_UPLOAD_PRESET 
      },
      (error: any, result: any) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        reject(new Error('Unknown Cloudinary Error'));
      }
    );
    
    uploadStream.end(file.buffer);
  });
};
exports.uploadImageToCloudinary = uploadImageToCloudinary;

