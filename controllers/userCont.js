const AppError = require("../utilities/AppError");
const { escapeHTML, containsHTML } = require("../utilities/helpers/sanitizers");
const { getDatabase } = require("../utilities/mysql-connect");
const { getUser } = require("../utilities/helpers/authHelpers");

module.exports = {
  renderUserPage: async (req, res, next) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    res.render("user/userPage", {
      title: `${user.username}'s Page`,
      user,
    });
  },
  renderUserSettings: async (req, res) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    res.render("user/settings", {
      title: `${user.username}'s Settings`,
      user,
    });
  },
  renderUserDashboard: async (req, res) => {
    const { getTopics } = require("../utilities/helpers/topicHelpers");
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    const topics = await getTopics();
    if (topics instanceof AppError) return next(topics);

    res.render("user/dashboard", {
      title: `${user.username}'s Dashbaord`,
      user,
      topics,
    });
  },
};
