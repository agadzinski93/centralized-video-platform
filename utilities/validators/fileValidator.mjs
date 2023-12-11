import {AppError} from "../AppError.mjs";
const filter = (req,file,cb) => {
    if (file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif" ||
    file.mimetype === "image/tiff" ||
    file.mimetype === "image/webp") {
        cb(null, true);
    } else {
        cb(new AppError(400,"Image must be of type JPG, PNG, GIF, TIF, or WEBP"));
    }
}
export {filter};