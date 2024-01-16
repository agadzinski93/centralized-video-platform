import { AppError } from "../../AppError.mjs";
import { paramsExist } from "../paramsExist.mjs";
import { escapeHTML } from "../../helpers/sanitizers.mjs";
import { usernameMatch } from "../../helpers/authHelpers.mjs";
import {pp} from '../../ppJwt.mjs' 
import jwt from "jsonwebtoken";

const tokenCookieExtractor = (req) => {
  let token = null;
  if (req && Object.keys(req.signedCookies).length > 0) {
    token = req.signedCookies['token'];
    jwt.verify(token,process.env.COOKIE_SECRET, (err,decoded)=>{
      if (!err && decoded) {
        token = decoded;
      }
    });
  }
  return token;
}

const isLoggedInOptional = (req,res,next) => {
  const user = tokenCookieExtractor(req);
  if (user) {
      req.user = user;
  }
  next();
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
    return next(new AppError(400, "Arguments not provided."));
  }
}

export {isLoggedInOptional,isAuthor};