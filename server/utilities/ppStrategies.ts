import { AppError } from "./AppError";
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from "uuid";
import passport, { DoneCallback } from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { getDatabase } from "./db/mysql-connect";
import {
  COOKIE_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  DEFAULT_PROFILE_PIC,
  DEFAULT_PIC_FILENAME
} from "./config";
import { getUserById, getUserByGoogleId } from "./helpers/authHelpers";

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
                  WHERE username = ? AND google_id IS NULL`;
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

passport.use(
  'google',
  new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
  }, async (req, accessToken, refreshToken, profile, cb) => {
    try {
      const defaultUser = {
        email: (Array.isArray(profile.emails)) && profile.emails[0].value,
        googleId: profile.id
      }

      //Error if email or username does not exist
      if (!defaultUser.email) {
        throw new Error('Failed to get email account');
      }
      else {
        let user = await getUserByGoogleId(defaultUser.googleId, defaultUser.email);
        if (user instanceof AppError) {
          if (user.status === 400) {
            const db = await getDatabase();
            if (db instanceof AppError) throw new AppError(db.status, db.message);

            let id = uuidv4();

            if (DEFAULT_PIC_FILENAME && DEFAULT_PROFILE_PIC) {
              const userOutput = {
                user_id: id,
                email: defaultUser.email,
                google_id: defaultUser.googleId
              }

              return cb(null, userOutput as any);
            } else {
              throw new AppError(500, 'No default profile picture or filename. Check ENV variables.');
            }
          }
          else {
            throw new AppError(user.status, user.message);
          }
        } else {
          const userOutput = {
            user_id: user.user_id,
            username: user.username,
            email: user.email,
            google_id: user.google_id,
            pic_url: user.pic_url,
            activation_status: user.activation_status
          }
          return cb(null, userOutput);
        }
      }
    } catch (err) {
      return cb(err)
    }
  }));

passport.serializeUser((user, cb) => {
  cb(null, user.user_id);
});

passport.deserializeUser(async (req: Request, id: string, cb: DoneCallback): Promise<void> => {
  const STR_COOKIE_TMP_USER = req.signedCookies['tmp_user'];
  //console.log(STR_COOKIE_TMP_USER);
  try {
    if (STR_COOKIE_TMP_USER) {
      const COOKIE_TMP_USER = JSON.parse(STR_COOKIE_TMP_USER);
      const { username, email, google_id } = req.body;
      if (username && email === COOKIE_TMP_USER.email && google_id === COOKIE_TMP_USER.google_id) {
        cb(null, { username, email, google_id } as any);
        req.logout((err) => {
          if (err) return;
          req.session.destroy((err) => {
            if (err) return;
          });
        })
      } else {
        throw new Error('Username, email, google_id must exist on tmp_user cookie');
      }

    } else {
      const user = await getUserById(id);
      if (user instanceof AppError) {
        throw new AppError(user.status, user.message);
      } else {
        cb(null, user);
      }
    }

  } catch (err) {
    cb(new AppError(400, 'Authentication Failed. Logging out.'));
  }
});

export { passport as pp };