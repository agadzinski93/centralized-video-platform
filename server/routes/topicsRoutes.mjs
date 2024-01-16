import express from 'express';
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
import passport from 'passport';
import multer from 'multer';
import { storage } from '../utilities/cloudinary.mjs';
import {filter} from '../utilities/validators/fileValidator.mjs';
const parser = multer({storage, fileFilter:filter, limits:{fileSize:1024000}});
const router = express.Router({ caseSensitive: false, strict: false });
import { 
  createTopic,
  editTopic,
  editTopicImage,
  deleteTopic,
  deleteSelectedTopics
} from '../controllers/topicsCont.mjs';
import { topicValidation } from '../utilities/validators/middleware/validators.mjs';
import { isAuthor } from '../utilities/validators/middleware/userAuth.mjs';

router.route('/:username/create')
  .post(passport.authenticate('cookie',{session:false}),isAuthor,parser.single('topic[file]'),topicValidation,createTopic)
  .all(verifyMethods(['POST']));

router.route('/:username/edit/:topic')
  .put(passport.authenticate('cookie',{session:false}),isAuthor,topicValidation,editTopic)
  .all(verifyMethods(['PUT']));

router.route('/:username/editImage/:topic')
  .post(passport.authenticate('cookie',{session:false}),isAuthor,parser.single('topic[file]'), editTopicImage)
  .all(verifyMethods(['POST']));

router.route('/:username/delete/:topic')
  .delete(passport.authenticate('cookie',{session:false}), isAuthor, deleteTopic)
  .all(verifyMethods(['DELETE']));

router.route('/:username/deleteSelected')
  .delete(passport.authenticate('cookie',{session:false}), isAuthor, deleteSelectedTopics)
  .all(verifyMethods(['DELETE']));

export {router};
