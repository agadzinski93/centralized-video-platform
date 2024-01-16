import {v2 as Cloudinary} from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

Cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_SECRET,
    secure:true,
});

const storage = new CloudinaryStorage({
    cloudinary:Cloudinary,
    params: {
        folder:'Programminghelp',
    }
});

export {Cloudinary, storage};