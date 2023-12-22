import express from 'express'
import { verifyMethods } from '../utilities/validators/middleware/verifyMethods.mjs';
const router = express.Router({ caseSensitive: false, strict: false });
import {
  renderLibaryTopic,
  renderVideoPage 
} from '../controllers/libraryCont.mjs';

router.all("/:topic", verifyMethods({
  GET:{
    cont: renderLibaryTopic
  }
}))

router.all("/:topic/:video", verifyMethods({
  GET:{
    cont: renderVideoPage
  }
}));

export {router};
