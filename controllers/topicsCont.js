const AppError = require("../utilities/AppError");
const { escapeHTML } = require("../utilities/helpers/sanitizers");
const {
  topicExists,
  insertTopic,
  updateTopic,
  modifyTopicImage,
  removeTopic,
  deleteTopicImage,
  removeSelectedTopics,
  enableHyphens,
} = require("../utilities/helpers/topicHelpers");

module.exports = {
  createTopic: async (req, res, next) => {
    const topicName = escapeHTML(req.body.topic.name);
    const topicDifficulty = req.body.topic.difficulty;
    const topicDescription = escapeHTML(req.body.topic.description);
    let topicImage,
        filename;
    if (req.file != undefined) {
      topicImage = req.file.path;
      filename = req.file.filename;
    }
    else {
      topicImage = null;
      filename = null;
    }

    const exists = await topicExists(topicName);
    if (exists instanceof AppError) return next(exists);
    else if (exists !== 0) {
      req.flash("error", "Topic Already Exists");
      res.redirect(`/user/${req.user.username}/dashboard`);
    } else {
      const error = await insertTopic(
        topicName,
        topicDifficulty,
        topicDescription,
        req.user.username,
        topicImage,
        filename,
      );
      if (error instanceof AppError) return next(error);
      req.flash("success", "Topic Created");
      res.redirect(`/user/${req.user.username}/dashboard`);
    }
  },
  editTopic: async (req, res, next) => {
    const originalTopicName = enableHyphens(escapeHTML(req.params.topic),false);
    const topicName = escapeHTML(req.body.topic.name);
    const topicDifficulty = req.body.topic.difficulty;
    const topicDescription = escapeHTML(req.body.topic.description);
    
    const result = await updateTopic(
      topicName,
      topicDifficulty,
      topicDescription,
      originalTopicName
    );
    
    if (result instanceof AppError) return next(result);
    else {
      req.flash("success", "Topic Updated");
      res.redirect(`/user/${req.user.username}/dashboard`);
    }
  },
  editTopicImage: async (req,res) => {
    const topicName = enableHyphens(escapeHTML(req.params.topic),false);
    let newImgUrl = null;

    let topicImage,
        filename;
    if (req.file != undefined) {
      topicImage = req.file.path;
      filename = req.file.filename;
    }
    else {
      topicImage = null;
      filename = null;
    }

    const exists = await topicExists(topicName);
    if (exists instanceof AppError) return res.json({error:'Topic Not Found'});
    else if (exists === 0) {
      res.json({error:'Topic Doesn\'t Exist'});
    } 
    else {
      let error = await deleteTopicImage(topicName);
      if (error instanceof AppError) return res.json({error:'Error Deleting Image'});
      error = await modifyTopicImage(
        topicName,
        topicImage,
        filename
      );
      if (error instanceof AppError) return res.json({error:'Error Uploading New Image'});

      newImgUrl = error;

    }
    res.json(newImgUrl);
  },
  deleteTopic: async (req, res, next) => {
    const topicName = enableHyphens(escapeHTML(req.params.topic),false);
    const result = await removeTopic(topicName);
    if (result instanceof AppError) return next(result);
    else {
      req.flash("success", "Topic Deleted");
      res.redirect(`/user/${req.user.username}/dashboard`);
    }
  },
  deleteSelectedTopics: async (req,res,next) => {
    let {topics} = req.body;
    
    const result = await removeSelectedTopics(topics);
    if (result instanceof AppError) return next(result);
    res.json(5);
  },
};
