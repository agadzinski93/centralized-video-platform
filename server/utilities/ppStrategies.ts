import { AppError } from "./AppError";
import bcrypt from 'bcrypt'
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt, JwtFromRequestFunction } from "passport-jwt";
import { getDatabase } from "./db/mysql-connect";
import { COOKIE_SECRET } from "./config";

import { Request } from "express";
import { RowDataPacket } from "mysql2";

const cookieExtractor = (req: Request): string | null => {
  let token = null;
  if (req && Object.keys(req.signedCookies).length > 0) {
    token = req.signedCookies['token'];
  }
  return token;
}

passport.use(
  'login',
  new LocalStrategy(
    { usernameField: "username", passwordField: "password" },
    async (username, password, done) => {
      try {
        const db = await getDatabase();
        if (db instanceof AppError) throw new Error(db.message);
        const sql = `SELECT user_id, username, email, password, activation_status, pic_url
                  FROM users 
                  WHERE username = ?`;
        const values = [username];

        const user = await db.execute<RowDataPacket[]>(sql, values);

        if (user[0].length === 0) {
          return done(null, false, { message: "Username is incorrect" });
        }

        const userObj: any = Object.assign({}, Object.values(user[0])[0]);

        switch (userObj.activation_status) {
          case 'pending':
            return done(null, false, { message: "Account has not been activated. Please check your email for confirmation link." });
          case 'disabled':
            return done(null, false, { message: "Account has been disabled." });
          default:
        }

        bcrypt.compare(password, userObj.password, (err, isMatch) => {
          if (err) {
            return done(err);
          }
          if (isMatch) {
            return done(null, userObj);
          } else {
            return done(null, false, { message: "Password is incorrect" });
          }
        });
      } catch (err) {
        return done(new AppError(500, "Error Logging In User"));
      }
    }
  )
);

const foo = () => {
  return ExtractJwt.fromAuthHeaderAsBearerToken;
}

passport.use(
  'bearer',
  new JwtStrategy(
    {
      secretOrKey: (COOKIE_SECRET as string),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    },
    async (token: { user: string }, done: any) => {
      return done(null, token.user);
    }
  )
);

passport.use(
  'cookie',
  new JwtStrategy(
    {
      secretOrKey: (COOKIE_SECRET as string),
      jwtFromRequest: cookieExtractor
    },
    (token: string | null, done: any) => {
      if (token && typeof token === 'object') {
        return done(null, token);
      }
      return done(null, null);
    }
  )
);

export { passport as pp };