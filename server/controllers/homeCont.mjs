import {AppError} from '../utilities/AppError.mjs';
import { ApiResponse } from '../utilities/ApiResponse.mjs';
import { pathCSS,pathAssets } from '../utilities/config.mjs';
import { escapeHTML,escapeSQL } from '../utilities/helpers/sanitizers.mjs';
import { getRecentVideos, searchVideos, getMoreVideos } from '../utilities/helpers/videoHelpers.mjs';
import { enableHyphens, getRecentTopic } from '../utilities/helpers/topicHelpers.mjs';
import { getRedisCache, setRedisCache } from '../utilities/db/redisCache.mjs';
import { getRedisConnection } from '../utilities/db/redis.mjs';

const renderHome = async (req,res,next) => {
    try {
        req.session.prevUrl = "/";
        const pageStyles = `${pathCSS}home.css`;
        const videos = await getRecentVideos();
        for (let video of videos) {
          video.topicUrl = enableHyphens(video.topic,true);
        }
        const topics = await getRecentTopic();
        for (let topic of topics) {
          topic.topicUrl = enableHyphens(topic.name,true);
        }
        const title = `Programming Help | Your Source For Programming Tutorials`;

        res.render("index", { title, pageStyles, pathCSS, pathAssets, user: req.user, videos, topics});
      } catch (err) {
        next(new AppError(500, err.message));
      }
}
const renderHomeScreen = async (req,res,next) => {
  const Response = new ApiResponse('error',500,'Something went wrong!','/');
  const CACHE_KEY = 'url:home';
  try {
    const cache = await getRedisCache(CACHE_KEY);
    if (cache) {
      Response.setApiResponse(...Object.values(cache));
    }
    else {
      const videos = await getRecentVideos();
      if (videos instanceof AppError) {
        Response.setStatus = videos.status;
        Response.setMessage = (process.env.NODE_ENV !== 'production') ? videos.message : 'Error retrieving recent videos.';
      }
      else {
        for (let video of videos) {
          video.topicUrl = enableHyphens(video.topic,true);
        }
        const topics = await getRecentTopic();
        if (topics instanceof AppError) {
          Response.setStatus = topics.status;
          Response.setMessage = (process.env.NODE_ENV !== 'production') ? topics.message : 'Error retrieving recent videos.';
        }
        else {
          for (let topic of topics) {
            topic.topicUrl = enableHyphens(topic.name,true);
          }
          const output = {
            title: 'Programming Help | Your Source For Programming Tutorials',
            videos,
            topics
          }
          Response.setApiResponse('success',200,'Successfully retrieved home page data.','/',output);
          await setRedisCache(CACHE_KEY,JSON.stringify(Response.getApiResponse()),{EX:30});
        }
      }
    } 
  } catch (err) {
    Response.setMessage = `Error retrieving home page data: ${err.message}`;
  }
  res.status(Response.getStatus).json(Response.getApiResponse());
}
const renderSearch = async (req,res,next) => {
  const pageStyles = `${pathCSS}search.css`;
  let searchQuery = null,
      topics = null,
      videos = null;
  try {
    if (Object.keys(req.query).length === 1) {
      if (req.query.q !== '') {
        searchQuery = escapeSQL(escapeHTML(req.query.q));
        videos = await searchVideos(searchQuery);
        for (let video of videos) {
          video.topicUrl = enableHyphens(video.topic,true);
        }
      }
    } 
    
    res.render("search", { title: "Search Page", pageStyles, pathCSS, pathAssets, user: req.user, searchQuery, videos, topics});
  } catch (err) {
    next(new AppError(500, err.message));
  }
}
const getMoreResults = async (req,res,next) => {
  let output = new ApiResponse('error',500,'Something went wrong!');
  if (!req.body.searchQuery || !req.body.pageNumber) {
    output.setMessage = 'Trouble getting more videos';
  }
  else {
    let searchQuery = escapeSQL(escapeHTML(req.body.searchQuery));
    let pageNumber = req.body.pageNumber;
    let videos;
    try {
      videos = await getMoreVideos(searchQuery, pageNumber);
      for (let video of videos) {
        video.topicUrl = enableHyphens(video.topic,true);
      }
      output.setApiResponse('success',200,'Successfully retrieved more videos!',videos);
    } catch(err) {
      output.setMessage = 'Trouble getting more videos.';
    }
  }
  
  res.status(output.getStatus).json(output.getApiResponse());
}
export {renderHome,renderHomeScreen,renderSearch,getMoreResults};