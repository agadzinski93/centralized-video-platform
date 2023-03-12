const AppError = require("../utilities/AppError");
const {pathCSS} = require('../utilities/config');
const {cloudinary} = require("../utilities/cloudinary");
const { escapeHTML } = require("../utilities/helpers/sanitizers");
const { getUser } = require("../utilities/helpers/authHelpers");
const {
  modifyImage,
  updateRefreshSettings,
  updateDisplayNameSetting,
  updateEmailSetting,
  deleteImage,
  deleteUser} = require("../utilities/helpers/userHelpers");
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

    let usingDefaultProfilePic = false;
    if (user.pic_filename === process.env.DEFAULT_PIC_FILENAME) {
      usingDefaultProfilePic = true;
    }

    res.render("user/settings", {
      title: `${user.username}'s Settings`,
      pageStyles,
      pathCSS,
      user,
      usingDefaultProfilePic
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
  updateDisplayName: async (req,res) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);

    let {displayName} = req.body;
    
    let newDisplayName = escapeHTML(displayName);
    
    let result = await updateDisplayNameSetting(user.user_id, newDisplayName);

    if (result instanceof AppError) {
      res.json({response: 'error', message:'Something went wrong!'});
    }
    else {
      res.json({response: 'success', message:'Display name successfully updated!'});
    }
  },
  updateEmail: async (req,res) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);

    let {email} = req.body;
    let newEmail = escapeHTML(email);

    let result = await updateEmailSetting(user.user_id,newEmail);

    if (result instanceof AppError) {
      res.json({response: 'error', message:'Something went wrong!'});
    }
    else {
      res.json({response: 'success', message:'Email successfully updated!'});
    }
  },
  updateProfilePic: async (req,res) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);

    let data = null;

    let picUrl,
        filename;
    if (req.file != undefined) {
      picUrl = req.file.path;
      filename = req.file.filename;
    }
    else {
      picUrl = null;
      filename = null;
    }
    
    let error = await deleteImage(user, 'PROFILE PIC');
    if (error instanceof AppError) {
      await cloudinary.uploader.destroy(filename);
      return res.json({error:'Error Deleting Profile Pic'});
    }
    error = await modifyImage(
      user.user_id,
      picUrl,
      filename,
      'PROFILE PIC'
    );
    if (error instanceof AppError) {
      await cloudinary.uploader.destroy(filename);
      return res.json({error:'Error Uploading New Image'});
    } 
    
    data = error;
    res.json(data);
  },
  deleteProfilePic: async(req,res) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);

    let data = null;
    let error = await deleteImage(user, 'PROFILE PIC');
    if (error instanceof AppError) {
      return res.json({error:'Error Deleting Profile Pic'});
    }
    data = error;
    res.json(data);
  },
  updateBanner: async (req,res) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);

    let data = null;

    let picUrl,
        filename;
    if (req.file != undefined) {
      picUrl = req.file.path;
      filename = req.file.filename;
    }
    else {
      picUrl = null;
      filename = null;
    }
    let error;
    
    if (user.banner_url !== null) {
      error = await deleteImage(user, 'BANNER');
      if (error instanceof AppError) {
        await cloudinary.uploader.destroy(filename);
        return res.json({error:'Error Deleting Banner'});
      }
    }
    
    error = await modifyImage(
      user.user_id,
      picUrl,
      filename,
      'BANNER'
    );
    if (error instanceof AppError) {
      await cloudinary.uploader.destroy(filename);
      return res.json({error:'Error Uploading New Image'});
    } 

    data = error;
    res.json(data);
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
  deleteBanner: async (req,res) => {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);
    const filename = user.banner_filename;

    let data = null;
    let error;
    
    if (user.banner_url !== null) {
      error = await deleteImage(user, 'BANNER');
      if (error instanceof AppError) {
        await cloudinary.uploader.destroy(filename);
        return res.json({error:'Error Deleting Banner'});
      }
    }
    data = {response:'success', message:'Successfully Deleted Banner'};
    res.json(data);
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
