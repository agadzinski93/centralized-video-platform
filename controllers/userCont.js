const AppError = require("../utilities/AppError");
const { escapeHTML } = require("../utilities/helpers/sanitizers");
const { getUser } = require("../utilities/helpers/authHelpers");

module.exports = {
  renderUserPage: async (req, res, next) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    res.render("user/userPage", {
      title: `${user.username}'s Page`,
      user: req.user,
    });
  },
  renderUserSettings: async (req, res) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    res.render("user/settings", {
      title: `${user.username}'s Settings`,
      user: req.user,
    });
  },
  renderUserDashboard: async (req, res, next) => {
    const { getUserTopics, getAllTopics } = require("../utilities/helpers/topicHelpers");
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    const topics = await getUserTopics(username);
    if (topics instanceof AppError) return next(topics);

    res.render("user/dashboard", {
      title: `${user.username}'s Dashbaord`,
      user,
      topics,
    });
  },
  renderUserTopic: async (req, res, next) => {
    const {getTopicVideos} = require("../utilities/helpers/videoHelpers");
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    const topic = escapeHTML(req.params.topic);
    const videos = await getTopicVideos(topic);
    if (videos instanceof AppError) return next(videos);
    else {
      res.render('user/topic', {title: topic, user: req.user, videos});
    }
    
  }
};
