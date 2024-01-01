import mysql from 'mysql2/promise'
import bluebird from 'bluebird';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
const MySQLStoreSession = MySQLStore(session);
import { AppError } from '../AppError.mjs';

let db;
let host,
    port,
    user,
    password,
    database;

if (process.env.NODE_ENV == 'development' || process.env.NODE_ENV == 'Development') {
  host = process.env.MYSQL_HOST;
  port = process.env.MYSQL_PORT;
  user = process.env.MYSQL_USER;
  password = process.env.MYSQL_PASS;
  database = process.env.MYSQL_DATABASE;
}
else {
  host = process.env.PHP_MY_ADMIN_HOST;
  port = process.env.PHP_MY_ADMIN_POST;
  user = process.env.PHP_MY_ADMIN_USER;
  password = process.env.PHP_MY_ADMIN_PASS;
  database = process.env.PHP_MY_ADMIN_DATABASE;
}

/**
 * Establishes the connection to a MySQL database
 * @returns {Promise<function>} Database connection object or an error object
 */
async function getConnection() {
  try {
    if (typeof db === 'undefined') {
      db = mysql.createPool({
        host,
        port,
        database,
        user,
        password,
        waitForConnections:true,
        connectionLimit:10,
        queueLimit:0,
        Promise: bluebird,
      });
  }
    return db;
  } catch (err) {
    return new AppError(500, err.message);
  }
}
/**
 *
 * @returns
 */
const getDatabase = async () => {
  try {
    return await getConnection();
  } catch (err) {
    return new AppError(500, err.message);
  }
}
const sessionStore = new MySQLStoreSession({
  host,
  port,
  database,
  user,
  password,
})

export {getDatabase,sessionStore};