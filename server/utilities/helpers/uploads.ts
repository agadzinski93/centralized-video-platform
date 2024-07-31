import { rm } from "fs";
import { Cloudinary } from "../config/storage";
import { NODE_ENV } from "../config/config"
import { LOCAL_UPLOADS_DIR } from "../config/storage";
import { AppError } from "../AppError";

const setPathAndFilename = (path: string | undefined, filename: string | undefined): { path: string, filename: string } => {
    let output = { path: '', filename: '' };
    if (path && filename) {
        output = (NODE_ENV === 'production') ? { path, filename } : { path: `/uploads/${filename}`, filename };
    }
    return output;
}

const deleteFile = async (filename: string): Promise<AppError | void> => {
    try {
        if (NODE_ENV === 'production') {
            await Cloudinary.uploader.destroy(filename);
        } else {
            rm(`${LOCAL_UPLOADS_DIR}/${filename}`, (err) => {
                if (err) throw err;
            });
        }
    } catch (err) {
        return new AppError(500, 'Error deleting file.');
    }
}

export { setPathAndFilename, deleteFile };