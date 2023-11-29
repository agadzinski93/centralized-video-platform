import express from 'express'
const router = express.Router({ caseSensitive: false, strict: false });
import {
  renderLibaryTopic,
  renderVideoPage 
} from '../controllers/libraryCont.mjs';
router.get("/:topic", renderLibaryTopic);

router.get("/:topic/:video", renderVideoPage);

export {router};
