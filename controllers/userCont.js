const AppError = require("../utilities/AppError");
const {pathCSS} = require('../utilities/config');
const { escapeHTML } = require("../utilities/helpers/sanitizers");
const { getUser } = require("../utilities/helpers/authHelpers");
const {updateRefreshSettings, deleteUser} = require("../utilities/helpers/userHelpers");
const {logoutUser} = require("./userAuthCont");

module.exports = {
  renderUserPage: async (req, res, next) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    let pageStyles = null;

    res.render(`user/userPage`, {
      title: `${user.username}'s Page`,
      pageStyles,
      pathCSS,
      user,
    });
  },
  renderUserSettings: async (req, res) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    let pageStyles = `${pathCSS}user/settings.css`;
    if (user instanceof AppError) return next(user);

    res.render("user/settings", {
      title: `${user.username}'s Settings`,
      pageStyles,
      pathCSS,
      user,
    });
  },
  updateRefreshMetadata: async (req,res) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);

    let {setting} = req.body;
    let {value} = req.body;

    setting = escapeHTML(setting);
    value = escapeHTML(value);
    
    let result = await updateRefreshSettings(user.user_id,setting, value);
    
    if (result instanceof AppError) {
      res.json({test: 'error'});
    }
    else {
      res.json({test: 'success'});
    }
  },
  renderUserDashboard: async (req, res, next) => {
    const { getUserTopics } = require("../utilities/helpers/topicHelpers");
    const pageStyles = `${pathCSS}user/dashboard.css`;
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    const topics = await getUserTopics(username);
    if (topics instanceof AppError) return next(topics);

    res.render("user/dashboard", {
      title: `${user.username}'s Dashboard`,
      pageStyles,
      pathCSS,
      user,
      topics,
    });
  },
  renderUserTopic: async (req, res, next) => {
    const {getTopicVideos} = require("../utilities/helpers/videoHelpers");
    const {getTopic} = require("../utilities/helpers/topicHelpers");
    const pageStyles = `${pathCSS}user/dashboard.css`;
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
      pageStyles,
      pathCSS,
      topicName, 
      topic:topic[0],
      user, 
      videos
    });
  },
  deleteAccount: async (req,res,next) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    if (user instanceof AppError) return next(user);

    const result = await deleteUser(user.user_id);
    if (result instanceof AppError) return next(result);

    return next();
  },
};
