import express from 'express';
const router = express.Router({ caseSensitive: false, strict: false });
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods';
import { setCache } from '../utilities/validators/middleware/setHeaders';
import multer from 'multer';
import { MULTER_STORAGE_ENGINE_NO_VALID } from '../utilities/config/storage';
import { filter } from '../utilities/validators/fileValidator';
const parserProfilePic = multer({ ...MULTER_STORAGE_ENGINE_NO_VALID, fileFilter: filter, limits: { fileSize: 1024000 } });
const parserBanner = multer({ ...MULTER_STORAGE_ENGINE_NO_VALID, fileFilter: filter, limits: { fileSize: 2048000 } });
import { isLoggedIn, isAuthor } from '../utilities/validators/middleware/userAuth';
import { logoutUser } from '../controllers/userAuthCont';
import {
  getUserContent,
  renderUserPage,
  renderUserScreen,
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
} from '../controllers/userCont';

router.route('/:username')
  .get(setCache, renderUserPage)
  .delete(isLoggedIn, isAuthor, deleteAccount)
  .all(verifyMethods(['GET', 'DELETE']));

router.route('/:username/renderUserScreen')
  .get(setCache, renderUserScreen)
  .all(verifyMethods(['GET']));

router.route('/:username/getUserContent')
  .get(getUserContent)
  .all(verifyMethods(['GET']));

router.route('/:username/settings')
  .get(setCache, isLoggedIn, isAuthor, renderUserSettings)
  .all(verifyMethods(['GET']));

router.route('/:username/settings/updateRefreshMetadata')
  .patch(isLoggedIn, isAuthor, updateRefreshMetadata)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateDisplayName')
  .patch(isLoggedIn, isAuthor, updateDisplayName)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateEmail')
  .patch(isLoggedIn, isAuthor, updateEmail)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateProfilePic')
  .patch(isLoggedIn, isAuthor, parserProfilePic.single('profileImage'), updateProfilePic)
  .delete(isLoggedIn, isAuthor, deleteProfilePic)
  .all(verifyMethods(['PATCH', 'DELETE']));

router.route('/:username/settings/updateAboutMe')
  .patch(isLoggedIn, isAuthor, updateAboutMe)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateBanner')
  .patch(isLoggedIn, isAuthor, parserBanner.single('bannerImage'), updateBanner)
  .delete(isLoggedIn, isAuthor, deleteBanner)
  .all(verifyMethods(['PATCH', 'DELETE']));

router.route('/:username/dashboard')
  .get(setCache, isLoggedIn, isAuthor, renderUserDashboard)
  .all(verifyMethods(['GET']));

router.route('/:username/dashboard/:topic')
  .get(isLoggedIn, isAuthor, renderUserTopic)
  .all(verifyMethods(['GET']));

export { router };