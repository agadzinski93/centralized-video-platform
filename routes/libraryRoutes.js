const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const {
  renderLibaryTopic,
  renderVideoPage,
} = require("../controllers/libraryCont");

router.get("/:topic", renderLibaryTopic);

router.get("/:topic/:video", renderVideoPage);

module.exports = router;
