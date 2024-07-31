import { AppError } from '../utilities/AppError';
import { ApiResponse } from '../utilities/ApiResponse';
import { PATH_CSS, PATH_ASSETS, API_PATH } from '../utilities/config/config';
import { escapeHTML } from '../utilities/helpers/sanitizers';
import { getRecentVideos, searchVideos, getMoreVideos } from '../utilities/helpers/videoHelpers';
import { enableHyphens, getRecentTopic } from '../utilities/helpers/topicHelpers';
import { getRedisCache, setRedisCache } from '../utilities/db/redisCache';
import { paramsExist } from '../utilities/validators/paramsExist';

import { Request, Response, NextFunction } from 'express';

const renderHome = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.locals.prevUrl = "/";

    const pageStyles = `${PATH_CSS}home.css`;
    const videos = await getRecentVideos();
    if (videos instanceof AppError) throw new Error(videos.message);
    for (let video of videos) {
      video.topicUrl = enableHyphens(video.topic, true);
    }
    const topics = await getRecentTopic();
    if (topics instanceof AppError) throw new Error(topics.message);
    for (let topic of topics) {
      topic.topicUrl = enableHyphens(topic.name, true);
    }
    const title = `Programming Help | Your Source For Programming Tutorials`;

    res.render("index", { title, pageStyles, PATH_CSS, PATH_ASSETS, API_PATH, user: req.user, videos, topics });
  } catch (err) {
    next(new AppError(500, (err as Error).message));
  }
}
const renderHomeScreen = async (req: Request, res: Response, next: NextFunction) => {
  const Response = new ApiResponse('error', 500, 'Something went wrong!', '/');
  const CACHE_KEY = 'url:home';
  try {
    const cache = await getRedisCache(CACHE_KEY);
    if (cache) {
      Response.setApiResponse(cache.response, cache.status, cache.message);
    }
    else {
      const videos = await getRecentVideos();
      if (videos instanceof AppError) {
        Response.setStatus = videos.status;
        Response.applyMessage(videos.message, 'Error retrieving recent videos.');
      }
      else {
        for (let video of videos) {
          video.topicUrl = enableHyphens(video.topic, true);
        }
        const topics = await getRecentTopic();
        if (topics instanceof AppError) {
          Response.setStatus = topics.status;
          Response.applyMessage(topics.message, 'Error retrieving recent topics.');
        }
        else {
          for (let topic of topics) {
            topic.topicUrl = enableHyphens(topic.name, true);
          }
          const output = {
            title: 'Programming Help | Your Source For Programming Tutorials',
            videos,
            topics
          }
          Response.setApiResponse('success', 200, 'Successfully retrieved home page data.', '/', output);
          await setRedisCache(CACHE_KEY, JSON.stringify(Response.getApiResponse()), { EX: 30 });
        }
      }
    }
  } catch (err) {
    Response.setMessage = `Error retrieving home page data: ${(err as Error).message}`;
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const renderSearch = async (req: Request, res: Response, next: NextFunction) => {
  const pageStyles = `${PATH_CSS}search.css`;
  let searchQuery = null,
    topics = null,
    videos = null;
  try {
    if (Object.keys(req.query).length === 1) {
      if (req.query.q && req.query.q !== '') {
        searchQuery = escapeHTML(req.query.q.toString());
        videos = await searchVideos(searchQuery);
        if (videos instanceof AppError) throw videos;
        for (let video of videos) {
          video.topicUrl = enableHyphens(video.topic, true);
        }
      }
    }

    res.render("search", { title: "Search Page", pageStyles, PATH_CSS, PATH_ASSETS, API_PATH, user: req.user, searchQuery, videos, topics });
  } catch (err) {
    next(new AppError(500, (err as Error).message));
  }
}
const renderSearchScreen = async (req: Request, res: Response) => {
  const Response = new ApiResponse('error', 500, 'Error rendering search screen.');
  const { q } = req.query;
  try {
    let searchQuery = null;

    if (q && q !== '') {
      searchQuery = escapeHTML(q.toString());
      const videos = await searchVideos(searchQuery);
      if (videos instanceof AppError) throw videos;

      for (let video of videos) video.topicUrl = enableHyphens(video.topic, true);

      Response.setApiResponse('success', 200, 'Successfully retrieved data for search screen', '/', { searchQuery, videos });
    } else {
      Response.setStatus = 422;
      Response.setMessage = 'Invalid arguments';
    }
  } catch (err) {
    if (err instanceof Error) {
      Response.applyMessage(err.message, 'Error rendering search screen.');
    }
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const getMoreResults = async (req: Request, res: Response, next: NextFunction) => {
  let output = new ApiResponse('error', 500, 'Something went wrong!');
  if (!req.body.searchQuery || !req.body.pageNumber) {
    output.setMessage = 'Trouble getting more videos';
  }
  else {
    let searchQuery = escapeHTML(req.body.searchQuery);
    let pageNumber = req.body.pageNumber;
    let videos;
    try {
      videos = await getMoreVideos(searchQuery, pageNumber);
      if (videos instanceof AppError) throw new Error(videos.message);
      for (let video of videos) {
        video.topicUrl = enableHyphens(video.topic, true);
      }
      output.setApiResponse('success', 200, 'Successfully retrieved more videos!', '/', videos);
    } catch (err) {
      output.setMessage = 'Trouble getting more videos.';
    }
  }
  res.status(output.getStatus).json(output.getApiResponse());
}
export { renderHome, renderHomeScreen, renderSearch, renderSearchScreen, getMoreResults };