const pp = require("../utilities/auth");
const {pathCSS} = require('../utilities/config');
const bcrypt = require("bcrypt");
const { escapeHTML, containsHTML, escapeSQL } = require("../utilities/helpers/sanitizers");
const uuid = require("uuid");
const AppError = require("../utilities/AppError");
const { getDatabase } = require("../utilities/mysql-connect");
const {getUserById} = require("../utilities/helpers/authHelpers");
const {sendEmail} = require("../utilities/email/Email");
const {
  USER_ID,
  USERNAME,
  EMAIL,
  concat_user_columns
} = require("../utilities/globals/user");

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
    let url = "/";
    if (req.session.prevUrl) {
      url = (req.session === "/login") ? "/" : req.session.prevUrl;
    }

    pp.authenticate("local", {
      successRedirect: url,
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
      res.redirect("/auth/register");
      return;
    }
    const pw = await generatePassword(req.body.reg.password);

    /**
     * Generated ID for new user using UUID
     */
    let id;
    /**
     * Guard for number of attempts to see if generated ID is taken
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
    /**
     * Key used to confirm registration via email
     */
    let key = uuid.v4();

    let newUser = {
      user_id:id,
      username:req.body.reg.username,
      email:req.body.reg.email,
      pass:pw,
      profile_pic:process.env.DEFAULT_PROFILE_PIC,
      pic_filename:process.env.DEFAULT_PIC_FILENAME,
      key:key
    }

    try {
      await db.execute(`CALL registerUser('${newUser.user_id}',
        '${newUser.username}',
        '${newUser.email}',
        '${newUser.pass}',
        '${newUser.profile_pic}',
        '${newUser.pic_filename}',
        '${newUser.key}')`);
    } catch (err) {
      return next(
        new AppError(500, `Database Insertion Error: ${err.message}`)
      );
    }

    let domain = `https://${process.env.DOMAIN_PUBLIC}`;
    if (process.env.NODE_ENV == 'development') {
      domain = `http://${process.env.DOMAIN_PRIVATE}:${process.env.PORT}`
    }
  
    const subject = `Email Verification`;
    const txtBody = `Please confirm your registration by clicking here: ${domain}/auth/${newUser.user_id}/verify/${newUser.key}`;
    const htmlBody = `Please confirm your registration by clicking here: <a href="${domain}/auth/${newUser.user_id}/verify/${newUser.key}">${domain}/auth/${newUser.user_id}/verify/${newUser.key}</a>`;
    
    let result = await sendEmail(newUser.email,subject,txtBody,htmlBody);
    if (result instanceof AppError) {
      return next(500,`Error Sending Email`);
    }
    

    req.flash("success","An email was sent with a confirmation link!");
    res.redirect("/");
  },
  verifyEmail:async(req,res,next)=>{
    const userId = escapeSQL(req.params.userId.toString());
    const key = escapeSQL(req.params.key.toString());
    
    try{
      const db = await getDatabase();
      const cols = concat_user_columns([USERNAME,EMAIL]);
      const user = await getUserById(userId,cols);
      
      let result = await db.execute(`CALL verifyEmail('${userId}','${key}')`);
      

      const subject = `Welcome to Programming Help, ${user.username}`;
      const txtBody = `Thanks for joining our site. We hope you have a great time!`;
      const htmlBody = `Thanks for joining our site. We hope you have a great time!`;
      result = await sendEmail(user.email,subject,txtBody,htmlBody);
      if (result instanceof AppError) {
        return next(500,`Error Sending Email`);
      }
      
      req.flash("success","Email successfully validated!");
      res.redirect("/");
    }catch(err){
      req.flash("error","Error validating email.");
      res.redirect("/");
    }
  }
};
