const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const { createTopic, deleteTopic } = require("../controllers/topicsCont");
const {
  topicValidation,
} = require("../utilities/validators/middleware/validators");
const { isLoggedIn, isAuthor } = require("../utilities/userAuth");

router.post(
  "/:username/create",
  isLoggedIn,
  isAuthor,
  topicValidation,
  createTopic
);

router.post("/:username/delete/:topic", isLoggedIn, isAuthor, deleteTopic);

module.exports = router;
