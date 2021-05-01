const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const { isLoggedIn, isAuthor } = require("../utilities/userAuth");
const {
  renderUserPage,
  renderUserSettings,
  renderUserDashboard,
} = require("../controllers/userCont");

router.get("/:username", renderUserPage);
router.get("/:username/settings", isLoggedIn, renderUserSettings);
router.get("/:username/dashboard", isLoggedIn, isAuthor, renderUserDashboard);

module.exports = router;
