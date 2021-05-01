const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const {
  renderLibrary,
  renderLibaryCategory,
} = require("../controllers/libraryCont");

router.get("/", renderLibrary);

router.get("/:id", renderLibaryCategory);

module.exports = router;
