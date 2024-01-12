import pp from '../utilities/auth.mjs'
import { pathCSS,pathAssets } from '../utilities/config.mjs';
import { paramsExist } from '../utilities/validators/paramsExist.mjs';
import bcrypt from 'bcrypt'
import { containsHTML,escapeSQL } from '../utilities/helpers/sanitizers.mjs';
import {v4 as uuidv4} from 'uuid';
import {AppError} from '../utilities/AppError.mjs';
import { getDatabase } from '../utilities/db/mysql-connect.mjs';
import { getUserById } from '../utilities/helpers/authHelpers.mjs';
import { createEmail,sendEmail } from '../utilities/email/Email.mjs';
import { USER_COLS } from '../utilities/globals/user.mjs';
const {USERNAME,EMAIL,concat_user_columns} = USER_COLS;

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

/**
 * Renders the Login Page
 * @param {*} req
 * @param {*} res
 */
const renderLogin = (req, res) => {
  if (res.locals.error.length > 0) {
    res.status(401);
  }
  const pageStyles = `${pathCSS}user/loginRegister.css`;
  res.render("login", { title: "Login", 
    pageStyles, 
    pathCSS, 
    pathAssets, 
    user: req.user
  });
}
/**
 * Logs in the user using Passport. If successful, redirect to originally requested URL
 * @param {*} req
 * @param {*} res
 * @param next
 */
const loginUser = async (req, res, next) => {
  let url = "/";
  if (req.session.prevUrl) {
    url = (req.session === "/auth/login") ? "/" : req.session.prevUrl;
  }

  pp.authenticate("local", {
    successRedirect: url,
    failureRedirect: "/auth/login",
    failureFlash: true,
  })(req, res, next);
}
/**
 * Logs the user out
 * @param {*} req
 * @param {*} res
 */
const logoutUser = (req, res, next) => {
  req.logout((err) => {if (err) next(err)});
  res.redirect("/");
}
/**
 * Renders the Registration Page
 * @param {*} req
 * @param {*} res
 */
const renderRegistration = (req, res) => {
  const pageStyles = `${pathCSS}user/loginRegister.css`;
  if (res.locals.error.length > 0) {
    if (res.locals?.error[0].includes('is required')) {
      res.status(422);
    }
  }
  res.render("register", { title: "Register", 
    pageStyles, 
    pathCSS, 
    pathAssets, 
    user: req.user
  });
}
const registerUser = async (req, res, next) => {
  const exist = paramsExist([
    req.body.reg,
    req.body.reg?.username,
    req.body.reg?.email,
    req.body.reg?.password
  ]);
  if (exist) {
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
      const sql = `SELECT COUNT(username) FROM users WHERE username = ?`;
      const values = [req.body.reg.username];

      results = await db.execute(sql,values);
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
      const sqlTwo = `SELECT COUNT(email) FROM users WHERE email = ?`;
      const valuesTwo = [req.body.reg.email];

      results = await db.execute(sqlTwo,valuesTwo);
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
      id = uuidv4();
      maxSearch++;

      try {
        const sqlThree = `SELECT COUNT(user_id) FROM users WHERE user_id = ?`;
        const valuesThree = [id];
        final = await db.execute(sqlThree,valuesThree);

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
    let key = uuidv4();

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
      const sqlFour = `CALL registerUser(?,?,?,?,?,?,?)`;
      const valuesFour = [newUser.user_id,newUser.username,newUser.email,newUser.pass,newUser.profile_pic,newUser.pic_filename,newUser.key];

      await db.execute(sqlFour,valuesFour);
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
    
    const email = createEmail(newUser.email,subject,txtBody,htmlBody);
    let result = await sendEmail(email);
    if (result instanceof AppError) {
      return next(new AppError(500,'Error Sending Email'));
    }

    req.flash("success","An email was sent with a confirmation link!");
    res.redirect("/");
  }
  else {
    req.flash("error","Please fill out the form.");
    res.redirect("/");
  }
  
}
const verifyEmail = async(req,res,next)=>{
  const exist = paramsExist([
    req.params.userId,
    req.params.key
  ]);
  if (exist) {
    const userId = escapeSQL(req.params.userId.toString());
    const key = escapeSQL(req.params.key.toString());
    
    try{
      const db = await getDatabase();
      const cols = concat_user_columns([USERNAME,EMAIL]);
      const user = await getUserById(userId,cols);

      const sql = `CALL verifyEmail(?,?)`;
      const values = [userId,key];
      
      let result = await db.execute(sql,values);
      
      const subject = `Welcome to Programming Help, ${user.username}`;
      const txtBody = `Thanks for joining our site. We hope you have a great time!`;
      const htmlBody = `Thanks for joining our site. We hope you have a great time!`;

      const email = createEmail(user.email,subject,txtBody,htmlBody);
      result = await sendEmail(email);
      if (result instanceof AppError) {
        return next(new AppError(500,`Error Sending Email`));
      }
      
      req.flash("success","Email successfully validated!");
      res.redirect("/");
    }catch(err){
      req.flash("error","Error validating email.");
      res.redirect("/");
    }
  }
  else {
    res.json({response:'error',message:'Arguments not provided.'});
  }
}
export {renderLogin,loginUser,logoutUser,renderRegistration,registerUser,verifyEmail};