import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import passport from 'passport';
const router = express.Router();
import { isAuthor } from '../utilities/validators/middleware/userAuth.mjs';
import { 
    createVideo,
    editVideo,
    swapVideos,
    refreshMetadata,
    deleteVideo,
    deleteSelectedVideos
} from '../controllers/videosCont.mjs';

router.route('/:username/:topic/create')
    .post(passport.authenticate('cookie',{session:false}),isAuthor,createVideo)
    .all(verifyMethods(['POST']));

router.route('/:username/:topic/:video/edit')
    .put(passport.authenticate('cookie',{session:false}),isAuthor,editVideo)
    .all(verifyMethods(['PUT']));

router.route('/:username/swapVideos')
    .put(passport.authenticate('cookie',{session:false}),isAuthor,swapVideos)
    .all(verifyMethods(['PUT']));

router.route('/:username/refreshMetadata')
    .put(passport.authenticate('cookie',{session:false}),isAuthor,refreshMetadata)
    .all(verifyMethods(['PUT']));

router.route('/:username/:topic/:video/delete')
    .delete(passport.authenticate('cookie',{session:false}),isAuthor,deleteVideo)
    .all(verifyMethods(['DELETE']));

router.route('/:username/deleteSelected')
    .delete(passport.authenticate('cookie',{session:false}),isAuthor,deleteSelectedVideos)
    .all(verifyMethods(['DELETE']));

export {router};