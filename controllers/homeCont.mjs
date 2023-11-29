import {AppError} from '../utilities/AppError.mjs';
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
  let searchQuery = escapeSQL(escapeHTML(req.body.searchQuery));
  let pageNumber = req.body.pageNumber;
  let videos;
  try {
    videos = await getMoreVideos(searchQuery, pageNumber);
    for (let video of videos) {
      video.topicUrl = enableHyphens(video.topic,true);
    }
  } catch(err) {
    videos = new AppError(500, "Trouble getting more videos");
  }
  res.json(videos);
}
export {renderHome,renderSearch,getMoreResults};