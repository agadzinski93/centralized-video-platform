import { ApiResponse } from "../../ApiResponse.mjs";
import { paramsExist } from "../paramsExist.mjs";
import registerValidator from "../registerValidator.mjs";
import topicValidator from "../topicValidator.mjs";
import { Cloudinary } from "../../cloudinary.mjs";

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
    res.redirect("/auth/register");
  } else {
    next();
  }
}
const topicValidation = (req, res, next) => {
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.body])) {
    let { error } = topicValidator.validate(req.body);
    if (error) {
      if (req.file) {
        Cloudinary.uploader.destroy(req.file.filename);
      }
      Response.setApiResponse('error',400,error.details[0].message,'/');
    } else {
      return next();
    }
  }
  else {
    Response.setApiResponse('error',422,'Invalid Arguments.','/');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}

export {registrationValidation,topicValidation};