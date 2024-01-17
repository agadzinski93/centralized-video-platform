import express from 'express';
const router = express.Router({ caseSensitive: false, strict: false });
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import { setHeaders } from '../utilities/validators/middleware/setHeaders.mjs';
import multer from 'multer';
import { storage } from '../utilities/cloudinary.mjs';
import {filter} from '../utilities/validators/fileValidator.mjs';
const parserProfilePic = multer({storage, fileFilter:filter, limits:{fileSize:1024000}});
const parserBanner = multer({storage, fileFilter:filter, limits:{fileSize:2048000}});
import { isLoggedIn,isAuthor } from '../utilities/validators/middleware/userAuth.mjs';
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

router.route('/:username')
  .get(setHeaders,renderUserPage)
  .all(verifyMethods(['GET']));

router.route('/:username/getUserContent')
  .get(getUserContent)
  .all(verifyMethods(['GET']));

router.route('/:username/settings')
  .get(setHeaders,isLoggedIn,isAuthor,renderUserSettings)
  .all(verifyMethods(['GET']));

router.route('/:username/settings/updateRefreshMetadata')
  .patch(isLoggedIn,isAuthor,updateRefreshMetadata)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateDisplayName')
  .patch(isLoggedIn,isAuthor,updateDisplayName)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateEmail')
  .patch(isLoggedIn,isAuthor,updateEmail)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateProfilePic')
  .patch(isLoggedIn, isAuthor, parserProfilePic.single('profileImage'), updateProfilePic)
  .delete(isLoggedIn,isAuthor,deleteProfilePic)
  .all(verifyMethods(['PATCH','DELETE']));

router.route('/:username/settings/updateAboutMe')
  .patch(isLoggedIn,isAuthor,updateAboutMe)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateBanner')
  .patch(isLoggedIn,isAuthor, parserBanner.single('bannerImage'), updateBanner)
  .all(verifyMethods(['PATCH']));

router.route('/:username/dashboard')
  .get(setHeaders,isLoggedIn,isAuthor,renderUserDashboard)
  .all(verifyMethods(['GET']));

router.route('/:username/dashboard/:topic')
  .get(isLoggedIn,isAuthor,renderUserTopic)
  .all(verifyMethods(['GET']));

router.route('/:username/settings/deleteBanner')
  .delete(isLoggedIn,isAuthor,deleteBanner)
  .all(verifyMethods(['DELETE']));

router.route('/:username/deleteAccount')
  .post(isLoggedIn,isAuthor,deleteAccount,logoutUser)
  .all(verifyMethods(['POST']));

export {router};