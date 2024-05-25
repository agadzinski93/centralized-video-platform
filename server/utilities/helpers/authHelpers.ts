import { getDatabase } from "../db/mysql-connect";
import { AppError } from "../AppError";
import jwt from 'jsonwebtoken';
import { NODE_ENV, COOKIE_SECRET } from "../config";

import { Response } from "express";
import { UserObject } from "../../types/types";
import { RowDataPacket } from "mysql2";

/**
 * Retrieve all columns for a user
 * @param {string} username username used to identify the proper user
 * @param {string} columns which columns to include in SELECT, separate with commas
 * @returns {Promise<object>} The user object from the database or an error object
 */
const getUser = async (username: string, columns: string = '*'): Promise<AppError | UserObject> => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT ${columns} FROM users WHERE username = ?`;
    const values = [username];

    const user = await db.execute<RowDataPacket[]>(sql, values);

    if (user[0].length === 0) {
      return new AppError(400, "User Doesn't Exist");
    }

    return Object.assign(({} as UserObject), Object.values(user[0])[0]);
  } catch (err) {
    console.log(`Error: ${(err as Error).message}`);
    return new AppError(500, (err as Error).message);
  }
}
/**
 * Retrieve all columns for a user
 * @param {string} id id used to identify the proper user
 * @param {string} columns which columns to include in SELECT, separate with commas
 * @returns {Promise<object>} The user object from the database or an error object
 */
const getUserById = async (id: string, columns: string = '*'): Promise<AppError | UserObject> => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT ${columns} FROM users WHERE user_id = ?`;
    const values = [id];

    const user = await db.execute<RowDataPacket[]>(sql, values);

    if (user[0].length === 0) {
      return new AppError(400, "User Doesn't Exist");
    }

    return Object.assign(({} as UserObject), Object.values(user[0])[0]);
  } catch (err) {
    return new AppError(500, (err as Error).message);
  }
}
/**
 * Retrieve all columns for a user
 * @param {string} google_id id of user associated with their Google account
 * @param {string} email email used when registering via Google OAuth
 * @returns {Promise<object>} The user object from the database or an error object
 */
const getUserByGoogleId = async (google_id: string, email: string): Promise<AppError | UserObject> => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT user_id, username, email, google_id, activation_status, pic_url
      FROM users WHERE google_id = ? AND email = ?`;
    const values = [google_id, email];

    const user = await db.execute<RowDataPacket[]>(sql, values);

    if (user[0].length === 0) {
      return new AppError(400, "User Doesn\'t Exist");
    }

    return Object.assign(({} as UserObject), Object.values(user[0])[0]);
  } catch (err) {
    return new AppError(500, (err as Error).message);
  }
}
const usernameExists = async (username: string): Promise<AppError | boolean> => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT 1 FROM users WHERE username = ?`;
    const values = [username];

    const output = await db.execute<RowDataPacket[]>(sql, values);

    return (output[0].length !== 0);
  } catch (err) {
    return new AppError(500, (err as Error).message)
  }
}
const emailExists = async (email: string): Promise<AppError | boolean> => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT 1 FROM users WHERE email = ?`;
    const values = [email];

    const output = await db.execute<RowDataPacket[]>(sql, values);

    return (output[0].length !== 0);
  } catch (err) {
    return new AppError(500, (err as Error).message)
  }
}
/**
 * Check is the user logged in matches the username in the requested URL
 * @param {string} loggedUsername Username of the user currently logged in
 * @param {string} urlUsername Username of the account in the URL
 * @returns {Promise<boolean|object>} Returns true is usernames match, else returns an error
 */
const usernameMatch = async (loggedUsername: string, urlUsername: string): Promise<AppError | boolean> => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT username FROM users WHERE username = ?`;
    const values = [urlUsername];

    const user = await db.execute<RowDataPacket[]>(sql, values);

    if (user[0].length === 0) {
      return new AppError(400, "User Doesn't Exist");
    }

    const userObj = Object.assign(({} as UserObject), Object.values(user[0])[0]);

    if (loggedUsername === userObj.username) return true;
    else {
      return new AppError(403, "You Are Not Authorized to View This Page");
    }
  } catch (err) {
    return new AppError(500, (err as Error).message);
  }
}
/**
 * 
 * @param {object} res - response object from Express (necessary to access res.cookie)
 * @param {object} user - user profile to update (must include user_id, username, email, and pic_url)
 * @param {object} options - property and value to update on user profile
 */
const updateAuthToken = (res: Response, user: UserObject, { property, value }: { property: string, value: string }) => {
  const body = { ...user, [property]: value };
  const token = COOKIE_SECRET && jwt.sign(body, COOKIE_SECRET, { expiresIn: "1hr" });
  res.cookie('token', token, {
    httpOnly: true,
    secure: (NODE_ENV === 'production') ? true : false,
    maxAge: 1000 * 60 * 60,
    sameSite: 'strict',
    signed: true
  });
}

export { getUser, getUserById, getUserByGoogleId, usernameMatch, usernameExists, emailExists, updateAuthToken };