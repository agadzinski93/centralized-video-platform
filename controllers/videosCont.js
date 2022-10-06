const AppError = require("../utilities/AppError");
const { getUser } = require("../utilities/helpers/authHelpers");
const { escapeHTML, unescapeSQL} = require("../utilities/helpers/sanitizers");
const {topicExists} = require("../utilities/helpers/topicHelpers");
const {getVideos, getVideoInfo, getPlaylistInfo, getPlaylistVideos, insertVideo, insertManyVideos,
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
        let description = escapeHTML(req.body.description);
        const id = req.params.video;

        if (description.length > 1024) description = description.substring(0,1023);

        if (await videoExists(id)) {
            let result = await modifyVideo(id, title, description, null, false);

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
    refreshMetadata: async (req,res,next) => {
        const {videos} = req.body;
        let vidInfo,
            vidInfos,
            result,
            finalResult = new Array();

        const {settingRefreshTitle,
            settingRefreshDescription,
            settingRefreshThumbnail} = await getUser(req.user.username);

        if (settingRefreshTitle === 1) {
            if (settingRefreshDescription === 1) {
                if (settingRefreshThumbnail === 1) {
                    vidInfos = await getVideos(videos);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        result = await modifyVideo(videos[i], vidInfo.title, vidInfo.description.substring(0,1023), vidInfo.thumbnail);
                        if (result instanceof AppError) break;
                        result.description = unescapeSQL(result.description);
                        finalResult.push(result);
                    }
                }
                else {
                    vidInfos = await getVideos(videos);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        result = await modifyVideo(videos[i], vidInfo.title, vidInfo.description.substring(0,1023), null);
                        if (result instanceof AppError) break;
                        result.description = unescapeSQL(result.description);
                        result.thumbnail = null;
                        finalResult.push(result);
                    }
                }
            }
            else if (settingRefreshThumbnail === 1) {
                vidInfos = await getVideos(videos);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        result = await modifyVideo(videos[i], vidInfo.title, null, vidInfo.thumbnail);
                        if (result instanceof AppError) break;
                        result.description = null;
                        finalResult.push(result);
                    }
            }
            else {
                vidInfos = await getVideos(videos);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        result = await modifyVideo(videos[i], vidInfo.title, null, null);
                        if (result instanceof AppError) break;
                        result.description = null;
                        result.thumbnail = null;
                        finalResult.push(result);
                    }
            }
        }
        else if (settingRefreshDescription === 1) {
            if (settingRefreshThumbnail === 1) {
                vidInfos = await getVideos(videos);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        result = await modifyVideo(videos[i], null, vidInfo.description.substring(0,1023), vidInfo.thumbnail);
                        if (result instanceof AppError) break;
                        result.title = null;
                        result.description = unescapeSQL(result.description);
                        finalResult.push(result);
                    }
            }
            else {
                vidInfos = await getVideos(videos);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        result = await modifyVideo(videos[i], null, vidInfo.description.substring(0,1023), null);
                        if (result instanceof AppError) break;
                        result.title = null;
                        result.description = unescapeSQL(result.description);
                        result.thumbnail = null;
                        finalResult.push(result);
                    }
            }
        }
        else if (settingRefreshThumbnail === 1) {
            vidInfos = await getVideos(videos);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        result = await modifyVideo(videos[i], null, null, vidInfo.thumbnail);
                        if (result instanceof AppError) break;
                        result.title = null;
                        result.description = null;
                        finalResult.push(result);
                    }
        }
        else {
            finalResult = {result:'All Refresh Settings Are Off'};
        }
        if (result instanceof AppError) {
            res.json({response: 'error'});
        }
        else {
            res.json({finalResult});
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