import { ApiResponse } from '../utilities/ApiResponse.mjs';
import {pp} from '../utilities/ppStrategies.mjs'
import jwt from 'jsonwebtoken'
import { pathCSS,pathAssets } from '../utilities/publicPath.mjs';
import { paramsExist } from '../utilities/validators/paramsExist.mjs';
import bcrypt from 'bcrypt'
import { containsHTML } from '../utilities/helpers/sanitizers.mjs';
import {v4 as uuidv4} from 'uuid';
import {AppError} from '../utilities/AppError.mjs';
import { getDatabase } from '../utilities/db/mysql-connect.mjs';
import { getUserById } from '../utilities/helpers/authHelpers.mjs';
import { createEmail,sendEmail } from '../utilities/email/Email.mjs';
import { USER_COLS } from '../utilities/globals/user.mjs';
const {USERNAME,EMAIL,concat_user_columns} = USER_COLS;
import { 
  NODE_ENV, 
  PORT,
  COOKIE_SECRET,
  DEFAULT_PROFILE_PIC,
  DEFAULT_PIC_FILENAME,
  DOMAIN_PUBLIC,
  DOMAIN_PRIVATE
} from '../utilities/config.mjs';

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
  /* if (res.locals.error.length > 0) {
    res.status(401);
  } */
  if (req.user) {
    res.redirect(`/user/${req.user.username}/dashboard`);
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
 * Logs in the user using Passport. If successful, returns token data to client app
 * @param {*} req
 * @param {*} res
 * @param next
 */
const login = async (req, res, next) => {
  const Response = new ApiResponse('error',500,'Something went wrong');
  let url = "/";
  pp.authenticate('login', async (err,user,info) => {
    if (err) {
        Response.setMessage = `Login Error: ${err.message}`;
    }
    else if (!user) {
      Response.setMessage = 'No applicable user.';
    }
    else {
        const body = {user_id:user.user_id, email:user.email, username:user.username, pic_url:user.pic_url};
        const token = jwt.sign(body,COOKIE_SECRET,{expiresIn:"1hr"});
        res.cookie('token',token,{
            httpOnly:true,
            secure: (NODE_ENV === 'production') ? true : false,
            maxAge:1000*60*60,
            sameSite:'Strict',
            signed:true
        });
        Response.setApiResponse('success',200,'Successfully logged in.',url,body);
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
  })(req,res,next);
}
/**
 * Logs in the user using Passport. If successful, redirect to originally requested URL
 * @param {*} req
 * @param {*} res
 * @param next
 */
const loginUser = async (req, res, next) => {
  let url = "/";
  pp.authenticate('login', async (err,user,info) => {
    if (err) {
        next(new AppError(500,`Login Error: ${err.message}`));
    }
    else if (!user) {
        res.redirect('/auth/login');
    }
    else {
        const body = {user_id:user.user_id, email:user.email, username:user.username, pic_url:user.pic_url};
        const token = jwt.sign(body,COOKIE_SECRET,{expiresIn:"1hr"});
        res.cookie('token',token,{
            httpOnly:true,
            secure: (NODE_ENV === 'production') ? true : false,
            maxAge:1000*60*60,
            sameSite:'Strict',
            signed:true
        });
        res.redirect(url);
    }
  })(req,res,next);
}
/**
 * Logs the user out
 * @param {*} req
 * @param {*} res
 */
const logoutUser = (req, res, next) => {
  res.clearCookie('token');
  res.redirect("/");
}
/**
 * Logs the user out
 * @param {*} req
 * @param {*} res
 */
const logout = (req, res, next) => {
  const Response = new ApiResponse('error',500,'Something went wrong.');
  try {
    res.clearCookie('token');
    Response.setApiResponse('success',200,'Successfully logged out.','/');
  }
  catch(err) {
    Response.applyMessage(err.message,'Error logging out.');
  }
  
  res.status(Response.getStatus).json(Response.getApiResponse());
}
/**
 * Renders the Registration Page
 * @param {*} req
 * @param {*} res
 */
const renderRegistration = (req, res) => {
  const pageStyles = `${pathCSS}user/loginRegister.css`;
  /* if (res.locals.error.length > 0) {
    if (res.locals?.error[0].includes('is required')) {
      res.status(422);
    }
  } */
  res.render("register", { title: "Register", 
    pageStyles, 
    pathCSS, 
    pathAssets, 
    user: req.user
  });
}
const registerUser = async (req, res, next) => {
  const exist = paramsExist([
    req.body.username,
    req.body.email,
    req.body.password
  ]);
  if (exist) {
    if (containsHTML(req.body.username))
      return next(new AppError(400, "No HTML Allowed in username!"));
    if (containsHTML(req.body.email))
      return next(new AppError(400, "No HTML Allowed in email!"));
    if (containsHTML(req.body.password))
      return next(new AppError(400, "No HTML Allowed in password!"));

    const db = await getDatabase();
    if (db instanceof AppError) return next(db);

    let exists = false;
    let results;
    let final;

    try {
      const sql = `SELECT COUNT(username) FROM users WHERE username = ?`;
      const values = [req.body.username];

      results = await db.execute(sql,values);
      final = results[0].map((o) => Object.assign({}, o));
      Object.values(final[0])[0] == 1 ? (exists = true) : (exists = false);
    } catch (err) {
      return next(new AppError(500, `Database Error: ${err.message}`));
    }

    if (exists) {
      res.redirect("/auth/register");
      return;
    }

    try {
      const sqlTwo = `SELECT COUNT(email) FROM users WHERE email = ?`;
      const valuesTwo = [req.body.email];

      results = await db.execute(sqlTwo,valuesTwo);
      final = results[0].map((o) => Object.assign({}, o));
      Object.values(final[0])[0] == 1 ? (exists = true) : (exists = false);
    } catch (err) {
      return next(new AppError(500, `Database Error: ${err.message}`));
    }

    if (exists) {
      res.redirect("/auth/register");
      return;
    }
    const pw = await generatePassword(req.body.password);

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
      username:req.body.username,
      email:req.body.email,
      pass:pw,
      profile_pic:DEFAULT_PROFILE_PIC,
      pic_filename:DEFAULT_PIC_FILENAME,
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
    
    let domain = `https://${DOMAIN_PUBLIC}`;
    if (NODE_ENV == 'development') {
      domain = `http://${DOMAIN_PRIVATE}:${PORT}`
    }

    const subject = `Email Verification`;
    const txtBody = `Please confirm your registration by clicking here: ${domain}/auth/${newUser.user_id}/verify/${newUser.key}`;
    const htmlBody = `Please confirm your registration by clicking here: <a href="${domain}/auth/${newUser.user_id}/verify/${newUser.key}">${domain}/auth/${newUser.user_id}/verify/${newUser.key}</a>`;
    
    const email = createEmail(newUser.email,subject,txtBody,htmlBody);
    let result = await sendEmail(email);
    if (result instanceof AppError) {
      return next(new AppError(500,'Error Sending Email'));
    }

    res.redirect("/");
  }
  else {
    res.redirect("/");
  }
  
}
const verifyEmail = async(req,res,next)=>{
  const exist = paramsExist([
    req.params.userId,
    req.params.key
  ]);
  if (exist) {
    const userId = req.params.userId.toString();
    const key = req.params.key.toString();
    
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
      
      res.redirect("/");
    }catch(err){
      res.redirect("/");
    }
  }
  else {
    res.json({response:'error',message:'Arguments not provided.'});
  }
}
export {
  renderLogin,
  login,
  loginUser,
  logoutUser,
  logout,
  renderRegistration,
  registerUser,
  verifyEmail
};