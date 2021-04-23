const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const db = require("../utilities/mysql-connect");
const pp = require("../utilities/auth");
const bcrypt = require("bcrypt");

const generatePassword = async (pw) => {
  const salt = await bcrypt.genSalt(11);
  const hash = await bcrypt.hash(pw, salt);
  return hash;
};

router.get("/login", (req, res) => {
  res.render("login");
});
router.post("/login", async (req, res, next) => {
  pp.authenticate("local", { successRedirect: "/" })(req, res, next);
});
router.get("/logout", (req, res, next) => {
  req.logout();
  res.redirect("/");
});
router.get("/register", (req, res) => {
  res.render("register");
});
router.post("/register", async (req, res) => {
  const pw = await generatePassword(req.body.password);
  let exists = false;
  db.query(
    `SELECT email FROM users WHERE EXISTS email = ${req.body.email}`,
    (err, results, fields) => {
      if (err) {
        message = err;
      }
      exists = results;
    }
  );
  if (exists) {
    res.send(`Email Already Exists`);
    return;
  }
  db.query(
    `INSERT INTO users (username, email, password, account_type) 
      VALUES(
        '${req.body.username}',
        '${req.body.email}',
        '${pw}',
        'admin'
    );`,
    (err, results, fields) => {
      if (err) console.log(`${err}`);
    }
  );
  res.send(`Name: ${req.body.username} Email: ${req.body.email} Pass: ${pw}`);
});

module.exports = router;
