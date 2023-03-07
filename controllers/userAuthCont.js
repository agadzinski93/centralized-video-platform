const pp = require("../utilities/auth");
const {pathCSS} = require('../utilities/config');
const bcrypt = require("bcrypt");
const { escapeHTML, containsHTML } = require("../utilities/helpers/sanitizers");
const uuid = require("uuid");
const AppError = require("../utilities/AppError");
const { getDatabase } = require("../utilities/mysql-connect");

/**
 * Hashes the password submitted by user
 * @param pw - original password submitted by user
 * @returns - hashed password
 */
const generatePassword = async (pw) => {
  const salt = await bcrypt.genSalt(11);
  const hash = await bcrypt.hash(pw, salt);
  return hash;
};

module.exports = {
  /**
   * Renders the Login Page
   * @param {*} req
   * @param {*} res
   */
  renderLogin: (req, res) => {
    const pageStyles = `${pathCSS}user/loginRegister.css`;
    res.render("login", { title: "Login", pageStyles, pathCSS, user: req.user });
  },
  /**
   * Logs in the user using Passport. If successful, redirect to originally requested URL
   * @param {*} req
   * @param {*} res
   * @param next
   */
  loginUser: async (req, res, next) => {
    let successUrl = req.cookies.requestUrl || "/login";

    if (successUrl === "/login") successUrl = "/";

    pp.authenticate("local", {
      successRedirect: successUrl,
      failureRedirect: "/auth/login",
      failureFlash: true,
    })(req, res, next);
  },
  /**
   * Logs the user out
   * @param {*} req
   * @param {*} res
   */
  logoutUser: (req, res, next) => {
    req.logout((err) => {if (err) next(err)});
    res.redirect("/");
  },
  /**
   * Renders the Registration Page
   * @param {*} req
   * @param {*} res
   */
  renderRegistration: (req, res) => {
    const pageStyles = `${pathCSS}user/loginRegister.css`;
    res.render("register", { title: "Register", pageStyles, pathCSS, user: req.user });
  },
  registerUser: async (req, res, next) => {
    if (containsHTML(req.body.reg.username))
      return next(new AppError(400, "No HTML Allowed in username!"));
    if (containsHTML(req.body.reg.email))
      return next(new AppError(400, "No HTML Allowed in email!"));
    if (containsHTML(req.body.reg.password))
      return next(new AppError(400, "No HTML Allowed in password!"));

    const db = await getDatabase();
    if (db instanceof AppError) return next(db);

    let exists = false;
    let results;
    let final;

    try {
      results = await db.execute(
        `SELECT COUNT(username) FROM users WHERE username = '${req.body.reg.username}' LIMIT 1`
      );
      final = results[0].map((o) => Object.assign({}, o));
      Object.values(final[0])[0] == 1 ? (exists = true) : (exists = false);
    } catch (err) {
      return next(new AppError(500, `Database Error: ${err.message}`));
    }

    if (exists) {
      req.flash("error", "Username Already Exists");
      res.redirect("/auth/register");
      return;
    }

    try {
      results = await db.execute(
        `SELECT COUNT(email) FROM users WHERE email = '${req.body.reg.email}' LIMIT 1`
      );
      final = results[0].map((o) => Object.assign({}, o));
      Object.values(final[0])[0] == 1 ? (exists = true) : (exists = false);
    } catch (err) {
      return next(new AppError(500, `Database Error: ${err.message}`));
    }

    if (exists) {
      req.flash("error", "Email Already Exists");
      res.redirect("/register");
      return;
    }
    const pw = await generatePassword(req.body.reg.password);

    /**
     * id - Generated ID for new user using UUID
     */
    let id;
    /**
     * maxSearch - Guard for number of attempts to see if generated ID is taken
     */
    let maxSearch = 0;

    do {
      id = uuid.v4();
      maxSearch++;

      try {
        final = await db.execute(
          `SELECT COUNT(user_id) FROM users WHERE user_id = '${id}' LIMIT 1`
        );

        final = results.map((r) => Object.assign({}, r));
        Object.values(final[0])[0] == 1 ? (exists = true) : (exists = false);
      } catch (err) {
        exists = false;
        return next(new AppError(500, `Database Error: ${err.message}`));
      }
    } while (exists && maxSearch <= 5);

    try {
      await db.execute(
        `INSERT INTO users (user_id, username, email, password, account_type, pic_url, pic_filename) 
          VALUES(
            '${id}',
            '${req.body.reg.username}',
            '${req.body.reg.email}',
            '${pw}',
            'admin',
            '${process.env.DEFAULT_PROFILE_PIC}',
            '${process.env.DEFAULT_PIC_FILENAME}'
        )`
      );
    } catch (err) {
      return next(
        new AppError(500, `Database Insertion Error: ${err.message}`)
      );
    }

    pp.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/auth/register",
      failureFlash: true,
    })(req, res, next);
  },
};
