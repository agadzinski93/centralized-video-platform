const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const {
  renderLibrary,
  renderLibaryTopic,
} = require("../controllers/libraryCont");

router.get("/", renderLibrary);

router.get("/:topic", renderLibaryTopic);

module.exports = router;
