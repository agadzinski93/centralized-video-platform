//const cloudinary = require('cloudinary').v2;
import cloudinary from 'cloudinary';
const cloudinaryV2 = cloudinary.v2;
import {CloudinaryStorage} from 'multer-storage-cloudinary';

cloudinaryV2.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary:cloudinaryV2,
    params: {
        folder:'Programminghelp',
    }
});

export {cloudinaryV2 as cloudinary, storage};