import { ApiResponse } from '../utilities/ApiResponse';
import { userLogger } from '../utilities/logger';
import { pp } from '../utilities/ppStrategies'
import jwt from 'jsonwebtoken'
import { paramsExist } from '../utilities/validators/paramsExist';
import bcrypt from 'bcrypt'
import { containsHTML } from '../utilities/helpers/sanitizers';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utilities/AppError';
import { getDatabase } from '../utilities/db/mysql-connect';
import { getUserById, usernameExists, emailExists } from '../utilities/helpers/authHelpers';
import { createEmail, sendEmail } from '../utilities/email/Email';
import { USER_COLS } from '../utilities/globals/user';
const { USERNAME, EMAIL, concat_user_columns } = USER_COLS;
import {
  NODE_ENV,
  PORT,
  CLIENT_PORT,
  PATH_CSS,
  PATH_ASSETS,
  API_PATH,
  COOKIE_SECRET,
  DEFAULT_PROFILE_PIC,
  DEFAULT_PIC_FILENAME,
  DOMAIN_PUBLIC,
  DOMAIN_PRIVATE
} from '../utilities/config/config';

import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';

/**
 * Hashes the password submitted by user
 * @param pw - original password submitted by user
 * @returns - hashed password
 */
const generatePassword = async (pw: string) => {
  const salt = await bcrypt.genSalt(11);
  const hash = await bcrypt.hash(pw, salt);
  return hash;
};

/**
 * Renders the Login Page
 * @param {*} req
 * @param {*} res
 */
const renderLogin = (req: Request, res: Response) => {
  /* if (res.locals.error.length > 0) {
    res.status(401);
  } */
  if (req.user) {
    res.redirect(`/user/${req.user.username}/dashboard`);
  }
  const pageStyles = `${PATH_CSS}user/loginRegister.css`;
  res.render("login", {
    title: "Login",
    pageStyles,
    PATH_CSS,
    PATH_ASSETS,
    API_PATH,
    user: req.user
  });
}
/**
 * Logs in the user using Passport. If successful, returns token data to client app
 * @param {*} req
 * @param {*} res
 * @param next
 */
const loginUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const Response = new ApiResponse('error', 500, 'Something went wrong');
  let url = "/";
  pp.authenticate('login', { session: false }, async (err: Error, user: any, info: any) => {
    if (err) {
      Response.setMessage = `Login Error: ${err.message}`;
    }
    else if (!user) {
      if (info && info.message && ['Account has not been activated. Please check your email for confirmation link.', 'Account has been disabled.'].some(msg => msg === info.message)) {
        return next(new AppError(403, info.message));
      } else {
        return next(new AppError(400, 'No applicable user.'));
      }
    }
    else {
      const body = { user_id: user.user_id, email: user.email, username: user.username, pic_url: user.pic_url };
      const token = (COOKIE_SECRET) && jwt.sign(body, COOKIE_SECRET, { expiresIn: "1hr" });
      res.cookie('token', token, {
        httpOnly: true,
        secure: (NODE_ENV === 'production') ? true : false,
        maxAge: 1000 * 60 * 60,
        sameSite: 'lax',
        signed: true
      });
      Response.setApiResponse('success', 200, 'Successfully logged in.', url, body);
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
  })(req, res, next);
}
/**
 * Logs in the user using Passport. If successful, returns JWT for use in Authorization header
 * @param {*} req
 * @param {*} res
 * @param next
 */
const loginApiUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const Response = new ApiResponse('error', 500, 'Something went wrong');
  let url = "/";
  pp.authenticate('login', { session: false }, async (err: Error, user: any, info: any) => {
    if (err) {
      Response.setMessage = `Login Error: ${err.message}`;
    }
    else if (!user) {
      if (info && info.message && ['Account has not been activated. Please check your email for confirmation link.', 'Account has been disabled.'].some(msg => msg === info.message)) {
        return next(new AppError(403, info.message));
      } else {
        return next(new AppError(401, 'No applicable user.'));
      }
    }
    else {
      const body = { user_id: user.user_id, email: user.email, username: user.username, pic_url: user.pic_url };
      const token = (COOKIE_SECRET) && jwt.sign(body, COOKIE_SECRET, { expiresIn: "1hr" });
      Response.setApiResponse('success', 200, 'Successfully logged in.', url, { token });
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
  })(req, res, next);
}
/**
 * Logs in the user using Passport. If successful, redirect to originally requested URL
 * @param {*} req
 * @param {*} res
 * @param next
 */
const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let url = (NODE_ENV === 'production') ? API_PATH : '/';
  pp.authenticate('login', { session: false }, async (err: Error, user: any, info: any) => {
    if (err) {
      next(new AppError(500, `Login Error: ${err.message}`));
    }
    else if (!user) {
      res.redirect(`${API_PATH}/auth/login`);
    }
    else {
      const body = { user_id: user.user_id, email: user.email, username: user.username, pic_url: user.pic_url };
      const token = (COOKIE_SECRET) && jwt.sign(body, COOKIE_SECRET, { expiresIn: "1hr" });
      res.cookie('token', token, {
        httpOnly: true,
        secure: (NODE_ENV === 'production') ? true : false,
        maxAge: 1000 * 60 * 60,
        sameSite: 'strict',
        signed: true
      });
      res.redirect(url);
    }
  })(req, res, next);
}
const getUserCredentials = (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Error retrieving user credentials.');
  try {
    if (req.user) {
      Response.setApiResponse('success', 200, 'Successfully retrieved user credentials.', '/',
        { user_id: req.user.user_id, username: req.user.username, email: req.user.email, google_id: req.user.google_id, pic_url: req.user.pic_url });
    }
    else {
      Response.setStatus = 401;
    }
  } catch (err) {
    Response.applyMessage((err as Error).message, 'Error retrieving user credentials.');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
/**
 * Logs the user out
 * @param {*} req
 * @param {*} res
 */
const logout = (req: Request, res: Response, next: NextFunction) => {
  const url = (NODE_ENV === 'production') ? API_PATH : '/';

  req.logout((err) => {
    if (err) return next(err);
    res.clearCookie('token');
    res.redirect(url);
  });

}
/**
 * Logs the user out
 * @param {*} req
 * @param {*} res
 */
const logoutUser = (req: Request, res: Response, next: NextFunction) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.');
  req.logout((err) => {
    if (err) {
      Response.setApiResponse('error', 500, 'Error logging out.');
      res.status(Response.getStatus).json(Response.getApiResponse());
    } else {
      req.session.destroy((err) => {
        if (err) {
          Response.setApiResponse('error', 500, 'Error deleting session.');
          res.status(Response.getStatus).json(Response.getApiResponse());
        } else {
          res.clearCookie('connect.sid');
          res.clearCookie('token');
          Response.setApiResponse('success', 200, 'Successfully logged out.', '/');
          res.status(Response.getStatus).json(Response.getApiResponse());
        }
      })
    }
  });
}
/**
 * Renders the Registration Page
 * @param {*} req
 * @param {*} res
 */
const renderRegistration = (req: Request, res: Response) => {
  const pageStyles = `${PATH_CSS}user/loginRegister.css`;
  /* if (res.locals.error.length > 0) {
    if (res.locals?.error[0].includes('is required')) {
      res.status(422);
    }
  } */
  res.render("register", {
    title: "Register",
    pageStyles,
    PATH_CSS,
    PATH_ASSETS,
    API_PATH,
    user: req.user
  });
}
const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const url = (NODE_ENV === 'production') ? API_PATH : '/';
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

    if (await usernameExists(req.body.username)) {
      res.status(400).redirect("/auth/register");
      return;
    }

    try {
      const sqlTwo = `SELECT COUNT(email) FROM users WHERE email = ?`;
      const valuesTwo = [req.body.email];

      results = await db.execute<RowDataPacket[]>(sqlTwo, valuesTwo);
      final = results[0].map((o) => Object.assign({}, o));
      Object.values(final[0])[0] == 1 ? (exists = true) : (exists = false);
    } catch (err) {
      return next(new AppError(500, `Database Error: ${(err as Error).message}`));
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
        final = await db.execute(sqlThree, valuesThree);

        final = results.map((r) => Object.assign({}, r));
        Object.values(final[0])[0] == 1 ? (exists = true) : (exists = false);
      } catch (err) {
        exists = false;
        return next(new AppError(500, `Database Error: ${(err as Error).message}`));
      }
    } while (exists && maxSearch <= 5);
    /**
     * Key used to confirm registration via email
     */
    let key = uuidv4();

    let newUser = {
      user_id: id,
      username: req.body.username,
      email: req.body.email,
      pass: pw,
      profile_pic: DEFAULT_PROFILE_PIC,
      pic_filename: DEFAULT_PIC_FILENAME,
      key: key
    }

    try {
      const sqlFour = `CALL registerUser(?,?,?,?,?,?,?)`;
      const valuesFour = [newUser.user_id, newUser.username, newUser.email, newUser.pass, newUser.profile_pic, newUser.pic_filename, newUser.key];

      await db.execute(sqlFour, valuesFour);
    } catch (err) {
      return next(
        new AppError(500, `Database Insertion Error: ${(err as Error).message}`)
      );
    }

    let domain = `https://${DOMAIN_PUBLIC}`;
    if (NODE_ENV == 'development') {
      domain = `http://${DOMAIN_PRIVATE}:${PORT}`
    }

    const subject = `Email Verification`;
    const txtBody = `Please confirm your registration by clicking here: ${domain}/auth/${newUser.user_id}/verify/${newUser.key}`;
    const htmlBody = `Please confirm your registration by clicking here: <a href="${domain}/auth/${newUser.user_id}/verify/${newUser.key}">${domain}/auth/${newUser.user_id}/verify/${newUser.key}</a>`;

    const email = createEmail(newUser.email, subject, txtBody, htmlBody);
    let result = await sendEmail(email);
    if (result instanceof AppError) {
      return next(new AppError(500, 'Error Sending Email'));
    }

    res.redirect(url);
  }
  else {
    res.redirect(url);
  }
}
const registerUser = async (req: Request, res: Response): Promise<void> => {
  const Response = new ApiResponse('error', 500, 'Error registering user.');
  const { username, email, password } = req.body;
  try {
    if (paramsExist([username, email, password])) {
      if (containsHTML(username))
        throw new AppError(400, "No HTML Allowed in username!");
      if (containsHTML(email))
        throw new AppError(400, "No HTML Allowed in email!");
      if (containsHTML(password))
        throw new AppError(400, "No HTML Allowed in password!");

      const db = await getDatabase();
      if (db instanceof AppError) throw new AppError(db.status, db.message);

      const usernameOutput = await usernameExists(username);
      if (usernameOutput instanceof AppError) throw usernameOutput;
      if (usernameOutput) throw new AppError(400, 'Username already exists.');

      const emailOutput = await emailExists(email);
      if (emailOutput instanceof AppError) throw emailOutput;
      if (emailOutput) throw new AppError(400, 'Email already exists.');

      const pw = await generatePassword(req.body.password);

      let id = uuidv4();
      let key = uuidv4();

      let newUser = {
        user_id: id,
        username: username,
        email,
        pass: pw,
        profile_pic: DEFAULT_PROFILE_PIC,
        pic_filename: DEFAULT_PIC_FILENAME,
        key: key
      }

      const sqlFour = `CALL registerUser(?,?,?,?,?,?,?)`;
      const valuesFour = [newUser.user_id, newUser.username, newUser.email, newUser.pass, newUser.profile_pic, newUser.pic_filename, newUser.key];

      await db.execute(sqlFour, valuesFour);

      let domain = `https://${DOMAIN_PUBLIC}`;
      if (NODE_ENV !== 'production') {
        domain = `http://${DOMAIN_PRIVATE}:${CLIENT_PORT}`
      }

      const subject = `Email Verification`;
      const txtBody = `Please confirm your registration by clicking here: ${domain}/auth/${newUser.user_id}/verifyEmail/${newUser.key}`;
      const htmlBody = `Please confirm your registration by clicking here: <a href="${domain}/auth/${newUser.user_id}/verifyEmail/${newUser.key}">${domain}/auth/${newUser.user_id}/verifyEmail/${newUser.key}</a>`;

      const emailMessage = createEmail(newUser.email, subject, txtBody, htmlBody);
      let result = await sendEmail(emailMessage);
      if (result instanceof AppError) throw result;

      Response.setApiResponse('success', 201, 'Registration successful! Please verify your email to continue.');
    } else {
      Response.setStatus = 422;
      Response.setMessage = 'Invalid arguments.'
    }
  } catch (err) {
    Response.applyMessage((err as Error).message, 'Error registering user.');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const verifyEmail = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const url = (NODE_ENV === 'production') ? API_PATH : '/';
  const exist = paramsExist([
    req.params.userId,
    req.params.key
  ]);
  if (exist) {
    const userId = req.params.userId.toString();
    const key = req.params.key.toString();

    try {
      const db = await getDatabase();
      if (db instanceof AppError) throw new Error(db.message);
      const cols = concat_user_columns([USERNAME, EMAIL]);
      const user = await getUserById(userId, cols);
      if (user instanceof AppError) throw new Error(user.message);

      const sql = `CALL verifyEmail(?,?)`;
      const values = [userId, key];

      let result = await db.execute<RowDataPacket[]>(sql, values);
      if (result instanceof AppError) {
        return next(new AppError(500, `Error Verifying Email`));
      }

      const subject = `Welcome to Programming Help, ${user.username}`;
      const txtBody = `Thanks for joining our site. We hope you have a great time!`;
      const htmlBody = `Thanks for joining our site. We hope you have a great time!`;

      const email = createEmail(user.email, subject, txtBody, htmlBody);
      const sendResult = await sendEmail(email);
      if (sendResult instanceof AppError) {
        return next(new AppError(500, `Error Sending Email`));
      }

      res.redirect(url);
    } catch (err) {
      res.redirect(url);
    }
  }
  else {
    res.json({ response: 'error', message: 'Arguments not provided.' });
  }
}
const verifyEmailAccount = async (req: Request, res: Response): Promise<void> => {
  const Response = new ApiResponse('error', 500, 'Error verifying email.');
  const { userId, key } = req.params;
  try {
    if (paramsExist([userId, key])) {
      const db = await getDatabase();
      if (db instanceof AppError) throw new AppError(db.status, db.message);
      const cols = concat_user_columns([USERNAME, EMAIL]);
      const user = await getUserById(userId, cols);
      if (user instanceof AppError) throw new AppError(user.status, user.message);

      const sql = `CALL verifyEmail(?,?)`;
      const values = [userId, key];

      let result = await db.execute<RowDataPacket[]>(sql, values);
      if (result instanceof AppError) {
        throw new AppError(result.status, result.message);
      }

      const subject = `Welcome to Programming Help, ${user.username}`;
      const txtBody = `Thanks for joining our site. We hope you have a great time!`;
      const htmlBody = `Thanks for joining our site. We hope you have a great time!`;

      const email = createEmail(user.email, subject, txtBody, htmlBody);
      const sendResult = await sendEmail(email);
      if (sendResult instanceof AppError) throw new AppError(sendResult.status, sendResult.message);

      Response.setApiResponse('success', 200, 'Email has been verified.');
    } else {
      Response.setStatus = 422;
      Response.setMessage = 'Invalid WHAT arguments.'
    }
  } catch (err) {
    if (err instanceof AppError) Response.setStatus = err.status;
    Response.applyMessage((err as Error).message, 'Error verifying email.');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const registerUserGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const Response = new ApiResponse('error', 500, 'Error registering user with Google.');
  try {
    if (req.signedCookies["tmp_user"]) res.clearCookie("tmp_user");
    const { username, email, google_id } = req.body;
    if (paramsExist([username, email, google_id])) {
      const { username } = req.body;
      const db = await getDatabase();
      if (db instanceof AppError) throw new AppError(db.status, db.message);

      let id = uuidv4();

      const sql = 'CALL registerUserUsingGoogle(?,?,?,?,?,?)';
      const values = [id, username, email, google_id, DEFAULT_PROFILE_PIC, DEFAULT_PIC_FILENAME];
      await db.execute(sql, values);

      const userOutput = {
        user_id: id,
        username: username,
        email: email,
        google_id: google_id,
        pic_url: DEFAULT_PROFILE_PIC,
        pic_filename: DEFAULT_PIC_FILENAME,
        activation_status: 'active'
      }
      Response.setApiResponse('success', 201, 'Successfully registered using Google', '/', userOutput);

    }
    else {
      Response.setStatus = 422;
      Response.setMessage = 'Invalid arguments.'
    }

  } catch (err) {
    Response.applyMessage((err as Error).message, 'Error registering user with Google');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const userExists = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const Response = new ApiResponse('error', 500, 'Error checking availability of username.');
  const { username } = req.body;
  try {
    if (paramsExist([username])) {
      const exists = await usernameExists(username);
      if (exists instanceof AppError) throw new AppError(exists.status, exists.message);

      if (exists) {
        Response.setStatus = 400;
        Response.setMessage = 'Username is taken. Please choose another.'
      } else {
        Response.setApiResponse('success', 200, 'Username available.');
      }
    } else {
      Response.setStatus = 422;
      Response.setMessage = 'Invalid arguments.'
    }

  } catch (err) {
    Response.applyMessage((err as Error).message, 'Error checking availability of username.');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
export {
  renderLogin,
  login,
  loginUser,
  loginApiUser,
  getUserCredentials,
  logoutUser,
  logout,
  renderRegistration,
  register,
  registerUser,
  verifyEmail,
  verifyEmailAccount,
  registerUserGoogle,
  userExists
};