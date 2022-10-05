const mysql = require("mysql2/promise");
const bluebird = require("bluebird");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const AppError = require("./AppError");

let db;

/**
 * Establishes the connection to a MySQL database
 * @returns {Promise<function>} Database connection object or an error object
 */
async function getConnection() {
  try {
    if (typeof db === 'undefined') {
      db = await mysql.createConnection({
        host: "localhost",
        port: 3306,
        database: "programminghelporg",
        user: "root",
        password: process.env.MYSQL_PASS,
        Promise: bluebird,
        connectionLimit:10,
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
    host: "localhost",
    port: 3306,
    database: "programminghelporg",
    user: "root",
    password: process.env.MYSQL_PASS,
  }),
};
