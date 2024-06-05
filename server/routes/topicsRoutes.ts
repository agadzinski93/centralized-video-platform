import express from 'express';
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods';
import multer from 'multer';
import { MULTER_STORAGE_ENGINE_NO_VALID, MULTER_STORAGE_ENGINE_TOPIC } from '../utilities/config';
import { filter } from '../utilities/validators/fileValidator';
const parser = multer({ ...MULTER_STORAGE_ENGINE_NO_VALID, fileFilter: filter, limits: { fileSize: 1024000 } });
const topicParser = multer({ ...MULTER_STORAGE_ENGINE_TOPIC, fileFilter: filter, limits: { fileSize: 1024000 } });
const router = express.Router({ caseSensitive: false, strict: false });
import {
  createTopic,
  editTopic,
  editTopicImage,
  deleteTopic,
  deleteSelectedTopics
} from '../controllers/topicsCont';
import { topicValidation } from '../utilities/validators/middleware/validators';
import { isLoggedIn, isAuthor } from '../utilities/validators/middleware/userAuth';

router.route('/:username/create')
  .post(isLoggedIn, isAuthor, topicParser.single('topic[file]'), topicValidation, createTopic)
  .all(verifyMethods(['POST']));

router.route('/:username/deleteSelected')
  .delete(isLoggedIn, isAuthor, deleteSelectedTopics)
  .all(verifyMethods(['DELETE']));

router.route('/:username/:topic')
  .put(isLoggedIn, isAuthor, topicValidation, editTopic)
  .delete(isLoggedIn, isAuthor, deleteTopic)
  .all(verifyMethods(['PUT,DELETE']));

router.route('/:username/:topic/image')
  .post(isLoggedIn, isAuthor, parser.single('topic[file]'), editTopicImage)
  .all(verifyMethods(['POST']));

export { router };
