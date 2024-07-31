import { AppError } from '../utilities/AppError';
import { ApiResponse } from '../utilities/ApiResponse';
import { userLogger } from '../utilities/logger';
import { setPathAndFilename, deleteFile } from '../utilities/helpers/uploads';
import { escapeHTML } from '../utilities/helpers/sanitizers';
import { paramsExist } from '../utilities/validators/paramsExist';
import { getUser, updateAuthToken } from '../utilities/helpers/authHelpers';
import {
  getUserInfo,
  modifyImage,
  updateRefreshSettings,
  updateDisplayNameSetting,
  updateEmailSetting,
  updateAboutMeSetting,
  deleteImage,
  deleteUser
} from '../utilities/helpers/userHelpers';
import { enableHyphens } from '../utilities/helpers/topicHelpers';
import { USER_COLS } from '../utilities/globals/user';
const {
  USER_ID,
  USERNAME,
  EMAIL,
  PIC_FILENAME,
  BANNER_URL,
  BANNER_FILENAME,
  concat_user_columns
} = USER_COLS;

import {
  PATH_CSS,
  PATH_ASSETS,
  API_PATH,
  DEFAULT_PROFILE_PIC,
  DEFAULT_PIC_FILENAME
} from '../utilities/config/config';

import { getUserTopics, getTopic } from '../utilities/helpers/topicHelpers';
import { getTopicVideos } from '../utilities/helpers/videoHelpers';

import { Request, Response, NextFunction } from 'express';

const getUserContent = async (req: Request, res: Response) => {
  let Response = new ApiResponse('error', 500, 'Something went wrong!');
  let username = '';
  if (paramsExist([req.params.username])) {
    username = escapeHTML(req.params.username);
    let content = (req.query.content) ? (escapeHTML(req.query.content.toString())) : 'topics';
    let all = (req.query.viewAll) ? (escapeHTML(req.query.viewAll.toString())) : false;
    all = (all === 'true') ? true : false;
    let page = (req.query.page) ? (escapeHTML(req.query.page.toString())) : '0';
    const PAGE_NUM = parseInt(page);
    let data = await getUserInfo(username, content, all, PAGE_NUM);
    if (data.response === 'success') {
      Response.setApiResponse('success', 200, 'Successfully retrieved more content.', '/', data);
    }
  }
  else {
    userLogger.log('error', `User ID: ${username} -> Invalid Arguments.`);
    Response.setApiResponse('error', 422, 'Invalid arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const renderUserPage = async (req: Request, res: Response, next: NextFunction) => {
  const username = escapeHTML(req.params.username);
  const author = await getUser(username);
  if (author instanceof AppError) return next(author);
  let user = null;
  if (req.user) {
    user = req.user;
  }

  let pageStyles = `${PATH_CSS}user/page.css`;

  res.render(`user/userPage`, {
    title: `${author.username}'s Channel`,
    pageStyles,
    PATH_CSS,
    PATH_ASSETS,
    API_PATH,
    author,
    user
  });
}
const renderUserScreen = async (req: Request, res: Response): Promise<void> => {
  const Response = new ApiResponse('error', 500, 'Error loading user page');
  const { username } = req.params;
  try {
    if (paramsExist([username])) {
      const sanitizedUsername = escapeHTML(username);
      const author = await getUser(sanitizedUsername, "user_id, username, display_name, pic_url, banner_url, subscribers, account_type");
      if (author instanceof AppError) throw author;
      let user = null;
      if (req.user) {
        user = req.user;
      }

      Response.setApiResponse('success', 200, 'Successfully retrieved user data', '/', { author, user });
    } else {
      Response.setStatus = 422;
      Response.setMessage = 'Invalid arguments'
    }
  } catch (err) {
    if (err instanceof Error) {
      userLogger.log('error', err.message);
      if (err instanceof AppError) Response.setStatus = err.status;
      Response.applyMessage(err.message, 'Error loading user page.');
    }
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const renderUserSettings = async (req: Request, res: Response, next: NextFunction) => {
  const username = escapeHTML(req.params.username);
  const user = await getUser(username);
  let pageStyles = `${PATH_CSS}user/settings.css`;
  if (user instanceof AppError) return next(user);

  let usingDefaultProfilePic = false;
  if (user.pic_filename === DEFAULT_PIC_FILENAME) {
    usingDefaultProfilePic = true;
  }

  res.render("user/settings", {
    title: `${user.username}'s Settings`,
    pageStyles,
    PATH_CSS,
    PATH_ASSETS,
    API_PATH,
    user,
    usingDefaultProfilePic
  });
}
const updateRefreshMetadata = async (req: Request, res: Response) => {
  let Response = new ApiResponse('error', 500, 'Something went wrong!');
  try {
    if (paramsExist([req.body.setting, req.body.value])) {
      const username = escapeHTML(req.params.username);
      const user = await getUser(username, USER_ID);
      if (!(user instanceof AppError)) {
        let { setting, value } = req.body;
        setting = escapeHTML(setting);
        value = escapeHTML(value);
        if (value !== '0' && value !== '1') {
          Response.setApiResponse('error', 422, 'Invalid Arguments');
        }
        else {
          let result = await updateRefreshSettings(user.user_id, setting, value);
          if (!(result instanceof AppError)) {
            Response.setApiResponse('success', 200, 'Updated Refresh Settings!');
          }
        }
      }
      else {
        userLogger.log('error', `User ID: None -> User doesn\'t exist.`);
        Response.setStatus = 400;
        Response.setMessage = 'User doesn\'t exist.';
      }
    }
    else {
      userLogger.log('error', `User ID: Unknown -> Invalid Arguments.`);
      Response.setApiResponse('error', 422, 'Invalid Arguments');
    }
  } catch (err) {
    userLogger.log('error', `Error refreshing metadata: ${(err as Error).message}`);
  }

  res.status(Response.getStatus).json(Response.getApiResponse());
}
const updateDisplayName = async (req: Request, res: Response) => {
  let Response = new ApiResponse('error', 500, 'Something went wrong!');
  try {
    if (paramsExist([req.body.displayName, req.params.username])) {
      const username = escapeHTML(req.params.username);
      const user = await getUser(username, USER_ID);
      if (user instanceof AppError) throw new Error(user.message);

      let { displayName } = req.body;

      let newDisplayName = escapeHTML(displayName.toString());

      let result = await updateDisplayNameSetting(user.user_id, newDisplayName);

      if (!(result instanceof AppError)) {
        Response.setApiResponse('success', 200, 'Display name successfully updated!', '/');
      }
      else {
        userLogger.log('error', `User ID: ${user.user_id} -> ${result.message}`);
        Response.setStatus = result.status;
        Response.applyMessage(result.message, 'Error updating display name.');
      }
    }
    else {
      userLogger.log('error', `User ID: Unknown -> Invalid Arguments.`);
      Response.setApiResponse('error', 422, 'Invalid Arguments');
    }
  } catch (err) {
    userLogger.log('error', `Error updating display name: ${(err as Error).message}`);
  }

  res.status(Response.getStatus).json(Response.getApiResponse());
}
const updateEmail = async (req: Request, res: Response) => {
  let Response = new ApiResponse('error', 500, 'Something went wrong!');
  try {
    if (paramsExist([req.params.username, req.body.email])) {
      const username = escapeHTML(req.params.username);
      const user = await getUser(username, USER_ID);
      if (user instanceof AppError) throw new Error(user.message);

      let { email } = req.body;
      let newEmail = escapeHTML(email.toString());
      let result = await updateEmailSetting(user.user_id, newEmail);

      if (result instanceof AppError) {
        if (result.message.includes('Duplicate')) {
          Response.setApiResponse('error', 409, 'Email Already Exists.', '/');
        }
        else {
          userLogger.log('error', `User ID: ${user.user_id} -> ${result.message}`);
          Response.setStatus = result.status;
          Response.applyMessage(result.message, 'Error updating email.');
        }
      }
      else {
        Response.setApiResponse('success', 200, 'Email successfully updated!', '/');
      }
    }
    else {
      userLogger.log('error', `User ID: Uknown -> Invalid Arguments.`);
      Response.setApiResponse('error', 422, 'Invalid Arguments.', '/');
    }
  } catch (err) {
    userLogger.log('error', `Error updating user email: ${(err as Error).message}`);
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const updateProfilePic = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  try {
    if (req.file && paramsExist([req.params.username, req.file])) {
      const username = escapeHTML(req.params.username);
      const user_cols = concat_user_columns([USER_ID, USERNAME, EMAIL, PIC_FILENAME]);
      const user = await getUser(username, user_cols);
      if (user instanceof AppError) throw new Error(user.message);

      const { path: picUrl, filename } = setPathAndFilename(req.file.path, req.file.filename);

      let error = await deleteImage(user, 'PROFILE PIC');
      if (error instanceof AppError) {
        await deleteFile(filename);
        Response.applyMessage(error.message, 'Error deleting profile picture.');
      }
      else {
        let data = await modifyImage(
          user.user_id,
          picUrl,
          filename,
          'PROFILE PIC'
        );
        if (data instanceof AppError) {
          userLogger.log('error', `User ID: ${user.user_id} -> ${data.message}`);
          try {
            await deleteFile(filename);
            Response.setStatus = data.status;
            Response.applyMessage(data.message, 'Error uploading new image.');
          } catch (err) {
            userLogger.log('error', `User ID: ${user.user_id} -> ${(err as Error).message}`);
            Response.applyMessage((err as Error).message, 'Error communicating with file host.');
          }
        }
        updateAuthToken(res, user, { property: 'pic_url', value: picUrl });
        Response.setApiResponse('success', 200, 'Successfully updated profile picture.', '/', data);
      }
    }
    else {
      userLogger.log('error', `User ID: Unknown -> Invalid Arguments.`);
      Response.setApiResponse('error', 422, 'Invalid Arguments.', '/');
    }
  } catch (err) {
    userLogger.log('error', `Error updating profile picture: ${(err as Error).message}`);
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const deleteProfilePic = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  try {
    if (paramsExist([req.params.username])) {
      const username = escapeHTML(req.params.username);
      const user = await getUser(username);
      if (user instanceof AppError) throw new Error(user.message);

      let data = await deleteImage(user, 'PROFILE PIC');
      if (!(data instanceof AppError)) {
        updateAuthToken(res, user, { property: 'pic_url', value: DEFAULT_PROFILE_PIC as string });
        Response.setApiResponse('success', 200, 'Successfully deleted profile picture.', '/', data);
      }
      else {
        userLogger.log('error', `User ID: ${user.user_id} -> ${data.message}`);
        Response.setStatus = data.status;
        Response.setMessage = 'Error deleting profile picture.';
      }
    }
    else {
      userLogger.log('error', `User ID: Unknown -> Invalid Arguments.`);
      Response.setApiResponse('error', 422, 'Invalid Arguments.', '/');
    }
  } catch (err) {
    userLogger.log('error', `Error deleting profile picture: ${(err as Error).message}`);
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const updateAboutMe = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  let txtAboutMe = (req.body.txtAboutMe) ? req.body.txtAboutMe : '';
  try {
    if (paramsExist([req.params.username])) {
      const username = escapeHTML(req.params.username);
      const user = await getUser(username, USER_ID);
      if (user instanceof AppError) throw new Error(user.message);

      let aboutMe = txtAboutMe.toString();

      let error = await updateAboutMeSetting(user.user_id, aboutMe);
      if (!(error instanceof AppError)) {
        Response.setApiResponse('success', 200, 'Successfully updated your \'About Me\'', '/', { aboutMe });
      }
      else {
        userLogger.log('error', `User ID: ${user.user_id} -> ${error.message}`);
        Response.setStatus = error.status;
        Response.applyMessage(error.message, 'Error updating email.');
      }
    }
    else {
      userLogger.log('error', `User ID: ${req.params?.username} -> Invalid Arguments.`);
      Response.setApiResponse('error', 422, 'Invalid Arguments.', '/');
    }
  } catch (err) {
    userLogger.log('error', `Error updating About Me section: ${(err as Error).message}`);
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const updateBanner = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  try {
    if (req.file && paramsExist([req.params.username, req.file])) {
      const username = escapeHTML(req.params.username);
      const user_cols = concat_user_columns([USER_ID, BANNER_URL, BANNER_FILENAME]);
      const user = await getUser(username, user_cols);
      if (user instanceof AppError) throw new Error(user.message);

      let data = null,
        error = null;

      const { path: picUrl, filename } = setPathAndFilename(req.file.path, req.file.filename);

      if (user.banner_url !== null) {
        error = await deleteImage(user, 'BANNER');
      }

      if (error instanceof AppError) {
        userLogger.log('error', `User ID: ${user.user_id} -> ${error.message}`);
        await deleteFile(filename);
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
          userLogger.log('error', `User ID: ${user.user_id} -> ${data.message}`);
          Response.setStatus = data.status;
          try {
            await deleteFile(filename);
            Response.applyMessage(data.message, 'Error uploading new image.');
          } catch (err) {
            userLogger.log('error', `User ID: ${user.user_id} -> ${(err as Error).message}`);
            Response.applyMessage((err as Error).message, 'Error communicating with file host.');
          }
        }
        else {
          Response.setApiResponse('success', 200, 'Successfully updated banner.', '/', data);
        }
      }
    }
    else {
      userLogger.log('error', `User ID: Unknown -> Invalid Arguments.`);
      Response.setApiResponse('error', 422, 'Invalid Arguments.', '/');
    }
  } catch (err) {
    userLogger.log('error', `Error updating banner: ${(err as Error).message}`);
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const renderUserDashboard = async (req: Request, res: Response, next: NextFunction) => {
  const pageStyles = `${PATH_CSS}user/dashboard.css`;
  const username = escapeHTML(req.params.username);
  const user = await getUser(username);
  if (user instanceof AppError) return next(user);

  const topics = await getUserTopics(username);
  if (topics instanceof AppError) return next(topics);
  for (let topic of topics) {
    topic.topicUrl = enableHyphens(topic.name, true);
  }

  res.render("user/dashboard", {
    title: `${user.username}'s Dashboard`,
    pageStyles,
    PATH_CSS,
    PATH_ASSETS,
    API_PATH,
    user,
    topics,
  });
}
const renderUserTopic = async (req: Request, res: Response, next: NextFunction) => {
  const pageStyles = `${PATH_CSS}user/dashboard.css`;
  const username = escapeHTML(req.params.username);
  const user = await getUser(username);
  if (user instanceof AppError) return next(user);

  const topicName = enableHyphens(escapeHTML(req.params.topic), false);
  const topicTitle = 'Topic | ' + topicName;
  const topic = await getTopic(topicName);
  if (topic instanceof AppError) return next(topic);
  if (!topic[0]) {
    return next(new AppError(400, "Topic Does Not Exist"));
  }
  topic[0].topicUrl = enableHyphens(topic[0].name, true);

  const videos = await getTopicVideos(topicName);
  if (videos instanceof AppError) return next(videos);
  for (let video of videos) {
    video.topicUrl = enableHyphens(video.topic, true);
  }

  res.render('user/topic', {
    title: topicTitle,
    pageStyles,
    PATH_CSS,
    PATH_ASSETS,
    API_PATH,
    topicName,
    topic: topic[0],
    user,
    videos
  });
}
const deleteBanner = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  try {
    if (paramsExist([req.params.username])) {
      const username = escapeHTML(req.params.username);
      const user_cols = concat_user_columns([USER_ID, BANNER_URL, BANNER_FILENAME]);
      const user = await getUser(username, user_cols);
      if (user instanceof AppError) throw new Error(user.message);
      const filename = user.banner_filename;

      let data = null;

      if (user.banner_url !== null) {
        data = await deleteImage(user, 'BANNER');
        if (data instanceof AppError) {
          userLogger.log('error', `User ID: ${user.user_id} -> ${data.message}`);
          Response.setStatus = data.status;
          try {
            if (filename) await deleteFile(filename);
            Response.applyMessage(data.message, 'Error deleting banner.');
          } catch (err) {
            userLogger.log('error', `User ID: ${user.user_id} -> ${(err as Error).message}`);
            Response.applyMessage((err as Error).message, 'Error communicating with file host.');
          }
        }
      }
      Response.setApiResponse('success', 200, 'Successfully deleted banner.', '/');
    }
    else {
      userLogger.log('error', `User ID: Unknown -> Invalid Arguments.`);
      Response.setApiResponse('error', 422, 'Invalid Arguments.', '/');
    }
  } catch (err) {
    userLogger.log('error', `Error deleting banner: ${(err as Error).message}`);
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
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
  renderUserScreen,
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