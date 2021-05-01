const registerValidator = require("../registerValidator");
const topicValidator = require("../topicValidator");

module.exports = {
  /**
   * Validates user input in registration form. Returns user to form with flashed error message if unsuccessful.
   * @param req request
   * @param res response
   * @param next callback - Never called if invalid user input
   */
  registrationValidation: (req, res, next) => {
    let { error } = registerValidator.validate(req.body);
    if (error) {
      req.flash("error", error.details[0].message);
      res.redirect("/register");
    } else {
      next();
    }
  },
  topicValidation: (req, res, next) => {
    let { error } = topicValidator.validate(req.body);
    if (error) {
      req.flash("error", error.details[0].message);
      res.redirect(`/user/${req.user.username}/dashboard`);
    } else {
      next();
    }
  },
};
