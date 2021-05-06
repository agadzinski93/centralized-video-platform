const AppError = require('../utilities/AppError');
const { escapeHTML } = require("../utilities/helpers/sanitizers");

module.exports = {
  renderLibrary: async (req, res, next) => {
      const {getAllTopics} = require('../utilities/helpers/topicHelpers');
      const topics = await getAllTopics();
      if (topics instanceof AppError) return next(topics);

      res.render("lib/topics", {title: "Library", topics});
  },
  renderLibaryTopic: async (req, res, next) => {
    //res.send(`${req.params.topic} Page`);
    const {getTopic} = require('../utilities/helpers/topicHelpers');
    const {getTopicVideos} = require("../utilities/helpers/videoHelpers");
    let topicName = escapeHTML(req.params.topic);
    let topic = await getTopic(topicName);
    if (topic instanceof AppError) return next(topic);

    const videos = await getTopicVideos(topicName);
    if (videos instanceof AppError) return next(videos);

    console.log(topic);

    res.render("lib/videos", {title: `${topicName} Playlist`, topic: topic[0], videos});
  },
};
