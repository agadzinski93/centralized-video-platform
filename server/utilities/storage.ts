import multer from 'multer';
import { RemoteStorage } from 'multer-remote-storage';
import { v2 as Cloudinary } from 'cloudinary';
import { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET, LOCAL_UPLOADS_DIR } from './config';
import topicValidator from './validators/topicValidator';

//Types
import { Request } from 'express';
import { File, MulterCallback } from 'multer-remote-storage';

const handleTopicValidation = (req: Request, file: File, cb: MulterCallback) => {
    let output = true;
    try {
        const { error, value } = topicValidator.validate(req.body);
        if (error) output = false;
    } catch (err) {
        output = false;
    }
    return output;
}

const handlePublicId = (req: Request, file: File, cb: MulterCallback) => {
    return `${file.originalname.split('.')[0]}-${Date.now()}}`
}

/*
    CLOUDINARY
*/

Cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_SECRET,
    secure: true,
});

const storage = new RemoteStorage({
    client: Cloudinary,
    params: {
        folder: 'Programminghelp'
    }
});

const topicStorage = new RemoteStorage({
    client: Cloudinary,
    params: {
        folder: 'Programminghelp'
    },
    options: {
        public_id: handlePublicId,
        validator: handleTopicValidation
    },
});

//Local Storage For Development
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, LOCAL_UPLOADS_DIR);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.originalname.substring(0, file.originalname.lastIndexOf('.'))}-${unique}.${file.mimetype.substring(file.mimetype.indexOf('/') + 1)}`);
    }
});

export { Cloudinary, storage, topicStorage, localStorage };