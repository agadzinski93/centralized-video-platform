import { ApiResponse } from "../../ApiResponse";
import { paramsExist } from "../paramsExist";
import registerValidator from "../registerValidator";
import registerUsernameValidator from "../registerUsernameValidator";
import topicValidator from "../topicValidator";
import { topicStorage } from "../../config/storage";

import { Request, Response, NextFunction } from "express";

/**
 * Validates user input in registration form. Returns user to form with flashed error message if unsuccessful.
 * @param req request
 * @param res response
 * @param next callback - Never called if invalid user input
 */
const registrationValidation = (req: Request, res: Response, next: NextFunction): void => {
  let { error } = registerValidator.validate(req.body);
  if (error) {
    res.redirect("/auth/register");
  } else {
    next();
  }
}
const registerUsernameValidation = (req: Request, res: Response, next: NextFunction): void => {
  let { error } = registerUsernameValidator.validate(req.body);
  if (error) {
    const Response = new ApiResponse('error', 400, error.message);
    res.status(Response.getStatus).json(Response.getApiResponse());
  } else {
    next();
  }
}
const topicValidation = (req: Request, res: Response, next: NextFunction): void => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  if (paramsExist([req.body])) {
    let { error } = topicValidator.validate(req.body);
    if (error) {
      if (req.file && req.file.path) {
        topicStorage.delete(req.file.filename);
      }
      Response.setApiResponse('error', 400, error.details[0].message, '/');
    } else {
      return next();
    }
  }
  else {
    Response.setApiResponse('error', 422, 'Invalid Arguments.', '/');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}

export { registrationValidation, registerUsernameValidation, topicValidation };