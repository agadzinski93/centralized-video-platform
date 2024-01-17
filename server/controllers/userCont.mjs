import {AppError} from '../utilities/AppError.mjs';
import { ApiResponse } from '../utilities/ApiResponse.mjs';
import { userLogger } from '../utilities/logger.mjs';
import { pathCSS,pathAssets } from '../utilities/config.mjs';
import { Cloudinary } from '../utilities/cloudinary.mjs';
import { escapeHTML } from '../utilities/helpers/sanitizers.mjs';
import { paramsExist } from '../utilities/validators/paramsExist.mjs';
import { getUser } from '../utilities/helpers/authHelpers.mjs';
import { 
  getUserInfo,
  modifyImage,
  updateRefreshSettings,
  updateDisplayNameSetting,
  updateEmailSetting,
  updateAboutMeSetting,
  deleteImage,
  deleteUser
} from '../utilities/helpers/userHelpers.mjs';
import { enableHyphens } from '../utilities/helpers/topicHelpers.mjs';
import { USER_COLS } from '../utilities/globals/user.mjs';
const { 
  USER_ID,
  PIC_FILENAME,
  BANNER_URL,
  BANNER_FILENAME,
  concat_user_columns
} = USER_COLS;

import { getUserTopics, getTopic } from '../utilities/helpers/topicHelpers.mjs';
import { getTopicVideos } from '../utilities/helpers/videoHelpers.mjs';

const getUserContent = async (req,res)=>{
  let Response = new ApiResponse('error',500,'Something went wrong!');
  if (paramsExist([req.params.username])) {
    const username = escapeHTML(req.params.username);
    let content = (req.query.content) ? (escapeHTML(req.query.content.toString())) : 'topics';
    let all = (req.query.viewAll) ? (escapeHTML(req.query.viewAll.toString())) : false;
    let page = (req.query.page) ? (escapeHTML(req.query.page.toString())): 0;
    page = parseInt(page);
    let data = await getUserInfo(username,content,all,page);
    if (data.response === 'success') {
      Response.setApiResponse('success',200,'Successfully retrieved more content.','/',data);
    }
  }
  else {
    userLogger.log('error',`User ID: ${username} -> Invalid Arguments.`);
    Response.setApiResponse('error',422,'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const renderUserPage = async (req, res, next) => {
  const username = escapeHTML(req.params.username);
  //req.session.prevUrl = `/user/${username}`;
  const author = await getUser(username);
  if (author instanceof AppError) return next(author);
  let user = null;
  if (req.user) {
    user = req.user;
  }

  let pageStyles = `${pathCSS}user/page.css`;

  res.render(`user/userPage`, {
    title: `${author.username}'s Channel`,
    pageStyles,
    pathCSS,
    pathAssets,
    author,
    user
  });
}
const renderUserSettings = async (req, res) => {
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
    pathAssets,
    user,
    usingDefaultProfilePic
  });
}
const updateRefreshMetadata = async (req,res) => {
  let Response = new ApiResponse('error',500,'Something went wrong!');
  if (paramsExist([req.body.setting,req.body.value])) {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username, USER_ID);
    if (!(user instanceof AppError)) {
      let {setting, value} = req.body;
      setting = escapeHTML(setting);
      value = escapeHTML(value);
      if (value !== '0' && value !== '1') {
        Response.setApiResponse('error',422,'Invalid Arguments');
      }
      else {
        let result = await updateRefreshSettings(user.user_id, setting, value);
        if (!(result instanceof AppError)) {
          Response.setApiResponse('success',200,'Updated Refresh Settings!');
        }
      }
    }
    else {
      userLogger.log('error',`User ID: None -> User doesn\'t exist.`);
      Response.setStatus = 400;
      Response.setMessage = 'User doesn\'t exist.';
    }
  }
  else {
    userLogger.log('error',`User ID: ${user.user_id} -> Invalid Arguments.`);
    Response.setApiResponse('error',422,'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const updateDisplayName = async (req,res) => {
  let Response = new ApiResponse('error',500,'Something went wrong!');
  if (paramsExist([req.body.displayName,req.params.username])) {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username, USER_ID);

    let {displayName} = req.body;
    
    let newDisplayName = escapeHTML(displayName.toString());

    let result = await updateDisplayNameSetting(user.user_id, newDisplayName);

    if (!(result instanceof AppError)) {
      Response.setApiResponse('success',200,'Display name successfully updated!','/');
    }
    else {
      userLogger.log('error',`User ID: ${user.user_id} -> ${result.message}`);
      Response.setStatus = result.status;
      Response.setMessage = (process.env.NODE_ENV !== 'production') ? result.message : 'Error updating display name.';
    }
  }
  else {
    userLogger.log('error',`User ID: ${user.user_id} -> Invalid Arguments.`);
    Response.setApiResponse('error',422,'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const updateEmail = async (req,res) => {
  let Response = new ApiResponse('error',500,'Something went wrong!');
  if (paramsExist([req.params.username,req.body.email])) {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username, USER_ID);
    
    let {email} = req.body;
    let newEmail = escapeHTML(email.toString());
    let result = await updateEmailSetting(user.user_id,newEmail);

    if (result instanceof AppError) {
      if (result.message.includes('Duplicate')) {
        Response.setApiResponse('error',409,'Email Already Exists.','/');
      }
      else {
        userLogger.log('error',`User ID: ${user.user_id} -> ${result.message}`);
        Response.setStatus = result.status;
        Response.setMessage = (process.env.NODE_ENV !== 'production') ? result.message : 'Error updating email.';
      }
    }
    else {
      Response.setApiResponse('success',200,'Email successfully updated!','/');
    }
  }
  else {
    userLogger.log('error',`User ID: ${user.user_id} -> Invalid Arguments.`);
    Response.setApiResponse('error',422,'Invalid Arguments.','/');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const updateProfilePic = async (req,res) => {
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.params.username,req.file])) {
    const username = escapeHTML(req.params.username);
    const user_cols = concat_user_columns([USER_ID,PIC_FILENAME]);
    const user = await getUser(username, user_cols);

    let picUrl = req.file.path,
        filename = req.file.filename;
    
    let error = await deleteImage(user, 'PROFILE PIC');
    if (error instanceof AppError) {
      await Cloudinary.uploader.destroy(filename);
      Response.setMessage = (process.env.NODE_ENV !== 'production') ? error.message : 'Error deleting profile picture.';
    }
    else {
      let data = await modifyImage(
        user.user_id,
        picUrl,
        filename,
        'PROFILE PIC'
      );
      if (data instanceof AppError) {
        userLogger.log('error',`User ID: ${user.user_id} -> ${data.message}`);
        try {
          await Cloudinary.uploader.destroy(filename);
          Response.setStatus = data.status;
          Response.setMessage = (process.env.NODE_ENV !== 'production') ? data.message : 'Error Uploading New Image';
        } catch (err) {
          userLogger.log('error',`User ID: ${user.user_id} -> ${err.message}`);
          Response.setMessage = (process.env.NODE_ENV !== 'production') ? err.message : 'Error communicating with file host.'; 
        }
      } 
      Response.setApiResponse('success',200,'Successfully updated profile picture.','/', data);
    }
  }
  else {
    userLogger.log('error',`User ID: ${user.user_id} -> Invalid Arguments.`);
    Response.setApiResponse('error',422,'Invalid Arguments.','/');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const deleteProfilePic = async(req,res) => {
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.params.username])) {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username);

    let data = await deleteImage(user, 'PROFILE PIC');
    if (!(data instanceof AppError)) {
      Response.setApiResponse('success',200,'Successfully deleted profile picture.','/',data);
    }
    else {
      userLogger.log('error',`User ID: ${user.user_id} -> ${data.message}`);
      Response.setStatus = data.status;
      Response.setMessage = 'Error deleting profile picture.';
    }
  }
  else {
    userLogger.log('error',`User ID: ${user.user_id} -> Invalid Arguments.`);
    Response.setApiResponse('error',422,'Invalid Arguments.','/');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const updateAboutMe = async(req,res)=>{
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.params.username,req.body.txtAboutMe])) {
    const username = escapeHTML(req.params.username);
    const user = await getUser(username, USER_ID);

    let {txtAboutMe} = req.body;
    let aboutMe = txtAboutMe.toString();

    let error = await updateAboutMeSetting(user.user_id,aboutMe);
    if (!(error instanceof AppError)) {
      Response.setApiResponse('success',200,'Successfully updated your \'About Me\'','/',{aboutMe});
    }
    else {
      userLogger.log('error',`User ID: ${user.user_id} -> ${error.message}`);
      Response.setStatus = error.status;
      Response.setMessage = (process.env.NODE_ENV !== 'production') ? error.message : 'Error updating email.';
    }
  }
  else {
    userLogger.log('error',`User ID: ${user.user_id} -> Invalid Arguments.`);
    Response.setApiResponse('error',422,'Invalid Arguments.','/');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const updateBanner = async (req,res) => {
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.params.username,req.file])) {
    const username = escapeHTML(req.params.username);
    const user_cols = concat_user_columns([USER_ID,BANNER_URL,BANNER_FILENAME]);
    const user = await getUser(username, user_cols);

    let data = null,
        error = null,
        picUrl = req.file.path,
        filename = req.file.filename;
    
    if (user.banner_url !== null) {
      error = await deleteImage(user, 'BANNER');
    }

    if (error instanceof AppError) {
      userLogger.log('error',`User ID: ${user.user_id} -> ${error.message}`);
      await Cloudinary.uploader.destroy(filename);
      Response.setStatus = error.status;
      Response.setMessage = 'Error deleting banner.';
    }
    else {
      data = await modifyImage(
        user.user_id,
        picUrl,
        filename,
        'BANNER'
      );
      if (data instanceof AppError) {
        userLogger.log('error',`User ID: ${user.user_id} -> ${data.message}`);
        Response.setStatus = data.status;
        try {
          await Cloudinary.uploader.destroy(filename);
          Response.setMessage = (process.env.NODE_ENV !== 'production') ? data.message : 'Error uploading new image.';
        } catch (err) {
          userLogger.log('error',`User ID: ${user.user_id} -> ${err.message}`);
          Response.setMessage = (process.env.NODE_ENV !== 'production') ? err.message : 'Error communicating with file host.'; 
        }
      }
      else {
        Response.setApiResponse('success',200,'Successfully updated banner.','/',data);
      }
    }
  }
  else {
    userLogger.log('error',`User ID: ${user.user_id} -> Invalid Arguments.`);
    Response.setApiResponse('error',422,'Invalid Arguments.','/');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const renderUserDashboard = async (req, res, next) => {
  const pageStyles = `${pathCSS}user/dashboard.css`;
  const username = escapeHTML(req.params.username);
  const user = await getUser(username);
  if (user instanceof AppError) return next(user);

  const topics = await getUserTopics(username);
  if (topics instanceof AppError) return next(topics);
  for (let topic of topics) {
    topic.topicUrl = enableHyphens(topic.name,true);
  }

  res.render("user/dashboard", {
    title: `${user.username}'s Dashboard`,
    pageStyles,
    pathCSS,
    pathAssets,
    user,
    topics,
  });
}
const renderUserTopic = async (req, res, next) => {
  const pageStyles = `${pathCSS}user/dashboard.css`;
  const username = escapeHTML(req.params.username);
  const user = await getUser(username);
  if (user instanceof AppError) return next(user);

  const topicName = enableHyphens(escapeHTML(req.params.topic),false);
  const topicTitle = 'Topic | ' + topicName;
  const topic = await getTopic(topicName);
  if(!topic[0]) {
    return next(new AppError(400,"Topic Does Not Exist"));
  }
  topic[0].topicUrl = enableHyphens(topic[0].name,true);

  const videos = await getTopicVideos(topicName);
  if (videos instanceof AppError) return next(videos);
  for (let video of videos) {
    video.topicUrl = enableHyphens(video.topic,true);
  }

  res.render('user/topic', {
    title: topicTitle, 
    pageStyles,
    pathCSS,
    pathAssets,
    topicName, 
    topic:topic[0],
    user, 
    videos
  });
}
const deleteBanner = async (req,res) => {
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.params.username])) {
    const username = escapeHTML(req.params.username);
    const user_cols = concat_user_columns([USER_ID,BANNER_URL,BANNER_FILENAME]);
    const user = await getUser(username, user_cols);
    const filename = user.banner_filename;
    
    let data = null;
    
    if (user.banner_url !== null) {
      data = await deleteImage(user, 'BANNER');
      if (data instanceof AppError) {
        userLogger.log('error',`User ID: ${user.user_id} -> ${data.message}`);
        Response.setStatus = data.status;
        try {
          await Cloudinary.uploader.destroy(filename);
          Response.setMessage = (process.env.NODE_ENV !== 'production') ? data.message : 'Error deleting banner.';
        } catch (err) {
          userLogger.log('error',`User ID: ${user.user_id} -> ${err.message}`);
          Response.setMessage = (process.env.NODE_ENV !== 'production') ? err.message : 'Error communicating with file host.'; 
        }
      }
    }
    Response.setApiResponse('success',200,'Successfully deleted banner.','/',data);
  }
  else {
    userLogger.log('error',`User ID: ${user.user_id} -> Invalid Arguments.`);
    Response.setApiResponse('error',422,'Invalid Arguments.','/');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const deleteAccount = async (req,res,next) => {
  const username = escapeHTML(req.params.username);
  const user = await getUser(username, USER_ID);
  if (user instanceof AppError) return next(user);

  const result = await deleteUser(user.user_id);
  if (result instanceof AppError) return next(result);

  return next();
}
export {
  getUserContent,
  renderUserPage,
  renderUserSettings,
  updateRefreshMetadata,
  updateDisplayName,
  updateEmail,
  updateProfilePic,
  deleteProfilePic,
  updateAboutMe,
  updateBanner,
  renderUserDashboard,
  renderUserTopic,
  deleteBanner,
  deleteAccount
};