import { ApiResponse } from "../utilities/ApiResponse";
import { topicLogger } from "../utilities/logger";
import { paramsExist } from "../utilities/validators/paramsExist";
import { AppError } from "../utilities/AppError";
import { escapeHTML } from "../utilities/helpers/sanitizers";
import { Cloudinary } from "../utilities/storage";
import {
  topicExists,
  insertTopic,
  updateTopic,
  modifyTopicImage,
  removeTopic,
  deleteTopicImage,
  removeSelectedTopics,
  enableHyphens
} from "../utilities/helpers/topicHelpers";

import { Request, Response, NextFunction } from "express";

const createTopic = async (req: Request, res: Response, next: NextFunction) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  if (req.user && paramsExist([req.body.name, req.body.difficulty, req.body.description])) {
    const topicName = escapeHTML(req.body.name);
    const topicDifficulty = req.body.difficulty;
    const topicDescription = escapeHTML(req.body.description);
    let topicImage: string,
      filename: string;
    if (req.file != undefined) {
      topicImage = req.file.path;
      filename = req.file.filename;
    }
    else {
      topicImage = '';
      filename = '';
    }

    const exists = await topicExists(topicName);
    if (exists instanceof AppError) {
      topicLogger.log('error', exists.message);
      Response.setStatus = exists.status;
      Response.applyMessage(exists.message, 'Error verifying topic\'s existence.');
    }
    else if (exists !== 0) {
      topicLogger.log('error', `Topic of name '${topicName}' already exists`);
      Response.setStatus = 409;
      Response.setMessage = `Topic of name '${topicName}' already exists`;
    } else {
      const topic = await insertTopic(
        topicName,
        topicDifficulty,
        topicDescription,
        req.user.username,
        topicImage,
        filename,
      );
      if (topic instanceof AppError) {
        topicLogger.log('error', topic.message);
        Response.setStatus = topic.status;
        Response.applyMessage(topic.message, 'Error inserting topic.');
      }
      else {
        Response.setApiResponse('success', 201, 'Topic created.', '/', topic);
      }
    }
  }
  else {
    topicLogger.log('error', 'Invalid Arguments');
    Response.setApiResponse('error', 422, 'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const editTopic = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  if (paramsExist([req.user?.username, req.body.name, req.body.difficulty, req.body.description])) {
    const originalTopicName = enableHyphens(escapeHTML(req.params.topic), false);
    const topicName = escapeHTML(req.body.name);
    const topicDifficulty = req.body.difficulty;
    const topicDescription = escapeHTML(req.body.description);

    const result = await updateTopic(
      topicName,
      topicDifficulty,
      topicDescription,
      originalTopicName
    );
    if (result instanceof AppError) {
      topicLogger.log('error', result.message);
      Response.setStatus = result.status;
      Response.applyMessage(result.message, 'Error updating topic.');
    }
    else {
      Response.setApiResponse('success', 200, 'Topic updated.', '/');
    }
  }
  else {
    topicLogger.log('error', 'Invalid Arguments');
    Response.setApiResponse('error', 422, 'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const editTopicImage = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  let filename = null;
  if (req.file && paramsExist([req.params.topic, req.file])) {
    const topicName = enableHyphens(escapeHTML(req.params.topic), false);
    let newImgUrl = null;

    let topicImage = req.file.path
    filename = req.file.filename;

    const exists = await topicExists(topicName);
    if (exists instanceof AppError) {
      topicLogger.log('error', exists.message);
      Response.setStatus = exists.status;
      Response.applyMessage(exists.message, 'Error validating topic.');
    }
    else if (exists === 0) {
      topicLogger.log('error', 'Topic does not exist.');
      Response.setStatus = 400;
      Response.setMessage = 'Topic does not exist.';
    }
    else {
      let error = await deleteTopicImage(topicName);
      if (error instanceof AppError) {
        topicLogger.log('error', error.message);
        Response.setStatus = error.status;
        Response.applyMessage(error.message, 'Error deleting topic image.');
      }
      else {
        newImgUrl = await modifyTopicImage(
          topicName,
          topicImage,
          filename
        );
        if (newImgUrl instanceof AppError) {
          topicLogger.log('error', newImgUrl.message);
          Response.setStatus = newImgUrl.status;
          Response.applyMessage(newImgUrl.message, 'Error uploading new image.');
        }
        else {
          Response.setApiResponse('success', 200, 'Successfully updated topic image.', '/', newImgUrl);
        }
      }
    }
  }
  else {
    topicLogger.log('error', 'Invalid Arguments');
    Response.setApiResponse('error', 422, 'Invalid Arguments');
  }
  if (Response.getResponse === 'error' && filename) Cloudinary.uploader.destroy(filename);
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const deleteTopic = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  if (req.user && paramsExist([req.params.topic])) {
    const topicName = enableHyphens(escapeHTML(req.params.topic), false);
    const result = await removeTopic(topicName);
    if (result instanceof AppError) {
      topicLogger.log('error', result.message);
      Response.setStatus = result.status;
      Response.applyMessage(result.message, 'Error deleting topic.');
    }
    else {
      Response.setApiResponse('success', 200, 'Topic deleted.', '/');
    }
  }
  else {
    topicLogger.log('error', 'Invalid Arguments');
    Response.setApiResponse('error', 422, 'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const deleteSelectedTopics = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  if (paramsExist([req.body.topics])) {
    let { topics } = req.body;

    const result = await removeSelectedTopics(topics);
    if (result instanceof AppError) {
      topicLogger.log('error', result.message);
      Response.setStatus = result.status;
      Response.applyMessage(result.message, 'Error deleting topics.');
    }
    else {
      if (topics.length === 1) {
        Response.setApiResponse('success', 200, `Successfully deleted ${topics.length} topic.`);
      }
      else {
        Response.setApiResponse('success', 200, `Successfully deleted ${topics.length} topics.`);
      }
    }
  }
  else {
    topicLogger.log('error', 'Invalid Arguments');
    Response.setApiResponse('error', 422, 'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
export { createTopic, editTopic, editTopicImage, deleteTopic, deleteSelectedTopics };