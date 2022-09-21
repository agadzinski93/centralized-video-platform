const AppError = require("../utilities/AppError");
const { escapeHTML } = require("../utilities/helpers/sanitizers");
const {topicExists} = require("../utilities/helpers/topicHelpers");
const {getVideoInfo, getPlaylistInfo, getPlaylistVideos, insertVideo, insertManyVideos,
    videoExists, videoExistsInTopic, 
    modifyVideo, swapVideoRecords, 
    removeVideo, removeSelectedVideos} = require("../utilities/helpers/videoHelpers");

module.exports = {
    createVideo: async (req, res, next) => {
        const videoUrl = escapeHTML(req.body.ytUrl);
        const topicName = escapeHTML(req.params.topic);
        let isPlaylist = false;

        const ytUrlTemplate = 'watch?v=';
        const ytPlaylistTemplate = 'playlist?list=';
        if (videoUrl.includes(ytUrlTemplate)) {
            vidId = videoUrl.substring(videoUrl.indexOf(ytUrlTemplate) + ytUrlTemplate.length);
        }
        else if (videoUrl.includes(ytPlaylistTemplate)) {
            vidId = videoUrl.substring(videoUrl.indexOf(ytPlaylistTemplate) + ytPlaylistTemplate.length);
            isPlaylist = true;
        }
        else {
            vidId = videoUrl;
        }
        
        if (!isPlaylist) {
            let wait = await videoExistsInTopic(vidId, topicName);
            if (wait) {
                req.flash("error", "Video Already Exists in Topic");
                res.redirect(`/user/${req.user.username}/dashboard/${topicName}`);
            }
        }
    
        let exists = await topicExists(topicName);

        if (exists instanceof AppError) return next(exists);
        else if (exists === 0) {
            req.flash("error", "Topic Doesn't Exists");
            res.redirect(`/user/${req.user.username}/dashboard`);
        } else {
            if (!isPlaylist) {
                let video = await getVideoInfo(vidId);
                if (video instanceof AppError) return next(video);
                
                let error = await insertVideo(video, topicName, req.user.username);
                if (error instanceof AppError) return next(error);
                
                req.flash('success', "Video Added");
                res.redirect(`/user/${req.params.username}/dashboard/${topicName}`);
            }
            else {
                let playlistInfo = await getPlaylistInfo(vidId);
                if (playlistInfo instanceof AppError) return next(playlistInfo);

                let result = await getPlaylistVideos(playlistInfo);
                if (result instanceof AppError) return next(result);
                
                let error = await insertManyVideos(result, topicName, req.user.username);
                if (error instanceof AppError) return next(error);
                
                req.flash('success', "Video Added");
                res.redirect(`/user/${req.params.username}/dashboard/${topicName}`);
            }
            
        }
        
    },
    editVideo: async (req,res,next) => {
        const title = escapeHTML(req.body.title);
        const description = escapeHTML(req.body.description);
        const id = req.params.video;

        if (await videoExists(id)) {
            let result = await modifyVideo(id, title, description);

            if (result instanceof AppError) return next(result);

            req.flash('success', 'Video Updated');
            res.redirect(`/user/${req.params.username}/dashboard/${req.params.topic}`);
        }
        else {
            req.flash('error', "Video Doesn't Exist");
            res.redirect(`/user/${req.params.username}/dashboard/${req.params.topic}`);
        }
    },
    swapVideos: async (req, res, next) => {
        const currentVidId = escapeHTML(req.body.currentVidId);
        const swapVidId = escapeHTML(req.body.swapVidId);

        if (await videoExists(currentVidId) && await videoExists(swapVidId)) {
            let result = await swapVideoRecords(currentVidId, swapVidId);

            if (result instanceof AppError) return next(result);

            res.json(result);
        }
        else {
            res.json({body:'Video Doesn\'t Exist'});
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
    },
    deleteSelectedVideos: async (req, res, next) => {
        const {videos} = req.body;
        const result = await removeSelectedVideos(videos);

        if (result instanceof AppError) return next(result);

        res.json(result);
    }
}