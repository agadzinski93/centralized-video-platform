const AppError = require("../utilities/AppError");
const { getDatabase } = require("../utilities/mysql-connect");
const { escapeHTML } = require("../utilities/helpers/sanitizers");
const { usernameMatch } = require("../utilities/helpers/authHelpers");
const passport = require("passport");

module.exports = {
  isLoggedIn: (req, res, next) => {
    if (req.isAuthenticated()) return next();

    res.cookie("requestUrl", req.originalUrl);
    req.flash("error", "You need to be logged in");
    res.redirect(`/login`);
  },
  isAuthor: async (req, res, next) => {
    const loggedUsername = escapeHTML(req.user.username);
    const urlUsername = escapeHTML(req.params.username);

    const match = await usernameMatch(loggedUsername, urlUsername);
    if (match instanceof AppError) return next(match);

    return next();
  },
};
