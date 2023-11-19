const AppError = require('../utilities/AppError');
const {pathCSS,pathAssets} = require('../utilities/config');
const { escapeHTML, removeParams } = require("../utilities/helpers/sanitizers");
const {enableHyphens} = require("../utilities/helpers/topicHelpers");

module.exports = {
  renderLibaryTopic: async (req, res, next) => {
    const {getTopic} = require('../utilities/helpers/topicHelpers');
    const {getTopicVideos} = require("../utilities/helpers/videoHelpers");

    const pageStyles = `${pathCSS}lib/topicPage.css`;

    let topicName = enableHyphens(escapeHTML(req.params.topic),false);
    req.session.prevUrl = `/lib/${topicName}`;
    let topic = await getTopic(topicName);
    if (topic instanceof AppError) return next(topic);

    const videos = await getTopicVideos(topicName);
    if (videos instanceof AppError) return next(videos);
    for (let video of videos) {
      video.topicUrl = enableHyphens(video.topic,true);
    }

    res.render("lib/topicPage", {title: `${topicName} | Playlist`, 
      pageStyles, 
      pathCSS, 
      pathAssets, 
      user: req.user , 
      topic: topic[0], 
      videos
    });
  },
  renderVideoPage: async (req, res, next) => {
    const {getTopic} = require('../utilities/helpers/topicHelpers');
    const {getTopicVideos} = require("../utilities/helpers/videoHelpers");
    const {getVideo} = require("../utilities/helpers/videoHelpers");
    const {isSubscribed} = require("../utilities/helpers/subscribeHelpers");

    const pageStyles = `${pathCSS}lib/videoPage.css`;

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
    req.session.prevUrl = `/lib/${topicName}/${videoId}`;
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
      pathCSS,
      pathAssets,
      user:req.user, 
      topic: topic[0], 
      videos, 
      video: video[0],
      subscribed,
      timestamp
    });
  }
};
