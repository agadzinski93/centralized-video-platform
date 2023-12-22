import express from 'express';
const router = express.Router({ caseSensitive: false, strict: false });
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
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

router.all('/:username',verifyMethods({
  GET:{
    cont:renderUserPage
  }
}));

router.all('/:username/getUserContent',verifyMethods({
  GET:{
    cont:getUserContent
  }
}));

router.all('/:username/settings',verifyMethods({
  GET:{
    pre:[isLoggedIn,isAuthor],
    cont: renderUserSettings
  }
}));

router.all('/:username/settings/updateRefreshMetadata',verifyMethods({
  PATCH:{
    pre:[isLoggedIn,isAuthor],
    cont: updateRefreshMetadata
  }
}));

router.all('/:username/settings/updateDisplayName',verifyMethods({
  PATCH:{
    pre:[isLoggedIn,isAuthor],
    cont:updateDisplayName
  }
}));

router.all('/:username/settings/updateEmail',verifyMethods({
  PATCH:{
    pre:[isLoggedIn,isAuthor],
    cont:updateEmail
  }
}));

router.all('/:username/settings/updateProfilePic',verifyMethods({
  PATCH:{
    pre:[isLoggedIn,isAuthor,parserProfilePic.single.bind(null,'profileImage')],
    cont:updateProfilePic
  },
  DELETE:{
    pre:[isLoggedIn,isAuthor],
    cont:deleteProfilePic
  }
}));

router.all('/:username/settings/updateAboutMe',verifyMethods({
  PATCH:{
    pre:[isLoggedIn,isAuthor],
    cont:updateAboutMe
  }
}));

router.all('/:username/settings/updateBanner',verifyMethods({
  PATCH:{
    pre:[isLoggedIn,isAuthor, parserBanner.single.bind(null,'bannerImage')],
    cont:updateBanner
  }
}));

router.all('/:username/dashboard',verifyMethods({
  GET:{
    pre:[isLoggedIn,isAuthor],
    cont:renderUserDashboard
  }
}));

router.all('/:username/dashboard/:topic',verifyMethods({
  GET:{
    pre:[isLoggedIn,isAuthor],
    cont:renderUserTopic
  }
}));

router.all('/:username/settings/deleteBanner',verifyMethods({
  DELETE:{
    pre:[isLoggedIn,isAuthor],
    cont:deleteBanner
  }
}));

router.all('/:username/deleteAccount',verifyMethods({
  POST:{
    pre:[isLoggedIn,isAuthor, deleteAccount],
    cont:logoutUser
  }
}));

/*
router.patch("/:username/settings/updateProfilePic", isLoggedIn, isAuthor, parserProfilePic.single('profileImage'), updateProfilePic); --Done-LoggedOut
router.delete("/:username/settings/updateProfilePic", isLoggedIn, isAuthor, deleteProfilePic); --Done-LoggedOut
router.patch("/:username/settings/updateBanner", isLoggedIn, isAuthor, parserBanner.single('bannerImage'), updateBanner); --Done-LoggedOut
router.delete("/:username/settings/deleteBanner", isLoggedIn, isAuthor, deleteBanner); --Done-LoggedOut
router.post("/:username/deleteAccount", isLoggedIn, isAuthor, deleteAccount, logoutUser); --Done-LoggedOut 
*/

export {router};