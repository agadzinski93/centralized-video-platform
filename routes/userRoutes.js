const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const { isLoggedIn, isAuthor } = require("../utilities/userAuth");
const {
  renderUserPage,
  renderUserSettings,
  renderUserDashboard,
  renderUserTopic,
} = require("../controllers/userCont");

router.get("/:username", renderUserPage);
router.get("/:username/settings", isLoggedIn, isAuthor, renderUserSettings);
router.get("/:username/dashboard", isLoggedIn, isAuthor, renderUserDashboard);
router.get("/:username/dashboard/:topic", isLoggedIn, isAuthor, renderUserTopic);

module.exports = router;
