import {AppError} from '../utilities/AppError.mjs';
import { PATH_CSS, PATH_ASSETS, API_PATH } from '../utilities/config.mjs';
import { escapeHTML, removeParams } from '../utilities/helpers/sanitizers.mjs';
import { enableHyphens } from '../utilities/helpers/topicHelpers.mjs';
import { getTopic } from '../utilities/helpers/topicHelpers.mjs';
import {getTopicVideos,getVideo} from '../utilities/helpers/videoHelpers.mjs';
import { isSubscribed } from '../utilities/helpers/subscribeHelpers.mjs';

const renderLibaryTopic = async (req, res, next) => {
  const pageStyles = `${PATH_CSS}lib/topicPage.css`;

  let topicName = enableHyphens(escapeHTML(req.params.topic),false);
  res.locals.prevUrl = `/lib/${topicName}`;
  let topic = await getTopic(topicName);
  if (topic instanceof AppError) return next(topic);

  const videos = await getTopicVideos(topicName);
  if (videos instanceof AppError) return next(videos);
  for (let video of videos) {
    video.topicUrl = enableHyphens(video.topic,true);
  }

  res.render("lib/topicPage", {title: `${topicName} | Playlist`, 
    pageStyles, 
    PATH_CSS, 
    PATH_ASSETS,
    API_PATH,
    user: req.user , 
    topic: topic[0], 
    videos
  });
}
const renderVideoPage = async (req, res, next) => {
  const pageStyles = `${PATH_CSS}lib/videoPage.css`;
  
  let topicName = enableHyphens(escapeHTML(req.params.topic),false);
  let userId = null;
  let topic = await getTopic(topicName);
  if (topic instanceof AppError) return next(topic);

  const videos = await getTopicVideos(topicName);
  if (videos instanceof AppError) return next(videos);
  for (let video of videos) {
    video.topicUrl = enableHyphens(video.topic,true);
  }
  
  let videoId = escapeHTML(req.params.video);
  res.locals.prevUrl = `/lib/${topicName}/${videoId}`;
  let timestamp = null;
  if (videoId.includes('&t=')) {
    if (videoId.charAt(videoId.length - 1 === 's')) {
      timestamp = videoId.substring(videoId.indexOf('=') + 1,videoId.length - 1);
    }
  }
  videoId = removeParams(videoId);
  
  let video = await getVideo(videoId, topicName, true);
  if (video instanceof AppError) return next(video);

  video[0].videoId = videoId;
  video[0].topicUrl = enableHyphens(video[0].topic,true)
  let subscribed = null;
  if (req.user) {
    userId = req.user.user_id;
    if (userId !== video[0].user_id) {
      subscribed = await isSubscribed(userId,video[0].user_id);
    }
  }
  res.render("lib/videoPage", {
    title: `${topicName} | ${video[0].title.substring(0,50)}`, 
    pageStyles, 
    PATH_CSS,
    PATH_ASSETS,
    API_PATH,
    user:req.user, 
    topic: topic[0], 
    videos, 
    video: video[0],
    subscribed,
    timestamp
  });
}
export {renderLibaryTopic,renderVideoPage};