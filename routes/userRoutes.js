const express = require("express");
const router = express.Router({ caseSensitive: false, strict: false });
const multer = require('multer');
const {storage} = require('../utilities/cloudinary');
const filter = require('../utilities/validators/fileValidator');
const parserProfilePic = multer({storage, fileFilter:filter, limits:{fileSize:1024000}});
const parserBanner = multer({storage, fileFilter:filter, limits:{fileSize:2048000}});
const { isLoggedIn, isAuthor } = require("../utilities/userAuth");
const {logoutUser} = require("../controllers/userAuthCont");
const {
  renderUserPage,
  renderUserSettings,
  updateRefreshMetadata,
  updateDisplayName,
  updateEmail,
  updateProfilePic,
  deleteProfilePic,
  updateAboutMe,
  updateBanner,
  renderUserDashboard,
  renderUserTopic,
  deleteBanner,
  deleteAccount,
} = require("../controllers/userCont");

router.get("/:username", renderUserPage);
router.get("/:username/settings", isLoggedIn, isAuthor, renderUserSettings);
router.patch("/:username/settings/updateRefreshMetadata", isLoggedIn, isAuthor, updateRefreshMetadata);
router.patch("/:username/settings/updateDisplayName", isLoggedIn, isAuthor, updateDisplayName);
router.patch("/:username/settings/updateEmail", isLoggedIn, isAuthor, updateEmail);
router.patch("/:username/settings/updateProfilePic", isLoggedIn, isAuthor, parserProfilePic.single('profileImage'), updateProfilePic);
router.delete("/:username/settings/updateProfilePic", isLoggedIn, isAuthor, deleteProfilePic);
router.patch("/:username/settings/updateAboutMe",isLoggedIn,isAuthor,updateAboutMe);
router.patch("/:username/settings/updateBanner", isLoggedIn, isAuthor, parserBanner.single('bannerImage'), updateBanner);
router.get("/:username/dashboard", isLoggedIn, isAuthor, renderUserDashboard);
router.get("/:username/dashboard/:topic", isLoggedIn, isAuthor, renderUserTopic);
router.delete("/:username/settings/deleteBanner", isLoggedIn, isAuthor, deleteBanner);
router.post("/:username/deleteAccount", isLoggedIn, isAuthor, deleteAccount, logoutUser);

module.exports = router;
