const mysql = require("mysql2/promise");
const bluebird = require("bluebird");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const AppError = require("./AppError");

let db;
let host,
    port,
    user,
    password,
    database;

if (process.env.NODE_ENV == 'production') {
  host = process.env.PHP_MY_ADMIN_HOST;
  port = process.env.PHP_MY_ADMIN_POST;
  user = process.env.PHP_MY_ADMIN_USER;
  password = process.env.PHP_MY_ADMIN_PASS;
  database = process.env.PHP_MY_ADMIN_DATABASE;
}
else {
  host = process.env.MYSQL_HOST;
  port = process.env.MYSQL_PORT;
  user = process.env.MYSQL_USER;
  password = process.env.MYSQL_PASS;
  database = process.env.MYSQL_DATABASE;
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

module.exports = {
  /**
   *
   * @returns
   */
  getDatabase: async () => {
    try {
      return await getConnection();
    } catch (err) {
      return new AppError(500, err.message);
    }
  },
  sessionStore: new MySQLStore({
    host,
    port,
    database,
    user,
    password,
  }),
};
