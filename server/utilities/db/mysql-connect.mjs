import mysql from 'mysql2/promise'
import bluebird from 'bluebird';
import { AppError } from '../AppError.mjs';
import { 
  NODE_ENV,
  USE_DOCKER,
  DB_DOCKER_HOST,DB_DOCKER_PORT,DB_DOCKER_USER,DB_DOCKER_PASS,DB_DOCKER_DATABASE,
  DB_DEV_HOST,DB_DEV_PORT,DB_DEV_USER,DB_DEV_PASS,DB_DEV_DATABASE,
  DB_PRO_HOST,DB_PRO_PORT,DB_PRO_USER,DB_PRO_PASS,DB_PRO_DATABASE
} from '../config.mjs';

let db;
let host,
    port,
    user,
    password,
    database;

if (NODE_ENV == 'development' || NODE_ENV == 'Development') {
  if (USE_DOCKER === 'true') {
    host = DB_DOCKER_HOST;
    port = DB_DOCKER_PORT;
    user = DB_DOCKER_USER;
    password = DB_DOCKER_PASS;
    database = DB_DOCKER_DATABASE;
  }
  else {
    host = DB_DEV_HOST;
    port = DB_DEV_PORT;
    user = DB_DEV_USER;
    password = DB_DEV_PASS;
    database = DB_DEV_DATABASE;
  }
}
else {
  host = DB_PRO_HOST;
  port = DB_PRO_PORT;
  user = DB_PRO_USER;
  password = DB_PRO_PASS;
  database = DB_PRO_DATABASE;
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
        namedPlaceholders:true,
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

export {getDatabase};