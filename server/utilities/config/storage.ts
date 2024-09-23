import multer from 'multer';
import { RemoteStorage } from 'multer-remote-storage';
import {
    NODE_ENV,
    CLOUDINARY_NAME,
    CLOUDINARY_API_KEY,
    CLOUDINARY_SECRET,
    GCS_KEY_PATH,
    GCS_PROJECT_ID,
    GCS_BUCKET,
    AWS_S3_ACCESS_KEY,
    AWS_S3_SECRET_KEY,
    AWS_S3_BUCKET,
    AWS_S3_REGION
} from './config';
import topicValidator from '../validators/topicValidator';

const LOCAL_UPLOADS_DIR = process.env.LOCAL_UPLOADS_DIR || './server/public/uploads';

let storage: RemoteStorage;
let topicStorage: RemoteStorage;
let localStorage;

let MULTER_STORAGE_ENGINE_NO_VALID: any;
let MULTER_STORAGE_ENGINE_TOPIC: any;
let LOCAL_UPLOADS_ENGINE: any;

//Types
import { Request } from 'express';
import { File, MulterCallback } from 'multer-remote-storage';
import { dirname, join } from 'path';

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
    return `${file.originalname.split('.')[0]}-${Date.now()}`
}

const handlePublicIdWithExt = (req: Request, file: File, cb: MulterCallback) => {
    return `${file.originalname.split('.')[0]}-${Date.now()}.${file.originalname.split('.')[1]}`
}

/**
 * Check env variables to see whether to use Cloudinary, Google Cloud Storage, or AWS S3
 */
if (NODE_ENV !== 'development') {
    if (CLOUDINARY_NAME && CLOUDINARY_API_KEY && CLOUDINARY_SECRET) {
        const CLOUDINARY_CONFIG = {
            cloud_name: CLOUDINARY_NAME,
            api_key: CLOUDINARY_API_KEY,
            api_secret: CLOUDINARY_SECRET,
            secure: true,
        };
        storage = new RemoteStorage({
            target: 'CLOUDINARY',
            config: CLOUDINARY_CONFIG,
            params: {
                folder: 'Programminghelp'
            }
        });

        topicStorage = new RemoteStorage({
            target: 'CLOUDINARY',
            config: CLOUDINARY_CONFIG,
            params: {
                folder: 'Programminghelp',
            },
            options: {
                public_id: handlePublicId,
                validator: handleTopicValidation,
            },
        });
        MULTER_STORAGE_ENGINE_NO_VALID = storage;
        MULTER_STORAGE_ENGINE_TOPIC = { storage: topicStorage };
    } else if (GCS_KEY_PATH && GCS_PROJECT_ID && GCS_BUCKET) {
        storage = new RemoteStorage({
            target: 'GCS',
            config: {
                keyFilename: join(dirname(__filename), GCS_KEY_PATH),
                projectId: GCS_PROJECT_ID
            },
            params: {
                bucket: GCS_BUCKET
            },
            options: {
                public_id: handlePublicIdWithExt
            }
        });
        topicStorage = new RemoteStorage({
            target: 'GCS',
            config: {
                keyFilename: join(dirname(__filename), GCS_KEY_PATH),
                projectId: GCS_PROJECT_ID
            },
            params: {
                bucket: GCS_BUCKET
            },
            options: {
                public_id: handlePublicIdWithExt,
                validator: handleTopicValidation,
            }
        });
        MULTER_STORAGE_ENGINE_NO_VALID = storage;
        MULTER_STORAGE_ENGINE_TOPIC = { storage: topicStorage };
    } else if (AWS_S3_ACCESS_KEY && AWS_S3_SECRET_KEY && AWS_S3_BUCKET && AWS_S3_REGION) {
        storage = new RemoteStorage({
            target: 'AWS_S3',
            config: {
                credentials: {
                    accessKeyId: AWS_S3_ACCESS_KEY,
                    secretAccessKey: AWS_S3_SECRET_KEY
                },
                region: AWS_S3_REGION
            },
            params: {
                Bucket: AWS_S3_BUCKET
            },
            options: {
                public_id: handlePublicIdWithExt
            }
        });
        topicStorage = new RemoteStorage({
            target: 'AWS_S3',
            config: {
                credentials: {
                    accessKeyId: AWS_S3_ACCESS_KEY,
                    secretAccessKey: AWS_S3_SECRET_KEY,
                },
                region: AWS_S3_REGION
            },
            params: {
                Bucket: AWS_S3_BUCKET
            },
            options: {
                public_id: handlePublicIdWithExt,
                validator: handleTopicValidation,
            }
        });
        MULTER_STORAGE_ENGINE_NO_VALID = storage;
        MULTER_STORAGE_ENGINE_TOPIC = { storage: topicStorage };
    }
} else {
    localStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, LOCAL_UPLOADS_DIR);
        },
        filename: (req, file, cb) => {
            const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, `${file.originalname.substring(0, file.originalname.lastIndexOf('.'))}-${unique}.${file.mimetype.substring(file.mimetype.indexOf('/') + 1)}`);
        }
    });
    LOCAL_UPLOADS_ENGINE = { storage: localStorage };
    MULTER_STORAGE_ENGINE_NO_VALID = LOCAL_UPLOADS_ENGINE;
    MULTER_STORAGE_ENGINE_TOPIC = LOCAL_UPLOADS_ENGINE;
}

export {
    storage,
    topicStorage,
    localStorage,
    LOCAL_UPLOADS_DIR,
    MULTER_STORAGE_ENGINE_NO_VALID,
    MULTER_STORAGE_ENGINE_TOPIC
};