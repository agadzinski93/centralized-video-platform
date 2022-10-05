const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const { isLoggedIn, isAuthor } = require("../utilities/userAuth");
const {logoutUser} = require("../controllers/userAuthCont");
const {
  renderUserPage,
  renderUserSettings,
  updateRefreshMetadata,
  renderUserDashboard,
  renderUserTopic,
  deleteAccount,
} = require("../controllers/userCont");

router.get("/:username", renderUserPage);
router.get("/:username/settings", isLoggedIn, isAuthor, renderUserSettings);
router.patch("/:username/settings/updateRefreshMetadata", isLoggedIn, isAuthor, updateRefreshMetadata);
router.get("/:username/dashboard", isLoggedIn, isAuthor, renderUserDashboard);
router.get("/:username/dashboard/:topic", isLoggedIn, isAuthor, renderUserTopic);
router.post("/:username/deleteAccount", isLoggedIn, isAuthor, deleteAccount, logoutUser);

module.exports = router;
