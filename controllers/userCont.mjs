import {AppError} from '../utilities/AppError.mjs';
import { ApiResponse } from '../utilities/ApiResponse.mjs';
import { pathCSS,pathAssets } from '../utilities/config.mjs';
import { cloudinary } from '../utilities/cloudinary.mjs';
import { escapeHTML,escapeSQL,unescapeSQL } from '../utilities/helpers/sanitizers.mjs';
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

const getUserContent = async (req,res,next)=>{
  const username = escapeHTML(req.params.username);
  let content = (req.query.content) ? (escapeSQL(escapeHTML(req.query.content.toString()))) : 'topics';
  let all = (req.query.viewAll) ? (escapeSQL(escapeHTML(req.query.viewAll.toString()))) : false;
  let page = (req.query.page) ? (escapeSQL(escapeHTML(req.query.page.toString()))): 0;
  page = parseInt(page);
  let data = await getUserInfo(username,content,all,page);
  res.json(data);
}
const renderUserPage = async (req, res, next) => {
  const username = escapeHTML(req.params.username);
  req.session.prevUrl = `/user/${username}`;
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
  let output = new ApiResponse('error',500,'Something went wrong!');
  const username = escapeHTML(req.params.username);
  const user = await getUser(username, USER_ID);
  if (user instanceof AppError) return res.json({test:'error'});

  const exist = paramsExist([req.body.setting,req.body.value]);
  if (exist) {
    let {setting, value} = req.body;
    setting = escapeHTML(setting);
    value = escapeHTML(value);
    if (value !== '0' && value !== '1') {
      output.setApiResponse('error',422,'Invalid Arguments');
    }
    else {
      let result = await updateRefreshSettings(user.user_id, setting, value);
    
      if (!(result instanceof AppError)) {
        output.setApiResponse('success',200,'Updated Refresh Settings!');
      }
    }
  }
  else {
    output.setApiResponse('error',422,'Invalid Arguments');
  }
  res.status(output.getStatus).json(output.getApiResponse());
}
const updateDisplayName = async (req,res) => {
  let output = new ApiResponse('error',500,'Something went wrong!');
  const username = escapeHTML(req.params.username);
  const user = await getUser(username, USER_ID);

  let {displayName} = req.body;
  const exist = paramsExist([displayName]);
  if (exist) {
    let newDisplayName = escapeHTML(escapeSQL(displayName.toString()));
  
    let result = await updateDisplayNameSetting(user.user_id, newDisplayName);

    if (!(result instanceof AppError)) {
      output.setApiResponse('success',200,'Display name successfully updated!');
    }
  }
  else {
    output.setApiResponse('error',422,'Invalid Arguments');
  }
  res.status(output.getStatus).json(output.getApiResponse());
}
const updateEmail = async (req,res) => {
  let output = new ApiResponse('error',500,'Something went wrong!');
  const username = escapeHTML(req.params.username);
  const user = await getUser(username, USER_ID);
  
  let {email} = req.body;
  const exist = paramsExist([email]);
  if (exist) {
    let newEmail = escapeHTML(escapeSQL(email.toString()));

    let result = await updateEmailSetting(user.user_id,newEmail);

    if (result instanceof AppError) {
      if (result.message.includes('Duplicate')) {
        output.setApiResponse('error',400,'Email Already Exists.');
      }
    }
    else {
      output.setApiResponse('success',200,'Email successfully updated!');
    }
  }
  else {
    output.setApiResponse('error',422,'Invalid Arguments.');
  }
  res.status(output.getStatus).json(output.getApiResponse());
}
const updateProfilePic = async (req,res) => {
  const username = escapeHTML(req.params.username);
  const user_cols = concat_user_columns([USER_ID,PIC_FILENAME]);
  const user = await getUser(username, user_cols);
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
}
const deleteProfilePic = async(req,res) => {
  const username = escapeHTML(req.params.username);
  const user = await getUser(username);

  let data = null;
  let error = await deleteImage(user, 'PROFILE PIC');
  if (error instanceof AppError) {
    return res.json({error:'Error Deleting Profile Pic'});
  }
  data = error;
  res.json(data);
}
const updateAboutMe = async(req,res)=>{
  const username = escapeHTML(req.params.username);
  const user = await getUser(username, USER_ID);

  let data = null;
  let {txtAboutMe} = req.body;
  const exist = paramsExist([txtAboutMe]);
  if (exist) {
    let aboutMe = escapeSQL(txtAboutMe.toString());

    let error = await updateAboutMeSetting(user.user_id,aboutMe);
    if (error instanceof AppError) {
      data = {response:'error',message:'Error Updating \'About Me\''};
    }
    else {
      data = {response:'success',message:'Successfully updated your \'About Me\'',aboutMe:unescapeSQL(aboutMe)};
    }
  }
  else {
    res.status(422);
    data = {response: 'error', message:'Invalid Arguments'};
  }
  res.json(data);
}
const updateBanner = async (req,res) => {
  const username = escapeHTML(req.params.username);
  const user_cols = concat_user_columns([USER_ID,BANNER_URL,BANNER_FILENAME]);
  const user = await getUser(username, user_cols);

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
  const username = escapeHTML(req.params.username);
  const user_cols = concat_user_columns([USER_ID,BANNER_URL,BANNER_FILENAME]);
  const user = await getUser(username, user_cols);
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