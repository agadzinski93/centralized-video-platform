import { AppError } from "../../AppError";
import { getDatabase } from "../../db/mysql-connect";
import { paramsExist } from "../paramsExist";
import { escapeHTML } from "../../helpers/sanitizers";
import { usernameMatch } from "../../helpers/authHelpers";
import passport from "passport";
import jwt from "jsonwebtoken";
import { NODE_ENV, COOKIE_SECRET, GOOGLE_SUCCESS_URL } from "../../config/config";

import { Request, Response, NextFunction } from "express";
import { UserObject } from "../../../types/types";
import { RowDataPacket } from "mysql2";

const tokenCookieExtractor = (req: Request) => {
  let token = null;
  if (req && COOKIE_SECRET && req.signedCookies && Object.keys(req.signedCookies).length > 0) {
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
  //STEP 1) First, check if a session exists with PassportJS
  if (req.isAuthenticated()) {
    next();
  }
  else {
    //STEP 2) If no session exists, check if an Auth header was sent (must contain JWT string)
    if (req.header('Authorization')) {
      passport.authenticate('bearer', { session: false }, async (err: any, user: any, info: any) => {
        if (user) {
          //If user info is returned from JWT, validate the username with the username in db
          const db = await getDatabase();
          if (db instanceof AppError) return next(new AppError(500, "Error verifying author status."));

          const sql = `SELECT username FROM users WHERE user_id = ?`;
          const values = [user.user_id];
          let result = await db.execute<RowDataPacket[]>(sql, values);
          if (user.username === result[0][0].username) {
            res.locals.user = user;
          }
          return next();
        }
        else {
          return next(new AppError(401, "Unauthorized"));
        }
      })(req, res, next);
    } else {
      //STEP 3) If no Auth Header, validate if a cookie exists, this will result in 401 if it fails
      passport.authenticate('cookie', { session: false }, (err: any, user: any, info: any) => {
        if (user) {
          return next();
        }
        else {
          return next(new AppError(401, "Unauthorized"));
        }
      })(req, res, next);
    }
  }
}

const isAuthor = async (req: Request, res: Response, next: NextFunction) => {
  if (paramsExist([req.params.username])) {
    //Check either req.user for sessions or res.locals.user if Authorization header was used
    let loggedUsername = (req.user) ? escapeHTML((req.user as UserObject).username) : escapeHTML(res.locals.user.username);
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

const processValidation = (req: Request, res: Response) => {
  if (!req?.user?.username) {
    res.cookie('tmp_user', JSON.stringify(req.user), {
      httpOnly: false,
      secure: (NODE_ENV === 'production') ? true : false,
      maxAge: 1000 * 60 * 60,
      sameSite: 'lax',
      signed: true
    });
  }
  res.redirect(GOOGLE_SUCCESS_URL);
}

export { isLoggedIn, verifyUser, isAuthor, processValidation };