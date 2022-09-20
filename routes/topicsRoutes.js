const express = require("express");
const multer = require('multer');
const {storage} = require('../utilities/cloudinary');
const filter = require("../utilities/validators/fileValidator");
const parser = multer({storage, fileFilter:filter, limits:{fileSize:1024000}});

const router = express.Router({ caseSensitive: false, strict: false });
const {
  createTopic,
  editTopic,
  deleteTopic,
  deleteSelectedTopics,
} = require("../controllers/topicsCont");
const {
  topicValidation,
} = require("../utilities/validators/middleware/validators");
const { isLoggedIn, isAuthor } = require("../utilities/userAuth");

router.post(
  "/:username/create",
  isLoggedIn,
  isAuthor,
  parser.single('topic[file]'),
  topicValidation,
  createTopic
);

router.post(
  "/:username/edit/:topic",
  isLoggedIn,
  isAuthor,
  topicValidation,
  editTopic
);
router.post("/:username/delete/:topic", isLoggedIn, isAuthor, deleteTopic);

router.delete("/:username/deleteSelected", isLoggedIn, isAuthor, deleteSelectedTopics);

module.exports = router;
