const AppError = require('../utilities/AppError');
const {pathCSS} = require('../utilities/config');
const { escapeHTML, escapeSQL } = require("../utilities/helpers/sanitizers");
const {getRecentVideos, searchVideos, getMoreVideos} = require('../utilities/helpers/videoHelpers');
const {getRecentTopic} = require('../utilities/helpers/topicHelpers');

module.exports = {
    renderHome: async (req,res,next) => {
        try {
            const pageStyles = `${pathCSS}home.css`;
            const videos = await getRecentVideos();
            const topics = await getRecentTopic();
            
            res.render("index", { title: "Home Page", pageStyles, pathCSS, user: req.user, videos, topics});
          } catch (err) {
            next(new AppError(500, err.message));
          }
    },
    renderSearch: async (req,res,next) => {
      const pageStyles = `${pathCSS}search.css`;
      let searchQuery = null,
          topics = null,
          videos = null;
      try {
        if (Object.keys(req.query).length === 1) {
          if (req.query.q !== '') {
            searchQuery = escapeSQL(escapeHTML(req.query.q));
            videos = await searchVideos(searchQuery);
          }
        } 
        
        res.render("search", { title: "Search Page", pageStyles, pathCSS, user: req.user, searchQuery, videos, topics});
      } catch (err) {
        next(new AppError(500, err.message));
      }
    },
    getMoreResults: async (req,res,next) => {
      let searchQuery = escapeSQL(escapeHTML(req.body.searchQuery));
      let pageNumber = req.body.pageNumber;
      let videos;
      try {
        videos = await getMoreVideos(searchQuery, pageNumber);
      } catch(err) {
        videos = new AppError(500, "Trouble getting more videos");
      }
      res.json(videos);
    }
};