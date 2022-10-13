const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const { getDatabase } = require("./mysql-connect");
const AppError = require("./AppError");

passport.use(
  new localStrategy(
    { usernameField: "reg[username]", passwordField: "reg[password]" },
    async (username, password, done) => {
      try {
        const db = await getDatabase();
        
        const user = await db.execute(`SELECT user_id, username, password 
        FROM users 
        WHERE username = '${username}'`);

        if (user[0].length === 0) {
          return done(null, false, { message: "Username is incorrect" });
        }

        const userObj = Object.assign({}, Object.values(user[0])[0]);

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
    const user = await db.execute(`SELECT username, email, account_type 
      FROM users WHERE user_id = '${id}'`);

    const userObj = Object.assign({}, Object.values(user[0])[0]);

    done(null, userObj);
  } catch (err) {
    done(err, false);
  }
});
module.exports = passport;
