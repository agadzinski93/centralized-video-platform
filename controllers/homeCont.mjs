import {AppError} from '../utilities/AppError.mjs';
import { ApiResponse } from '../utilities/ApiResponse.mjs';
import { pathCSS,pathAssets } from '../utilities/config.mjs';
import { escapeHTML,escapeSQL } from '../utilities/helpers/sanitizers.mjs';
import { getRecentVideos, searchVideos, getMoreVideos } from '../utilities/helpers/videoHelpers.mjs';
import { enableHyphens, getRecentTopic } from '../utilities/helpers/topicHelpers.mjs';

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
export {renderHome,renderSearch,getMoreResults};