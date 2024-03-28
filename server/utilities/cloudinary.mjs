import {v2 as Cloudinary} from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET } from './config.mjs';

Cloudinary.config({
    cloud_name:CLOUDINARY_NAME,
    api_key:CLOUDINARY_API_KEY,
    api_secret:CLOUDINARY_SECRET,
    secure:true,
});

const storage = new CloudinaryStorage({
    cloudinary:Cloudinary,
    params: {
        folder:'Programminghelp',
    }
});

export {Cloudinary, storage};