import express from 'express';
const router = express.Router({ caseSensitive: false, strict: false });
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import { setHeaders } from '../utilities/validators/middleware/setHeaders.mjs';
import passport from 'passport';
import multer from 'multer';
import { storage } from '../utilities/cloudinary.mjs';
import {filter} from '../utilities/validators/fileValidator.mjs';
const parserProfilePic = multer({storage, fileFilter:filter, limits:{fileSize:1024000}});
const parserBanner = multer({storage, fileFilter:filter, limits:{fileSize:2048000}});
import { isLoggedInOptional,isAuthor } from '../utilities/validators/middleware/userAuth.mjs';
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
  .get(isLoggedInOptional,setHeaders,renderUserPage)
  .all(verifyMethods(['GET']));

router.route('/:username/getUserContent')
  .get(getUserContent)
  .all(verifyMethods(['GET']));

router.route('/:username/settings')
  .get(setHeaders,passport.authenticate('cookie',{session:false}),isAuthor,renderUserSettings)
  .all(verifyMethods(['GET']));

router.route('/:username/settings/updateRefreshMetadata')
  .patch(passport.authenticate('cookie',{session:false}),isAuthor,updateRefreshMetadata)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateDisplayName')
  .patch(passport.authenticate('cookie',{session:false}),isAuthor,updateDisplayName)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateEmail')
  .patch(passport.authenticate('cookie',{session:false}),isAuthor,updateEmail)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateProfilePic')
  .patch(passport.authenticate('cookie',{session:false}), isAuthor, parserProfilePic.single('profileImage'), updateProfilePic)
  .delete(passport.authenticate('cookie',{session:false}),isAuthor,deleteProfilePic)
  .all(verifyMethods(['PATCH','DELETE']));

router.route('/:username/settings/updateAboutMe')
  .patch(passport.authenticate('cookie',{session:false}),isAuthor,updateAboutMe)
  .all(verifyMethods(['PATCH']));

router.route('/:username/settings/updateBanner')
  .patch(passport.authenticate('cookie',{session:false}),isAuthor, parserBanner.single('bannerImage'), updateBanner)
  .all(verifyMethods(['PATCH']));

router.route('/:username/dashboard')
  .get(setHeaders,passport.authenticate('cookie',{session:false}),isAuthor,renderUserDashboard)
  .all(verifyMethods(['GET']));

router.route('/:username/dashboard/:topic')
  .get(passport.authenticate('cookie',{session:false}),isAuthor,renderUserTopic)
  .all(verifyMethods(['GET']));

router.route('/:username/settings/deleteBanner')
  .delete(passport.authenticate('cookie',{session:false}),isAuthor,deleteBanner)
  .all(verifyMethods(['DELETE']));

router.route('/:username/deleteAccount')
  .post(passport.authenticate('cookie',{session:false}),isAuthor,deleteAccount,logoutUser)
  .all(verifyMethods(['POST']));

export {router};