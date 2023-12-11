import express from 'express';
const router = express.Router({ caseSensitive: false, strict: false });
import multer from 'multer';
import { storage } from '../utilities/cloudinary.mjs';
import {filter} from '../utilities/validators/fileValidator.mjs';
const parserProfilePic = multer({storage, fileFilter:filter, limits:{fileSize:1024000}});
const parserBanner = multer({storage, fileFilter:filter, limits:{fileSize:2048000}});
import { isLoggedIn,isAuthor } from '../utilities/userAuth.mjs';
import { logoutUser } from '../controllers/userAuthCont.mjs';
import { 
  getUserContent,
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
  deleteAccount
} from '../controllers/userCont.mjs';

router.get("/:username", renderUserPage);
router.get("/:username/getUserContent",getUserContent);
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

export {router};