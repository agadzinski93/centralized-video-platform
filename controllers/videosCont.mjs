import {AppError} from "../utilities/AppError.mjs";
import { getUser } from "../utilities/helpers/authHelpers.mjs";
import { escapeHTML,unescapeSQL } from "../utilities/helpers/sanitizers.mjs";
import { topicExists,enableHyphens } from "../utilities/helpers/topicHelpers.mjs";
import { 
    getVideos,
    getVideoInfo,
    getPlaylistInfo,
    getPlaylistVideos,
    insertVideo,
    insertManyVideos,
    videoExists,
    videoExistsInTopic,
    modifyVideo,
    swapVideoRecords,
    removeVideo,
    removeSelectedVideos
} from "../utilities/helpers/videoHelpers.mjs";

const createVideo = async (req, res, next) => {
    const USERNAME = escapeHTML(req.params.username);
    const videoUrl = escapeHTML(req.body.ytUrl);
    const topicName = escapeHTML(req.params.topic);
    const topicUrl = enableHyphens(topicName,true);
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
            res.redirect(`/user/${USERNAME}/dashboard/${topicUrl}`);
        }
    }

    let exists = await topicExists(topicName);

    if (exists instanceof AppError) return next(exists);
    else if (exists === 0) {
        req.flash("error", "Topic Doesn't Exists");
        res.redirect(`/user/${USERNAME}/dashboard`);
    } else {
        if (!isPlaylist) {
            let video = await getVideoInfo(vidId);
            if (video instanceof AppError) return next(video);
            
            let error = await insertVideo(video, topicName, USERNAME);
            if (error instanceof AppError) return next(error);
            
            req.flash('success', "Video Added");
            res.redirect(`/user/${USERNAME}/dashboard/${topicUrl}`);
        }
        else {
            let playlistInfo = await getPlaylistInfo(vidId);
            if (playlistInfo instanceof AppError) return next(playlistInfo);

            let result = await getPlaylistVideos(playlistInfo);
            if (result instanceof AppError) return next(result);
            
            let error = await insertManyVideos(result, topicName, USERNAME);
            if (error instanceof AppError) return next(error);

            let numOfVidsRequested = error.info.substring(error.info.indexOf('Records:') + 9, error.info.indexOf('Duplicates') - 2);
            let numOfVidsAdded = error.affectedRows;
            let numOfDuplicates = parseInt(numOfVidsRequested) - numOfVidsAdded;
            if (numOfVidsAdded === 1) {
                req.flash('success', `${numOfVidsAdded} video added. ${numOfVidsRequested} videos requested with ${numOfDuplicates} duplicates.`);
            }
            else {
                req.flash('success', `${numOfVidsAdded} videos added. ${numOfVidsRequested} videos requested with ${numOfDuplicates} duplicates.`);
            }
            res.redirect(`/user/${USERNAME}/dashboard/${topicUrl}`);
        }
        
    }
    
}
const editVideo = async (req,res,next) => {
    const title = escapeHTML(req.body.title);
    let description = escapeHTML(req.body.description);
    const id = req.params.video;
    const topicName = escapeHTML(req.params.topic);

    if (description.length > 2048) description = description.substring(0,2047);

    if (await videoExists(id)) {
        let result = await modifyVideo(id, title, description, null, false);

        if (result instanceof AppError) return next(result);

        req.flash('success', 'Video Updated');
        res.redirect(`/user/${req.params.username}/dashboard/${topicName}`);
    }
    else {
        req.flash('error', "Video Doesn't Exist");
        res.redirect(`/user/${req.params.username}/dashboard/${topicName}`);
    }
}
const swapVideos = async (req, res, next) => {
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
}
const refreshMetadata = async (req,res,next) => {
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
                    result = await modifyVideo(videos[i], vidInfo.title, vidInfo.description.substring(0,2047), vidInfo.thumbnail);
                    if (result instanceof AppError) break;
                    result.description = unescapeSQL(result.description);
                    result.title = unescapeSQL(result.title);
                    finalResult.push(result);
                }
            }
            else {
                vidInfos = await getVideos(videos);
                for (let i = 0; i < vidInfos.length; i++) {
                    vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                    result = await modifyVideo(videos[i], vidInfo.title, vidInfo.description.substring(0,2047), null);
                    if (result instanceof AppError) break;
                    result.description = unescapeSQL(result.description);
                    result.title = unescapeSQL(result.title);
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
                    result.title = unescapeSQL(result.title);
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
                    result.title = unescapeSQL(result.title);
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
                    result = await modifyVideo(videos[i], null, vidInfo.description.substring(0,2047), vidInfo.thumbnail);
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
                    result = await modifyVideo(videos[i], null, vidInfo.description.substring(0,2047), null);
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
}
const deleteVideo = async (req, res, next) => {
    const id = escapeHTML(req.params.video);
    const username = escapeHTML(req.params.username);
    const topicName = escapeHTML(req.params.topic);

    if (await videoExists(id)) {
        let result = await removeVideo(id);

        if (result instanceof AppError) return next(result);

        req.flash('success', 'Video Deleted');
        res.redirect(`/user/${username}/dashboard/${topicName}`);
    }
    else {
        req.flash('error', "Video Doesn't Exist");
        res.redirect(`/user/${username}/dashboard/${topicName}`);
    }
}
const deleteSelectedVideos = async (req, res, next) => {
    const {videos} = req.body;
    const result = await removeSelectedVideos(videos);

    if (result instanceof AppError) return next(result);

    res.json(result);
}
export {
    createVideo,
    editVideo,
    swapVideos,
    refreshMetadata,
    deleteVideo,
    deleteSelectedVideos
};