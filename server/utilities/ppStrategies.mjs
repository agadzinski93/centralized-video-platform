import { AppError } from "./AppError.mjs";
import bcrypt from 'bcrypt'
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { getDatabase } from "./db/mysql-connect.mjs";

const cookieExtractor = (req) => {
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
        async (username,password,done)=>{
            try {
                console.log(`Username: ${username}`);
                const db = await getDatabase();
                const sql = `SELECT user_id, username, email, password, activation_status, pic_url
                  FROM users 
                  WHERE username = ?`;
                const values = [username];
                
                const user = await db.execute(sql,values);
        
                if (user[0].length === 0) {
                  return done(null, false, { message: "Username is incorrect" });
                }
        
                const userObj = Object.assign({}, Object.values(user[0])[0]);
        
                switch(userObj.activation_status) {
                  case 'pending':
                    return done(null,false,{message:"Account has not been activated. Please check your email for confirmation link."});
                  case 'disabled':
                    return done(null,false,{message:"Account has been disabled."});
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
            secretOrKey:process.env.COOKIE_SECRET,
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken
        },
        async (token,done) => {
            return done(null, token.user);
        }
    )
);

passport.use(
    'cookie',
    new JwtStrategy(
        {
            secretOrKey:process.env.COOKIE_SECRET,
            jwtFromRequest: cookieExtractor
        },
        (token,done) => {
            if (token && typeof token === 'object') {
                return done(null, token);
            }
            return done(null, null);
        }
    )
);

export {passport as pp};