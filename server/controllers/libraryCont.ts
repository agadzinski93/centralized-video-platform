import { ApiResponse } from '../utilities/ApiResponse';
import { AppError } from '../utilities/AppError';
import { PATH_CSS, PATH_ASSETS, API_PATH } from '../utilities/config';
import { escapeHTML, removeParams } from '../utilities/helpers/sanitizers';
import { paramsExist } from '../utilities/validators/paramsExist';
import { enableHyphens } from '../utilities/helpers/topicHelpers';
import { getTopic } from '../utilities/helpers/topicHelpers';
import { getTopicVideos, getVideo } from '../utilities/helpers/videoHelpers';
import { isSubscribed } from '../utilities/helpers/subscribeHelpers';

import { Request, Response, NextFunction } from 'express';

const renderLibaryTopic = async (req: Request, res: Response, next: NextFunction) => {
  const pageStyles = `${PATH_CSS}lib/topicPage.css`;

  let topicName = enableHyphens(escapeHTML(req.params.topic), false);
  res.locals.prevUrl = `/lib/${topicName}`;
  let topic = await getTopic(topicName);
  if (topic instanceof AppError) return next(topic);

  const videos = await getTopicVideos(topicName);
  if (videos instanceof AppError) return next(videos);
  for (let video of videos) {
    video.topicUrl = enableHyphens(video.topic, true);
  }

  res.render("lib/topicPage", {
    title: `${topicName} | Playlist`,
    pageStyles,
    PATH_CSS,
    PATH_ASSETS,
    API_PATH,
    user: req.user,
    topic: topic[0],
    videos
  });
}
const renderTopicScreen = async (req: Request, res: Response): Promise<void> => {
  const Response = new ApiResponse('error', 500, 'Error retrieving topic.');
  const { topic: paramTopic } = req.params;
  try {
    if (paramsExist([paramTopic])) {
      let topicName = enableHyphens(escapeHTML(paramTopic), false);
      res.locals.prevUrl = `/lib/${topicName}`;
      let topic = await getTopic(topicName);
      if (topic instanceof AppError) throw topic;

      const videos = await getTopicVideos(topicName);
      if (videos instanceof AppError) throw videos;
      for (let video of videos) {
        video.topicUrl = enableHyphens(video.topic, true);
      }

      Response.setApiResponse('success', 200, 'Successfully retrieved topic.', '/', { topic: topic[0], videos });
    } else {
      Response.setStatus = 422;
      Response.setMessage = "Invalid arguments.";
    }
  } catch (err) {
    if (err instanceof AppError) Response.setStatus = err.status;
    Response.applyMessage((err as Error).message, 'Error retrieving topic.');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const renderVideoPage = async (req: Request, res: Response, next: NextFunction) => {
  const pageStyles = `${PATH_CSS}lib/videoPage.css`;

  let topicName = enableHyphens(escapeHTML(req.params.topic), false);
  let userId = null;
  let topic = await getTopic(topicName);
  if (topic instanceof AppError) return next(topic);

  const videos = await getTopicVideos(topicName);
  if (videos instanceof AppError) return next(videos);
  for (let video of videos) {
    video.topicUrl = enableHyphens(video.topic, true);
  }

  let videoId = escapeHTML(req.params.video);
  res.locals.prevUrl = `/lib/${topicName}/${videoId}`;
  let timestamp = null;
  if (videoId.includes('&t=')) {
    if (videoId.charAt(videoId.length - 1) === 's') {
      timestamp = videoId.substring(videoId.indexOf('=') + 1, videoId.length - 1);
    }
  }
  videoId = removeParams(videoId);

  let video = await getVideo(videoId, topicName, true);
  if (video instanceof AppError) return next(video);

  video[0].videoId = videoId;
  video[0].topicUrl = enableHyphens(video[0].topic, true)
  let subscribed = null;
  if (req.user) {
    userId = req.user.user_id;
    if (userId !== video[0].user_id) {
      subscribed = await isSubscribed(userId, video[0].user_id);
    }
  }
  res.render("lib/videoPage", {
    title: `${topicName} | ${video[0].title.substring(0, 50)}`,
    pageStyles,
    PATH_CSS,
    PATH_ASSETS,
    API_PATH,
    user: req.user,
    topic: topic[0],
    videos,
    video: video[0],
    subscribed,
    timestamp
  });
}
const renderVideoScreen = async (req: Request, res: Response): Promise<void> => {
  const Response = new ApiResponse('error', 500, 'Error retrieving video.');
  const { topic: paramTopic, video: paramVideo } = req.params;
  try {
    if (paramsExist([paramTopic, paramVideo])) {
      let topicName = enableHyphens(escapeHTML(paramTopic), false);
      let userId = null;
      let topic = await getTopic(topicName);
      if (topic instanceof AppError) throw topic;

      const videos = await getTopicVideos(topicName);
      if (videos instanceof AppError) throw videos;
      for (let video of videos) {
        video.topicUrl = enableHyphens(video.topic, true);
      }

      let videoId = escapeHTML(paramVideo);
      res.locals.prevUrl = `/lib/${topicName}/${videoId}`;
      let timestamp = null;
      if (videoId.includes('&t=')) {
        if (videoId.charAt(videoId.length - 1) === 's') {
          timestamp = videoId.substring(videoId.indexOf('=') + 1, videoId.length - 1);
        }
      }
      videoId = removeParams(videoId);

      let video = await getVideo(videoId, topicName, true);
      if (video instanceof AppError) throw video;

      video[0].videoId = videoId;
      video[0].topicUrl = enableHyphens(video[0].topic, true)
      let subscribed = null;
      if (req.user) {
        userId = req.user.user_id;
        if (userId !== video[0].user_id) {
          subscribed = await isSubscribed(userId, video[0].user_id);
          if (subscribed instanceof AppError) throw subscribed;
        }
      }
      Response.setApiResponse('success', 200, 'Successfully retrieved video.', '/', { topic: topic[0], videos, video: video[0], subscribed });
    } else {
      Response.setStatus = 422;
      Response.setMessage = "Invalid arguments.";
    }
  } catch (err) {
    if (err instanceof AppError) Response.setStatus = err.status;
    Response.applyMessage((err as Error).message, 'Error retrieving video.');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
export { renderLibaryTopic, renderTopicScreen, renderVideoPage, renderVideoScreen };