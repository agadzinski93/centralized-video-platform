import { ApiResponse } from "../utilities/ApiResponse";
import { topicLogger } from "../utilities/logger";
import { paramsExist } from "../utilities/validators/paramsExist";
import { AppError } from "../utilities/AppError";
import { escapeHTML } from "../utilities/helpers/sanitizers";
import { deleteFile } from "../utilities/helpers/uploads";
import { setPathAndFilename } from "../utilities/helpers/uploads";
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

import { Request, Response } from "express";

const createTopic = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  const user = (req.user) ? req.user : res.locals.user;
  try {
    if (user && paramsExist([req.body.name, req.body.difficulty, req.body.description])) {
      const topicName = escapeHTML(req.body.name);
      const topicDifficulty = req.body.difficulty;
      const topicDescription = escapeHTML(req.body.description);

      const { path: topicImage, filename } = setPathAndFilename(req.file?.path, req.file?.filename);

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
          user.username,
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
  } catch (err) {
    if (err instanceof Error) {
      Response.applyMessage(err.message, 'Error editing topic image.');
      topicLogger.log('error', err.message);
    }
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const editTopic = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  const user = (req.user) ? req.user : res.locals.user;
  try {
    if (user && paramsExist([user.username, req.body.name, req.body.difficulty, req.body.description])) {
      const originalTopicName = enableHyphens(escapeHTML(req.params.topic), false);
      const topicName = escapeHTML(req.body.name);
      const topicDifficulty = req.body.difficulty;
      const topicDescription = escapeHTML(req.body.description);

      const exists = await topicExists(originalTopicName);
      if (exists instanceof AppError) throw exists;

      if (exists) {
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
          Response.setApiResponse('success', 200, 'Topic updated.', '/', { name: topicName, description: topicDescription, difficulty: topicDifficulty });
        }
      } else {
        Response.setStatus = 404;
        Response.setMessage = 'Topic doesn\'t exist.';
      }
    }
    else {
      topicLogger.log('error', 'Invalid Arguments');
      Response.setApiResponse('error', 422, 'Invalid Arguments');
    }
  } catch (err) {
    if (err instanceof Error) {
      Response.applyMessage(err.message, 'Error editing topic image.');
      topicLogger.log('error', err.message);
    }
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const editTopicImage = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  let filenameOutput: string | null = null;
  try {
    if (req.file && paramsExist([req.params.topic, req.file])) {
      const topicName = enableHyphens(escapeHTML(req.params.topic), false);
      let newImgUrl = null;

      const { path: topicImage, filename } = setPathAndFilename(req.file.path, req.file.filename);
      filenameOutput = filename;

      const exists = await topicExists(topicName);
      if (exists instanceof AppError) {
        topicLogger.log('error', exists.message);
        Response.setStatus = exists.status;
        Response.applyMessage(exists.message, 'Error validating topic.');
      }
      else if (exists === 0) {
        topicLogger.log('error', 'Topic does not exist.');
        Response.setStatus = 404;
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
  } catch (err) {
    if (err instanceof Error) {
      Response.applyMessage(err.message, 'Error editing topic image.');
      topicLogger.log('error', err.message);
    }
  }
  if (Response.getResponse === 'error' && filenameOutput) await deleteFile(filenameOutput);
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const deleteTopic = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  const user = (req.user) ? req.user : res.locals.user;
  try {
    if (user && paramsExist([req.params.topic])) {
      const topicName = enableHyphens(escapeHTML(req.params.topic), false);
      const result = await removeTopic(topicName);
      if (result instanceof AppError) {
        topicLogger.log('error', result.message);
        Response.setStatus = result.status;
        Response.applyMessage(result.message, 'Error deleting topic.');
      } else {
        Response.setApiResponse('success', 200, 'Topic deleted.', '/');
      }
    }
    else {
      topicLogger.log('error', 'Invalid Arguments');
      Response.setApiResponse('error', 422, 'Invalid Arguments');
    }
  } catch (err) {
    if (err instanceof Error) {
      Response.applyMessage(err.message, 'Error editing topic image.');
      topicLogger.log('error', err.message);
    }
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const deleteSelectedTopics = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
  try {
    if (paramsExist([req.body.topics])) {
      let { topics } = req.body;

      const result = await removeSelectedTopics(topics);
      if (result instanceof AppError) {
        topicLogger.log('error', result.message);
        Response.setStatus = result.status;
        Response.applyMessage(result.message, 'Error deleting topics.');
      }
      else {
        if (result === 1) {
          Response.setApiResponse('success', 200, `Successfully deleted ${result} topic.`);
        }
        else {
          Response.setApiResponse('success', 200, `Successfully deleted ${result} topics.`);
        }
      }
    }
    else {
      topicLogger.log('error', 'Invalid Arguments');
      Response.setApiResponse('error', 422, 'Invalid Arguments');
    }
  } catch (err) {
    if (err instanceof Error) {
      Response.applyMessage(err.message, 'Error editing topic image.');
      topicLogger.log('error', err.message);
    }
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
export { createTopic, editTopic, editTopicImage, deleteTopic, deleteSelectedTopics };