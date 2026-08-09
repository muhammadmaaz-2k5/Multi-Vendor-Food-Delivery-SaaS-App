import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';

// Configuration is automatically picked up from process.env.CLOUDINARY_URL
// But we can be explicit if we want:
// cloudinary.config({});

export const uploadImageToCloudinary = async (file: Express.Multer.File, folder: string = 'items'): Promise<string> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder, 
        upload_preset: env.CLOUDINARY_UPLOAD_PRESET 
      },
      (error, result) => {
        if (error) return reject(error);
        if (result) return resolve(result.secure_url);
        reject(new Error('Unknown Cloudinary Error'));
      }
    );
    
    uploadStream.end(file.buffer);
  });
};
