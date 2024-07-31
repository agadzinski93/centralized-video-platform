import mysql from 'mysql2/promise'
import bluebird from 'bluebird';
import { AppError } from '../AppError';
import { logger } from '../logger';
import {
  NODE_ENV,
  USE_DOCKER,
  DB_DOCKER_HOST, DB_DOCKER_PORT, DB_DOCKER_USER, DB_DOCKER_PASS, DB_DOCKER_DATABASE,
  DB_DEV_HOST, DB_DEV_PORT, DB_DEV_USER, DB_DEV_PASS, DB_DEV_DATABASE,
  DB_PRO_HOST, DB_PRO_PORT, DB_PRO_USER, DB_PRO_PASS, DB_PRO_DATABASE
} from '../config/config';

let database: MYSQL_DB | null = null;

const getDatabaseCreds = () => {
  if (NODE_ENV == 'development' || NODE_ENV == 'Development') {
    if (USE_DOCKER === 'true') {
      return {
        host: DB_DOCKER_HOST,
        port: parseInt(DB_DOCKER_PORT),
        user: DB_DOCKER_USER,
        password: DB_DOCKER_PASS,
        database: DB_DOCKER_DATABASE
      }
    }
    else {
      return {
        host: DB_DEV_HOST,
        port: parseInt(DB_DEV_PORT),
        user: DB_DEV_USER,
        password: DB_DEV_PASS,
        database: DB_DEV_DATABASE
      }
    }
  }
  else {
    return {
      host: DB_PRO_HOST,
      port: parseInt(DB_PRO_PORT),
      user: DB_PRO_USER,
      password: DB_PRO_PASS,
      database: DB_PRO_DATABASE
    }
  }
}

class MYSQL_DB {
  #db: mysql.Pool;
  #host: string | undefined;
  #port: number | undefined;
  #user: string | undefined;
  #password: string | undefined;
  #database: string | undefined;

  constructor() {
    try {
      const { host, port, user, password, database: databaseTarget } = getDatabaseCreds();
      this.#host = host;
      this.#port = port;
      this.#user = user;
      this.#password = password;
      this.#database = databaseTarget;

      this.#db = mysql.createPool({
        host: this.#host,
        port: this.#port,
        database: this.#database,
        user: this.#user,
        password: this.#password,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        namedPlaceholders: true,
        Promise: bluebird,
      });
    } catch (err) {
      logger.log('error', 'Error connecting to database.');
      throw new AppError(500, 'Error connecting to database.');
    }
  }

  getConnection() { return this.#db; }

  getConnectionInfo() {
    return {
      host: this.#host,
      port: this.#port,
      user: this.#user,
      password: this.#password,
      database: this.#database
    }
  }
}

/**
 * Establishes the connection to a MySQL database
 * @returns {Promise<function>} Database connection object or an error object
 */
async function getConnection(): Promise<mysql.Pool | AppError> {
  try {
    if (!database) {
      database = new MYSQL_DB();
    }
    if (database instanceof MYSQL_DB) {
      return database.getConnection();
    }
    else {
      throw new Error('Database Instance is not of the right type.');
    }

  } catch (err) {
    return new AppError(500, (err as Error).message);
  }
}

const getDatabase = async () => {
  try {
    return await getConnection();
  } catch (err) {
    return new AppError(500, (err as Error).message);
  }
}

const getDatabaseInfo = () => {
  let output = null;
  if (database) {
    output = database.getConnectionInfo();
  }
  return output;
}

export { getDatabase, getDatabaseInfo, getDatabaseCreds };