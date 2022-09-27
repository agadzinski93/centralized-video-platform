const AppError = require('../utilities/AppError');
const { escapeHTML, removeParams } = require("../utilities/helpers/sanitizers");
const {getRecentVideos} = require('../utilities/helpers/videoHelpers');
const {getRecentTopic} = require('../utilities/helpers/topicHelpers');

module.exports = {
    renderHome: async (req,res,next) => {
        try {
            const pageStyles = 'home.css';
            const videos = await getRecentVideos();
            const topics = await getRecentTopic();
            
            res.render("index", { title: "Home Page", pageStyles, user: req.user, videos, topics});
          } catch (err) {
            next(new AppError(500, err.message));
          }
    },
    renderSearch: async (req,res,next) => {

    }
};