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
    const { getUserTopics, getAllTopics, getTopic } = require("../utilities/helpers/topicHelpers");
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    const topics = await getUserTopics(username);
    if (topics instanceof AppError) return next(topics);

    res.render("user/dashboard", {
      title: `${user.username}'s Dashboard`,
      user,
      topics,
    });
  },
  renderUserTopic: async (req, res, next) => {
    const {getTopicVideos} = require("../utilities/helpers/videoHelpers");
    const {getTopic} = require("../utilities/helpers/topicHelpers");
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    const topicName = escapeHTML(req.params.topic);
    const topicTitle = 'Topic | ' + topicName;
    const topic = await getTopic(topicName);

    const videos = await getTopicVideos(topicName);
    if (videos instanceof AppError) return next(videos);

    res.render('user/topic', {
      title: topicTitle, 
      topicName, 
      topic:topic[0],
      user: req.user, 
      videos
    });
  }
};
