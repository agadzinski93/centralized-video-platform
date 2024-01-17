import { AppError } from "../../AppError.mjs";
import { paramsExist } from "../paramsExist.mjs";
import { escapeHTML } from "../../helpers/sanitizers.mjs";
import { usernameMatch } from "../../helpers/authHelpers.mjs";
import passport from "passport";
import jwt from "jsonwebtoken";

const tokenCookieExtractor = (req) => {
  let token = null;
  if (req && Object.keys(req.signedCookies).length > 0) {
    token = req.signedCookies['token'];
    jwt.verify(token,process.env.COOKIE_SECRET, (err,decoded)=>{
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
const verifyUser = (req,res,next) => {
  const user = tokenCookieExtractor(req);
  if (user) {
      req.user = user;
  }
  next();
}

const isLoggedIn = (req,res,next) => {
  passport.authenticate('cookie',{session:false},(err,user,info)=>{
    if (user) {
      return next();
    }
    else {
      return next(new AppError(401,"Unauthorized"));
    }
  })(req,res,next);
}

const isAuthor = async (req, res, next) => {
  if (paramsExist([req.user?.username, req.params.username])) {
    const loggedUsername = escapeHTML(req.user.username);
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

export {isLoggedIn,verifyUser,isAuthor};