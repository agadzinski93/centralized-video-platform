import { getDatabase } from "../db/mysql-connect.mjs";
import {AppError} from "../AppError.mjs";

/**
 * Retrieve all columns for a user
 * @param {string} username username used to identify the proper user
 * @param {string} columns which columns to include in SELECT, separate with commas
 * @returns {Promise<object>} The user object from the database or an error object
 */
const getUser = async (username, columns = '*') => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT ${columns} FROM users WHERE username = ?`;
    const values = [username];
    
    const user = await db.execute(sql,values);

    if (user[0].length === 0) {
      return new AppError(400, "User Doesn't Exist");
    }

    return Object.assign({}, Object.values(user[0])[0]);
  } catch (err) {
    console.log(`Error: ${err.message}`);
    return new AppError(500, err.message);
  }
}
/**
 * Retrieve all columns for a user
 * @param {string} id id used to identify the proper user
 * @param {string} columns which columns to include in SELECT, separate with commas
 * @returns {Promise<object>} The user object from the database or an error object
 */
const getUserById = async (id, columns = '*') => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    const user = await db.execute(
      `SELECT ${columns} FROM users WHERE user_id = ?`,
      [id]);

    if (user[0].length === 0) {
      return new AppError(400, "User Doesn't Exist");
    }

    return Object.assign({}, Object.values(user[0])[0]);
  } catch (err) {
    return new AppError(500, err.message);
  }
}
/**
 * Check is the user logged in matches the username in the requested URL
 * @param {string} loggedUsername Username of the user currently logged in
 * @param {string} urlUsername Username of the account in the URL
 * @returns {Promise<boolean|object>} Returns true is usernames match, else returns an error
 */
const usernameMatch = async (loggedUsername, urlUsername) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    const user = await db.execute(
      `SELECT username FROM users WHERE username = ?`,
      [urlUsername]);

    if (user[0].length === 0) {
      return new AppError(400, "User Doesn't Exist");
    }

    const userObj = Object.assign({}, Object.values(user[0])[0]);

    if (loggedUsername === userObj.username) return true;
    else {
      return new AppError(403, "You Are Not Authorized to View This Page");
    }
  } catch (err) {
    return new AppError(500, err.message);
  }
}

export {getUser,getUserById,usernameMatch};