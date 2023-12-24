import express from 'express';
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
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
import { 
  isLoggedIn,
  isAuthor 
} from '../utilities/userAuth.mjs';

router.route('/:username/create')
  .post(isLoggedIn,isAuthor,parser.single('topic[file]'),topicValidation,createTopic)
  .all(verifyMethods(['POST']));

router.route('/:username/edit/:topic')
  .post(isLoggedIn,isAuthor,topicValidation,editTopic)
  .all(verifyMethods(['POST']));

router.route('/:username/editImage/:topic')
  .post(isLoggedIn,isAuthor,parser.single('topic[file]'), editTopicImage)
  .all(verifyMethods(['POST']));

router.route('/:username/delete/:topic')
  .post(isLoggedIn, isAuthor, deleteTopic)
  .all(verifyMethods(['DELETE']));

router.route('/:username/deleteSelected')
  .delete(isLoggedIn, isAuthor, deleteSelectedTopics)
  .all(verifyMethods(['DELETE']));

export {router};
