import { AppError } from "../../AppError";
import { paramsExist } from "../paramsExist";
import { escapeHTML } from "../../helpers/sanitizers";
import { usernameMatch } from "../../helpers/authHelpers";
import passport from "passport";
import jwt from "jsonwebtoken";
import { COOKIE_SECRET } from "../../config";

import { Request, Response, NextFunction } from "express";
import { UserObject } from "../../../types/types";

const tokenCookieExtractor = (req: Request) => {
  let token = null;
  if (req && COOKIE_SECRET && Object.keys(req.signedCookies).length > 0) {
    token = req.signedCookies['token'];
    jwt.verify(token, COOKIE_SECRET, (err: any, decoded: any) => {
      if (err) {
        token = null;
      }
      else if (!err && decoded) {
        token = decoded;
      }
    });
  }
  return token;
}

/**
 * Middleware to populate the req.user object if user is logged in. Otherwise, it will be undefined.
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 */
const verifyUser = (req: Request, res: Response, next: NextFunction) => {
  const user = tokenCookieExtractor(req);
  if (user) {
    req.user = user;
  }
  next();
}

const isLoggedIn = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('cookie', { session: false }, (err: any, user: any, info: any) => {
    if (user) {
      return next();
    }
    else {
      return next(new AppError(401, "Unauthorized"));
    }
  })(req, res, next);
}

const isAuthor = async (req: Request, res: Response, next: NextFunction) => {
  if (paramsExist([(req.user as UserObject)?.username, req.params.username])) {
    const loggedUsername = escapeHTML((req.user as UserObject).username);
    const urlUsername = escapeHTML(req.params.username);

    if (loggedUsername && urlUsername) {
      const match = await usernameMatch(loggedUsername, urlUsername);
      if (match instanceof AppError) return next(match);

      return next();
    }
  }
  else {
    return next(new AppError(422, "Invalid Arguments."));
  }
}

export { isLoggedIn, verifyUser, isAuthor };