import express from 'express';
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

router.post(
  "/:username/create",
  isLoggedIn,
  isAuthor,
  parser.single('topic[file]'),
  topicValidation,
  createTopic
);

router.post(
  "/:username/edit/:topic",
  isLoggedIn,
  isAuthor,
  topicValidation,
  editTopic
);

router.post("/:username/editImage/:topic",isLoggedIn, isAuthor, parser.single('topic[file]'), editTopicImage);

router.post("/:username/delete/:topic", isLoggedIn, isAuthor, deleteTopic);

router.delete("/:username/deleteSelected", isLoggedIn, isAuthor, deleteSelectedTopics);

export {router};
