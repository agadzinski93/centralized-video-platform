import { ApiResponse } from "../utilities/ApiResponse.mjs";
import { topicLogger } from "../utilities/logger.mjs";
import { paramsExist } from "../utilities/validators/paramsExist.mjs";
import {AppError} from "../utilities/AppError.mjs";
import { escapeHTML } from "../utilities/helpers/sanitizers.mjs";
import { 
  topicExists,
  insertTopic,
  updateTopic,
  modifyTopicImage,
  removeTopic,
  deleteTopicImage,
  removeSelectedTopics,
  enableHyphens
} from "../utilities/helpers/topicHelpers.mjs";

const createTopic = async (req, res, next) => {
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.user?.username,req.body.name,req.body.difficulty,req.body.description])) {
    const topicName = escapeHTML(req.body.name);
    const topicDifficulty = req.body.difficulty;
    const topicDescription = escapeHTML(req.body.description);
    let topicImage,
        filename;
    if (req.file != undefined) {
      topicImage = req.file.path;
      filename = req.file.filename;
    }
    else {
      topicImage = null;
      filename = null;
    }

    const exists = await topicExists(topicName);
    if (exists instanceof AppError) {
      topicLogger.log('error',exists.message);
      Response.setStatus = exists.status;
      Response.setMessage = (process.env.NODE_ENV !== 'production') ? exists.message : 'Error verifying topic\'s existence.';
    }
    else if (exists !== 0) {
      topicLogger.log('error',`Topic of name '${topicName}' already exists`);
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
        topicLogger.log('error',topic.message);
        Response.setStatus = topic.status;
        Response.setMessage = (process.env.NODE_ENV !== 'production') ? topic.message : 'Error inserting topic.';
      }
      else {
        Response.setApiResponse('success',201,'Topic created.','/',topic);
      }
    }
  }
  else {
    topicLogger('error','Invalid Arguments');
    Response.setApiResponse('error',422,'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const editTopic = async (req, res) => {
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.user?.username,req.body.name,req.body.difficulty,req.body.description])) {
    const originalTopicName = enableHyphens(escapeHTML(req.params.topic),false);
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
      topicLogger('error',result.message);
      Response.setStatus = result.status;
      Response.setMessage = (process.env.NODE_ENV !== 'production') ? result.message : 'Error updating topic.';
    }
    else {
      Response.setApiResponse('success',200,'Topic updated.','/');
    }
  }
  else {
    topicLogger('error','Invalid Arguments');
    Response.setApiResponse('error',422,'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const editTopicImage = async (req,res) => {
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.params.topic,req.file])) {
    const topicName = enableHyphens(escapeHTML(req.params.topic),false);
    let newImgUrl = null;

    let topicImage = req.file.path,
        filename = req.file.filename;

    const exists = await topicExists(topicName);
    if (exists instanceof AppError) {
      topicLogger('error',exists.message);
      Response.setStatus = exists.status;
      Response.setMessage = (process.env.NODE_ENV !== 'production') ? exists.message : 'Error validating topic.';
    }
    else if (exists === 0) {
      topicLogger('error','Topic does not exist.');
      Response.setStatus = 400;
      Response.setMessage = 'Topic does not exist.';
    } 
    else {
      let error = await deleteTopicImage(topicName);
      if (error instanceof AppError) {
        topicLogger('error',error.message);
        Response.setStatus = error.status;
        Response.setMessage = (process.env.NODE_ENV !== 'production') ? error.message : 'Error deleting topic image.';
      }
      else {
        newImgUrl = await modifyTopicImage(
          topicName,
          topicImage,
          filename
        );
        if (newImgUrl instanceof AppError) {
          topicLogger('error',newImgUrl.message);
          Response.setStatus = newImgUrl.status;
          Response.setMessage = (process.env.NODE_ENV !== 'production') ? newImgUrl.message : 'Error uploading new image.';
        }
        else {
          Response.setApiResponse('success',200,'Successfully updated topic image.','/',newImgUrl);
        }
      }
    }
  }
  else {
    topicLogger('error','Invalid Arguments');
    Response.setApiResponse('error',422,'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const deleteTopic = async (req, res) => {
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.user.username,req.params.topic])) {
    const topicName = enableHyphens(escapeHTML(req.params.topic),false);
    const result = await removeTopic(topicName);
    if (result instanceof AppError) {
      topicLogger('error',result.message);
      Response.setStatus = result.status;
      Response.setMessage = (process.env.NODE_ENV !== 'production') ? result.message : 'Error deleting topic.';
    }
    else {
      Response.setApiResponse('success',200,'Topic deleted.','/');
    }
  }
  else {
    topicLogger('error','Invalid Arguments');
    Response.setApiResponse('error',422,'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const deleteSelectedTopics = async (req,res) => {
  const Response = new ApiResponse('error',500,'Something went wrong.','/');
  if (paramsExist([req.body.topics])) {
    let {topics} = req.body;
  
    const result = await removeSelectedTopics(topics);
    if (result instanceof AppError) {
      topicLogger('error',result.message);
      Response.setStatus = result.status;
      Response.setMessage = (process.env.NODE_ENV !== 'production') ? result.message : 'Error deleting topics.';
    }
    else {
      if (topics.length === 1) {
        Response.setApiResponse('success',200,`Successfully deleted ${topics.length} topic.`);
      }
      else {
        Response.setApiResponse('success',200,`Successfully deleted ${topics.length} topics.`);
      }
    }
  }
  else {
    topicLogger('error','Invalid Arguments');
    Response.setApiResponse('error',422,'Invalid Arguments');
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
export {createTopic,editTopic,editTopicImage,deleteTopic,deleteSelectedTopics};