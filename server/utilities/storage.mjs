import { RemoteStorage } from 'multer-remote-storage';
import {v2 as Cloudinary} from 'cloudinary';
import { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET } from './config.mjs';
import topicValidator from './validators/topicValidator.mjs';

const handleTopicValidation = (req, file, cb) => {
    let output = true;
        try {
            const {error, value} = topicValidator.validate(req.body);
            if (error) output = false;
        } catch(err) {
            output = false;
        }
        return output;
}

const handlePublicId = (req,file,cb) => {
    return `${file.originalname.split('.')[0]}-${Date.now()}}`
}

/*
    CLOUDINARY
*/

Cloudinary.config({
    cloud_name:CLOUDINARY_NAME,
    api_key:CLOUDINARY_API_KEY,
    api_secret:CLOUDINARY_SECRET,
    secure:true,
});

const storage = new RemoteStorage({
    client:Cloudinary,
    params: {
        folder:'Programminghelp'
    }
});

const topicStorage = new RemoteStorage({
    client:Cloudinary,
    params: {
        folder:'Programminghelp'
    },
    options: {
        public_id:handlePublicId,
        validator: handleTopicValidation
    },
});

export {Cloudinary, storage, topicStorage};