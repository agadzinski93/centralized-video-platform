const AppError = require("../utilities/AppError");
const { escapeHTML } = require("../utilities/helpers/sanitizers");
const {topicExists} = require("../utilities/helpers/topicHelpers");
const {getVideoInfo, insertVideo, videoExists, removeVideo} = require("../utilities/helpers/videoHelpers");

module.exports = {
    createVideo: async (req, res, next) => {
        const videoUrl = escapeHTML(req.body.ytUrl);
        const topicName = escapeHTML(req.params.topic);

        let exists = await topicExists(topicName);

        if (exists instanceof AppError) return next(exists);
        else if (exists === 0) {
            req.flash("error", "Topic Doesn't Exists");
            res.redirect(`/user/${req.user.username}/dashboard`);
        } else {
            let video = await getVideoInfo(videoUrl);
            if (video instanceof AppError) return next(video);
            
            const error = await insertVideo(video, topicName);
            if (error instanceof AppError) return next(error);
    
            req.flash('success', "Video Added");
            res.redirect(`/user/${req.params.username}/dashboard/${topicName}`);
    }

    },
    deleteVideo: async (req, res, next) => {
        const id = escapeHTML(req.params.video);

        if (await videoExists(id)) {
            let result = await removeVideo(id);

            if (result instanceof AppError) return next(result);

            req.flash('success', 'Video Deleted');
            res.redirect(`/user/${req.params.username}/dashboard/${req.params.topic}`);
        }
        else {
            req.flash('error', "Video Doesn't Exist");
            res.redirect(`/user/${req.params.username}/dashboard/${req.params.topic}`);
        }
    }
}