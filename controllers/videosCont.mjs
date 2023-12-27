import { ApiResponse } from "../utilities/ApiResponse.mjs";
import {AppError} from "../utilities/AppError.mjs";
import {paramsExist} from '../utilities/validators/paramsExist.mjs'
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
    const Response = new ApiResponse('error',500,'Something went wrong.');
    let outputData = {};
    
    if (paramsExist([req.params.username,req.body.ytUrl,req.params.topic])) {
        const USERNAME = escapeHTML(req.params.username);
        const videoUrl = escapeHTML(req.body.ytUrl);
        const topicName = escapeHTML(req.params.topic);
        const topicNameNoDash = enableHyphens(topicName,false);
        let vidId;
        let isPlaylist = false;

        const YT_URL_TEMPLATE = 'watch?v=';
        const YT_PLAYLIST_TEMPLATE = 'playlist?list=';
        if (videoUrl.includes(YT_URL_TEMPLATE)) {
            vidId = videoUrl.substring(videoUrl.indexOf(YT_URL_TEMPLATE) + YT_URL_TEMPLATE.length);
        }
        else if (videoUrl.includes(YT_PLAYLIST_TEMPLATE)) {
            vidId = videoUrl.substring(videoUrl.indexOf(YT_PLAYLIST_TEMPLATE) + YT_PLAYLIST_TEMPLATE.length);
            isPlaylist = true;
        }
        else {
            vidId = videoUrl;
        }
        let exists = await topicExists(topicNameNoDash);

        if (exists instanceof AppError) return next(exists);
        else if (exists === 0) {
            Response.setApiResponse('error',400,'Topic Doesn\'t Exist');
        } 
        else {
            if (!isPlaylist) {
                let wait = await videoExistsInTopic(vidId, topicNameNoDash);
                if (wait) {
                    Response.setApiResponse('error',409,'Video Already Exists in Topic');
                }
                else {
                    try {
                        let video = await getVideoInfo(vidId);
                        if (video instanceof AppError) throw new AppError(video.status,video.message);
                        
                        let id = await insertVideo(video, topicNameNoDash, USERNAME);
                        if (id instanceof AppError) throw new AppError(id.status,id.message);
                        
                        outputData = {...video, id};
                        Response.setApiResponse('success',201,'Video Added','/',outputData);
                    }
                    catch (err) {
                        Response.setMessage = (process.env.NODE_ENV === 'development') ? err.message : 'Error Inserting Video';
                    }
                }
            }
            else {
                let playlistInfo = await getPlaylistInfo(vidId);
                if (playlistInfo instanceof AppError) return next(playlistInfo);

                let videos = await getPlaylistVideos(playlistInfo);
                if (videos instanceof AppError) return next(videos);
                
                let result = await insertManyVideos(videos, topicNameNoDash, USERNAME);
                if (result instanceof AppError) return next(result);

                let numOfVidsRequested = result.info.substring(result.info.indexOf('Records:') + 9, result.info.indexOf('Duplicates') - 2);
                let {affectedRows : numOfVidsAdded, addedVideos} = result;
                let numOfDuplicates = parseInt(numOfVidsRequested) - numOfVidsAdded;
                
                if (numOfVidsAdded === 1) {
                    Response.setApiResponse('success',201,`${numOfVidsAdded} video added. ${numOfVidsRequested} videos requested with ${numOfDuplicates} duplicates.`,'/',addedVideos);
                }
                else {
                    Response.setApiResponse('success',201,`${numOfVidsAdded} videos added. ${numOfVidsRequested} videos requested with ${numOfDuplicates} duplicates.`,'/',addedVideos);
                }
            }
        }
    }
    else {
        Response.setApiResponse('error',422,'Invalid Arguments','/');
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
}
const editVideo = async (req,res,next) => {
    const Response = new ApiResponse('error',500,'Something went wrong.');
    if (paramsExist([req.body.title,req.body.description,req.params.topic])) {
        const title = escapeHTML(req.body.title);
        let description = escapeHTML(req.body.description);
        const id = req.params.video;

        if (description.length > 2048) description = description.substring(0,2047);

        try {
            if (await videoExists(id)) {
                let result = await modifyVideo(id, title, description, null, false);
                if (result instanceof AppError) return next(result);
    
                Response.setApiResponse('success',200,'Video Updated','/');
            }
            else {
                Response.setStatus = 400;
                Response.setMessage = 'Video Doesn\'t Exist.';
            }
        } catch (err) {
            Response.setMessage = (process.env.NODE_ENV === 'development') ? err.message : 'Error Editing Video';
        }
    }
    else {
        Response.setApiResponse('error',422,'Invalid Arguments','/');
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
}
const swapVideos = async (req, res, next) => {
    const Response = new ApiResponse('error',500,'Something went wrong.','/');
    if (paramsExist([req.body.currentVidId,req.body.swapVidId])) {
        const currentVidId = escapeHTML(req.body.currentVidId);
        const swapVidId = escapeHTML(req.body.swapVidId);

        if (await videoExists(currentVidId) && await videoExists(swapVidId)) {
            let result;
            try {
                result = await swapVideoRecords(currentVidId, swapVidId);
                if (result instanceof AppError) throw new AppError(result.status,result.message);
            } catch(err) {
                Response.setMessage = (process.env.NODE_ENV === 'development') ? err.message : 'Error swapping videos.';
            }
            Response.setApiResponse('success',200,'Successfully swapped videos.','/',result);
        }
        else {
            Response.setStatus = 400;
            Response.setMessage = 'Video Doesn\'t Exist';
        }
    }
    else {
        Response.setApiResponse('error',422,'Invalid Arguments','/');
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
}
const refreshMetadata = async (req,res,next) => {
    const Response = new ApiResponse('error',500,'Something went wrong.','/');
    if (paramsExist([req.body.videos,req.user.username])) {
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
        if (!(result instanceof AppError)) {
            Response.setApiResponse('success',200,'Successfully refreshed metadata','/',finalResult);
        }
    }
    else {
        Response.setApiResponse('error',422,'Invalid Arguments','/');
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
    
}
const deleteVideo = async (req, res, next) => {
    const Response = new ApiResponse('error',500,'Something went wrong.','/');
    if (paramsExist([req.params.video,req.params.username,req.params.topic])) {
        const id = escapeHTML(req.params.video);
        const username = escapeHTML(req.params.username);
        const topicName = escapeHTML(req.params.topic);

        if (await videoExists(id)) {
            try {
                let result = await removeVideo(id);
                if (result instanceof AppError) throw new AppError(result.status,result.message);
            } catch(err) {
                Response.setMessage = (process.env.NODE_ENV === 'development') ? err.message : 'Error Removing Video';
            }
            
            Response.setApiResponse('success',200,'Video Deleted','/');
        }
        else {
            Response.setStatus = 400;
            Response.setMessage = 'Video Doesn\'t Exist';
        }
    }
    else {
        Response.setApiResponse('error',422,'Invalid Arguments','/');
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
    
}
const deleteSelectedVideos = async (req, res, next) => {
    const Response = new ApiResponse('error',500,'Something went wrong.','/');
    let result;
    if (paramsExist([req.body.videos])) {
        try {
            const {videos} = req.body;
            result = await removeSelectedVideos(videos);
            if (result instanceof AppError) throw new AppError(result.status,result.message);

            Response.setApiResponse('success',200,'Successfully deleted videos.','/',result);
        } catch(err) {
            Response.setMessage = (process.env.NODE_ENV === 'development') ? err.message : 'Error Removing Videos';
        }
        
    } else {
        Response.setApiResponse('error',422,'Invalid Arguments','/');
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
}
export {
    createVideo,
    editVideo,
    swapVideos,
    refreshMetadata,
    deleteVideo,
    deleteSelectedVideos
};