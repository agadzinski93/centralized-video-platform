const AppError = require('../utilities/AppError');
const { escapeHTML, removeParams } = require("../utilities/helpers/sanitizers");

module.exports = {
  renderLibaryTopic: async (req, res, next) => {
    const {getTopic} = require('../utilities/helpers/topicHelpers');
    const {getTopicVideos} = require("../utilities/helpers/videoHelpers");

    const pageStyles = 'lib/topicPage.css';

    let topicName = escapeHTML(req.params.topic);
    let topic = await getTopic(topicName);
    if (topic instanceof AppError) return next(topic);

    const videos = await getTopicVideos(topicName);
    if (videos instanceof AppError) return next(videos);

    res.render("lib/topicPage", {title: `${topicName} | Playlist`, pageStyles, user: req.user , topic: topic[0], videos});
  },
  renderVideoPage: async (req, res, next) => {
    const {getTopic} = require('../utilities/helpers/topicHelpers');
    const {getTopicVideos} = require("../utilities/helpers/videoHelpers");
    const {getVideo} = require("../utilities/helpers/videoHelpers");

    const pageStyles = 'lib/videoPage.css';

    let topicName = escapeHTML(req.params.topic);
    let topic = await getTopic(topicName);
    if (topic instanceof AppError) return next(topic);

    const videos = await getTopicVideos(topicName);
    if (videos instanceof AppError) return next(videos);

    let videoId = escapeHTML(req.params.video);
    let timestamp = null;
    if (videoId.includes('&t=')) {
      if (videoId.charAt(videoId.length - 1 === 's')) {
        timestamp = videoId.substring(videoId.indexOf('=') + 1,videoId.length - 1);
      }
    }
    videoId = removeParams(videoId);
    
    let video = await getVideo(videoId, topicName);
    if (video instanceof AppError) return next(video);

    video[0].videoId = videoId;

    res.render("lib/videoPage", {
      title: `${topicName} | ${video[0].title.substring(0,50)}`, 
      pageStyles, 
      user:req.user, 
      topic: topic[0], 
      videos, 
      video: video[0],
      timestamp
    });
  }
};
