const passport = require("passport");
const localStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const db = require("./mysql-connect");

passport.use(
  new localStrategy((username, password, done) => {
    db.query(
      `SELECT user_id, username, password 
    FROM users 
    WHERE username = '${username}'`,
      (err, user, fields) => {
        if (err) {
          return done(err);
        }
        const userObj = user.map((u) => Object.assign({}, u));
        if (typeof userObj[0] === "undefined") {
          return done(null, false, {
            message: "Incorrect username",
          });
        }
        bcrypt.compare(password, userObj[0].password, (err, isMatch) => {
          if (err) {
            return done(err);
          }
          if (isMatch) {
            return done(null, userObj[0]);
          } else {
            return done(null, false, { message: "Password incorrect" });
          }
        });
      }
    );
  })
);
passport.serializeUser(function (user, done) {
  done(null, user.user_id);
});
passport.deserializeUser(function (id, done) {
  db.query(
    `SELECT username, email, account_type 
    FROM users WHERE user_id = ${id}`,
    (err, user) => {
      const userObj = user.map((u) => Object.assign({}, u));
      done(err, userObj[0]);
    }
  );
});
module.exports = passport;
