import passport from "passport";
//const localStrategy = require("passport-local").Strategy;
import ppLocal from 'passport-local';
const localStrategy = ppLocal.Strategy;
import bcrypt from 'bcrypt'
import {getDatabase} from './db/mysql-connect.mjs'
import { AppError } from "./AppError.mjs";

passport.use(
  new localStrategy(
    { usernameField: "reg[username]", passwordField: "reg[password]" },
    async (username, password, done) => {
      try {
        const db = await getDatabase();
        const sql = `SELECT user_id, username, password, activation_status
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
            return done(null,false,{message:"Account has not been activated. Please check your email for confirmation link"});
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
        return done(new AppError(500, "Error Loggin User"));
      }
    }
  )
);
passport.serializeUser(function (user, done) {
  done(null, user.user_id);
});
passport.deserializeUser(async function (id, done) {
  try {
    const db = await getDatabase();
    const sql = `SELECT user_id,username,email,account_type,pic_url
      FROM users 
      WHERE user_id = ?`;
    const values = [id];

    const user = await db.execute(``);

    const userObj = Object.assign({}, Object.values(user[0])[0]);
    
    done(null, userObj);
  } catch (err) {
    done(err, false);
  }
});
export default passport;
