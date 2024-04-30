import { AppError } from "../AppError";
import { Request } from "express";
import { File } from "multer-remote-storage";
import { FileFilterCallback } from "multer";

const filter = (req: Request, file: File, cb: FileFilterCallback) => {
    if (file.mimetype === "image/jpeg" ||
        file.mimetype === "image/png" ||
        file.mimetype === "image/gif" ||
        file.mimetype === "image/tiff" ||
        file.mimetype === "image/webp") {
        cb(null, true);
    } else {
        cb(new AppError(415, "Image must be of type JPG, PNG, GIF, TIF, or WEBP"));
    }
}
export { filter };