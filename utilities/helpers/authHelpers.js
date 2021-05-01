const { getDatabase } = require("../mysql-connect");
const AppError = require("../AppError");

module.exports = {
  /**
   * Retrieve all columns for a user
   * @param {string} username username used to identify the proper user
   * @returns {Promise<object>} The user object from the database or an error object
   */
  getUser: async (username) => {
    try {
      const db = await getDatabase();
      const user = await db.execute(
        `SELECT * FROM users WHERE username = '${username}'`
      );

      if (user[0].length === 0) {
        return new AppError(400, "User Doesn't Exist");
      }

      return Object.assign({}, Object.values(user[0])[0]);
    } catch (err) {
      return new AppError(500, err.message);
    }
  },
  /**
   * Check is the user logged in matches the username in the requested URL
   * @param {string} loggedUsername Username of the user currently logged in
   * @param {string} urlUsername Username of the account in the URL
   * @returns {Promise<boolean|object>} Returns true is usernames match, else returns an error
   */
  usernameMatch: async (loggedUsername, urlUsername) => {
    try {
      const db = await getDatabase();
      const user = await db.execute(
        `SELECT username FROM users WHERE username = '${urlUsername}'`
      );

      if (user[0].length === 0) {
        return new AppError(400, "User Doesn't Exist");
      }

      const userObj = Object.assign({}, Object.values(user[0])[0]);

      if (loggedUsername === userObj.username) return true;
      else {
        return new AppError(400, "You Are Not Authorized to View This Page");
      }
    } catch (err) {
      return new AppError(500, err.message);
    }
  },
};
