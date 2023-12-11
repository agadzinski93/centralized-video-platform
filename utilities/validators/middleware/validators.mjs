import registerValidator from "../registerValidator.mjs";
import topicValidator from "../topicValidator.mjs";
import { cloudinary } from "../../cloudinary.mjs";

/**
 * Validates user input in registration form. Returns user to form with flashed error message if unsuccessful.
 * @param req request
 * @param res response
 * @param next callback - Never called if invalid user input
 */
const registrationValidation = (req, res, next) => {
  let { error } = registerValidator.validate(req.body);
  if (error) {
    req.flash("error", error.details[0].message);
    res.redirect("/register");
  } else {
    next();
  }
}
const topicValidation = (req, res, next) => {
  let { error } = topicValidator.validate(req.body);
  if (error) {
    if (req.file) {
      cloudinary.uploader.destroy(req.file.filename);
    }
    req.flash("error", error.details[0].message);
    res.redirect(`/user/${req.user.username}/dashboard`);
  } else {
    next();
  }
}

export {registrationValidation,topicValidation};