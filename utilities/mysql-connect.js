const mysql = require("mysql2");

let db = mysql.createConnection({
  //host: "rssd9243.webaccountserver.com",
  host: "localhost",
  port: 3306,
  database: "programminghelporg",
  user: "root",
  password: process.env.MYSQL_PASS,
});

module.exports = db;
