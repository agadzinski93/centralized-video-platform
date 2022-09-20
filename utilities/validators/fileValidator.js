const AppError = require('../AppError');
const filter = (req,file,cb) => {
    if (file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif" ||
    file.mimetype === "image/tiff" ||
    file.mimetype === "webp") {
        cb(null, true);
    } else {
        cb(new AppError(400,"Image must be of type JPG, PNG, GIF, TIF, or WEBP"));
    }
}
module.exports = filter;