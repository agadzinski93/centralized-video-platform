import { ApiResponse } from "../utilities/ApiResponse";
import { videoLogger } from "../utilities/logger";
import { AppError } from "../utilities/AppError";
import { paramsExist } from '../utilities/validators/paramsExist'
import { getUser } from "../utilities/helpers/authHelpers";
import { escapeHTML, unescapeSQL } from "../utilities/helpers/sanitizers";
import { getTopic, enableHyphens } from "../utilities/helpers/topicHelpers";
import {
    getVideosById,
    getVideoUrls,
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
    removeSelectedVideos,
    getVideoById
} from "../utilities/helpers/videoHelpers";

import { Request, Response, NextFunction } from "express";

const createVideo = async (req: Request, res: Response, next: NextFunction) => {
    const Response = new ApiResponse('error', 500, 'Something went wrong.');
    const user = (req.user) ? req.user : res.locals.user;
    let outputData = {};

    if (user && paramsExist([req.params.username, req.body.ytUrl, req.params.topic])) {
        const USERNAME = escapeHTML(req.params.username);
        const videoUrl = escapeHTML(req.body.ytUrl);
        const topicName = escapeHTML(req.params.topic);
        const topicNameNoDash = enableHyphens(topicName, false);
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
        const topic = await getTopic(topicNameNoDash);

        if (topic instanceof AppError) return next(topic);
        else if (topic.length === 0) {
            videoLogger.log('error', 'Topic doesn\'t exist.');
            Response.setApiResponse('error', 404, 'Topic doesn\'t exist');
        }
        else {
            if (user.username === topic[0].username) {
                if (!isPlaylist) {
                    let wait = await videoExistsInTopic(`youtube.com/${YT_URL_TEMPLATE}${vidId}`, topicNameNoDash);
                    console.log(wait);
                    if (wait instanceof AppError) {
                        videoLogger.log('error', wait.message);
                        Response.applyMessage(wait.message, 'Error when checking if video exists');
                    }
                    else if (wait) {
                        videoLogger.log('error', 'Video already exists in topic.');
                        Response.setApiResponse('error', 409, 'Video already exists in topic');
                    }
                    else {
                        try {
                            let video = await getVideoInfo(vidId);
                            if (video instanceof AppError) throw new AppError(video.status, video.message);

                            let id = await insertVideo(video, topicNameNoDash, USERNAME);
                            if (id instanceof AppError) throw new AppError(id.status, id.message);

                            outputData = { ...video, id };
                            Response.setApiResponse('success', 201, 'Video Added', '/', outputData);
                        }
                        catch (err) {
                            videoLogger.log('error', (err as Error).message);
                            Response.applyMessage((err as Error).message, 'Error inserting video.');
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
                    let { affectedRows: numOfVidsAdded, addedVideos } = result;
                    let numOfDuplicates = parseInt(numOfVidsRequested) - numOfVidsAdded;

                    if (numOfVidsAdded === 1) {
                        Response.setApiResponse('success', 201, `${numOfVidsAdded} video added. ${numOfVidsRequested} videos requested with ${numOfDuplicates} duplicates.`, '/', addedVideos);
                    }
                    else {
                        Response.setApiResponse('success', 201, `${numOfVidsAdded} videos added. ${numOfVidsRequested} videos requested with ${numOfDuplicates} duplicates.`, '/', addedVideos);
                    }
                }
            } else {
                Response.setStatus = 403;
                Response.setMessage = 'Not your topic.';
            }
        }
    }
    else {
        videoLogger.log('error', 'Invalid Arguments');
        Response.setApiResponse('error', 422, 'Invalid Arguments', '/');
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
}
const editVideo = async (req: Request, res: Response, next: NextFunction) => {
    const Response = new ApiResponse('error', 500, 'Something went wrong.');
    if (paramsExist([req.body.title, req.body.description])) {
        const title = escapeHTML(req.body.title);
        let description = escapeHTML(req.body.description);
        const id = req.params.video;

        if (description.length > 2048) description = description.substring(0, 2047);

        try {
            if (await videoExists(id)) {
                let result = await modifyVideo(id, title, description, null);
                if (result instanceof AppError) return next(result);

                Response.setApiResponse('success', 200, 'Video Updated', '/');
            }
            else {
                videoLogger.log('error', 'Video doesn\'t exist.');
                Response.setStatus = 404;
                Response.setMessage = 'Video doesn\'t exist.';
            }
        } catch (err) {
            videoLogger.log('error', (err as Error).message);
            Response.applyMessage((err as Error).message, 'Error editing video.');
        }
    }
    else {
        videoLogger.log('error', 'Invalid Arguments');
        Response.setApiResponse('error', 422, 'Invalid Arguments', '/');
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
}
const swapVideos = async (req: Request, res: Response, next: NextFunction) => {
    const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
    const user = (req.user) ? req.user : res.locals.user;
    try {
        if (user && paramsExist([req.body.currentVidId, req.body.swapVidId])) {
            const currentVidId = escapeHTML(req.body.currentVidId);
            const swapVidId = escapeHTML(req.body.swapVidId);

            const currentVid = await getVideoById(currentVidId);
            if (currentVid instanceof AppError) throw currentVid;
            const swapVid = await getVideoById(swapVidId);
            if (swapVid instanceof AppError) throw swapVid;

            if (user.username === currentVid.username && user.username === swapVid.username) {
                if (currentVid.topic === swapVid.topic) {
                    let result;
                    try {
                        result = await swapVideoRecords(currentVidId, swapVidId);
                        if (result instanceof AppError) throw new AppError(result.status, result.message);
                    } catch (err) {
                        videoLogger.log('error', (err as Error).message);
                        Response.applyMessage((err as Error).message, 'Error swapping videos.');
                    }
                    Response.setApiResponse('success', 200, 'Successfully swapped videos.', '/');
                } else {
                    videoLogger.log('error', 'Topics do not match.');
                    Response.setStatus = 400;
                    Response.setMessage = 'Topics do not match';
                }
            }
            else {
                Response.setStatus = 403;
                Response.setMessage = 'One or both videos are not yours.';
            }
        }
        else {
            videoLogger.log('error', 'Invalid Arguments');
            Response.setApiResponse('error', 422, 'Invalid Arguments', '/');
        }
    } catch (err) {
        if (err instanceof AppError) Response.setApiResponse('error', err.status, err.message);
        videoLogger.log('error', (err as Error).message);
    }
    res.status(Response.getStatus).json(Response.getApiResponse());
}
const refreshMetadata = async (req: Request, res: Response, next: NextFunction) => {
    const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
    let user = req.user ? req.user : res.locals.user;
    try {
        if (user && paramsExist([req.body.videos])) {
            const { videos } = req.body;
            let vidInfo,
                vidInfos,
                result,
                finalResult = new Array(),
                offOutput;

            user = await getUser(user.username);
            if (user instanceof AppError) throw new Error(user.message);

            const { settingRefreshTitle,
                settingRefreshDescription,
                settingRefreshThumbnail } = user;

            if (settingRefreshTitle === 1) {
                if (settingRefreshDescription === 1) {
                    if (settingRefreshThumbnail === 1) {
                        vidInfos = await getVideoUrls(videos);
                        if (vidInfos instanceof AppError) throw new Error(vidInfos.message);
                        for (let i = 0; i < vidInfos.length; i++) {
                            vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                            if (vidInfo instanceof AppError) throw new Error(vidInfo.message);
                            result = await modifyVideo(videos[i], vidInfo.title, vidInfo.description.substring(0, 2047), vidInfo.thumbnail);
                            if (result instanceof AppError) break;
                            result.description = unescapeSQL(result.description);
                            result.title = unescapeSQL(result.title);
                            finalResult.push(result);
                        }
                    }
                    else {
                        vidInfos = await getVideoUrls(videos);
                        if (vidInfos instanceof AppError) throw new Error(vidInfos.message);
                        for (let i = 0; i < vidInfos.length; i++) {
                            vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                            if (vidInfo instanceof AppError) throw new Error(vidInfo.message);
                            result = await modifyVideo(videos[i], vidInfo.title, vidInfo.description.substring(0, 2047), null);
                            if (result instanceof AppError) break;
                            result.description = unescapeSQL(result.description);
                            result.title = unescapeSQL(result.title);
                            result.thumbnail = null;
                            finalResult.push(result);
                        }
                    }
                }
                else if (settingRefreshThumbnail === 1) {
                    vidInfos = await getVideoUrls(videos);
                    if (vidInfos instanceof AppError) throw new Error(vidInfos.message);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        if (vidInfo instanceof AppError) throw new Error(vidInfo.message);
                        result = await modifyVideo(videos[i], vidInfo.title, null, vidInfo.thumbnail);
                        if (result instanceof AppError) break;
                        result.description = null;
                        result.title = unescapeSQL(result.title);
                        finalResult.push(result);
                    }
                }
                else {
                    vidInfos = await getVideoUrls(videos);
                    if (vidInfos instanceof AppError) throw new Error(vidInfos.message);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        if (vidInfo instanceof AppError) throw new Error(vidInfo.message);
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
                    vidInfos = await getVideoUrls(videos);
                    if (vidInfos instanceof AppError) throw new Error(vidInfos.message);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        if (vidInfo instanceof AppError) throw new Error(vidInfo.message);
                        result = await modifyVideo(videos[i], null, vidInfo.description.substring(0, 2047), vidInfo.thumbnail);
                        if (result instanceof AppError) break;
                        result.title = null;
                        result.description = unescapeSQL(result.description);
                        finalResult.push(result);
                    }
                }
                else {
                    vidInfos = await getVideoUrls(videos);
                    if (vidInfos instanceof AppError) throw new Error(vidInfos.message);
                    for (let i = 0; i < vidInfos.length; i++) {
                        vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                        if (vidInfo instanceof AppError) throw new Error(vidInfo.message);
                        result = await modifyVideo(videos[i], null, vidInfo.description.substring(0, 2047), null);
                        if (result instanceof AppError) break;
                        result.title = null;
                        result.description = unescapeSQL(result.description);
                        result.thumbnail = null;
                        finalResult.push(result);
                    }
                }
            }
            else if (settingRefreshThumbnail === 1) {
                vidInfos = await getVideoUrls(videos);
                if (vidInfos instanceof AppError) throw new Error(vidInfos.message);
                for (let i = 0; i < vidInfos.length; i++) {
                    vidInfo = await getVideoInfo(vidInfos[i].url.substring(20));
                    if (vidInfo instanceof AppError) throw new Error(vidInfo.message);
                    result = await modifyVideo(videos[i], null, null, vidInfo.thumbnail);
                    if (result instanceof AppError) break;
                    result.title = null;
                    result.description = null;
                    finalResult.push(result);
                }
            }
            else {
                offOutput = { result: 'All Refresh Settings Are Off' };
            }
            if (!(result instanceof AppError)) {
                Response.setApiResponse('success', 200, 'Successfully refreshed metadata', '/', offOutput);
            }
            else {
                videoLogger.log('error', result.message);
                Response.setStatus = result.status;
                Response.applyMessage(result.message, 'Error updating metadata.');
            }
        }
        else {
            videoLogger.log('error', 'Invalid Arguments');
            Response.setApiResponse('error', 422, 'Invalid Arguments', '/');
        }
    } catch (err) {
        videoLogger.log('error', `Error refreshing metadata: ${(err as Error).message}`);
    }
    res.status(Response.getStatus).json(Response.getApiResponse());

}
const deleteVideo = async (req: Request, res: Response, next: NextFunction) => {
    const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
    const user = (req.user) ? req.user : res.locals.user;
    try {
        if (user && paramsExist([req.params.video, req.params.username])) {
            const id = escapeHTML(req.params.video);

            const video = await getVideoById(id);
            if (video instanceof AppError) throw video;

            if (user.username === video.username) {
                try {
                    let result = await removeVideo(id);
                    //if (result instanceof AppError) throw new AppError(result.status, result.message);
                } catch (err) {
                    videoLogger.log('error', (err as Error).message);
                    Response.applyMessage((err as Error).message, 'Error removing video.');
                }

                Response.setApiResponse('success', 200, 'Video Deleted', '/');
            }
            else {
                videoLogger.log('error', 'Unauthorized. Not your video.');
                Response.setStatus = 403;
                Response.setMessage = 'Unauthorized. Not your video';
            }
        }
        else {
            videoLogger.log('error', 'Invalid Arguments');
            Response.setApiResponse('error', 422, 'Invalid Arguments', '/');
        }
    } catch (err) {
        Response.setStatus = (err as AppError).status;
        Response.setMessage = (Response.getStatus === 404) ? (err as Error).message : 'Something went wrong.';
        videoLogger.log('error', `Error deleting video: ${(err as Error).message}`);
    }
    res.status(Response.getStatus).json(Response.getApiResponse());

}
const deleteSelectedVideos = async (req: Request, res: Response) => {
    const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
    const user = req.user ? req.user : res.locals.user;
    try {
        if (user && paramsExist([req.body.videos])) {
            let result = {
                videosRequested: req.body.videos.length,
                videosFound: 0,
                videosDeleted: 0,
                videosSkipped: 0,
                issues: {
                    unauthorized: 0,
                    other: 0
                }
            };
            if (req.body.videos.length > 1000) {
                Response.setStatus = 422;
                Response.setMessage = 'Cannot fetch more than 1,000 videos at a time.';
            } else {
                const videos = await getVideosById(req.body.videos);
                if (videos instanceof AppError) throw videos;

                let authorizedVideos = Array();
                if (videos.length > 0) {
                    result.videosFound = videos.length;

                    for (const video of videos) {
                        if (user.username === video.username) {
                            authorizedVideos.push(video.id);
                        } else {
                            result.videosSkipped++;
                            result.issues.unauthorized++;
                        }
                    }
                    const removalResult = await removeSelectedVideos(authorizedVideos);
                    if (removalResult instanceof AppError) throw removalResult;

                    result.videosDeleted = removalResult;

                    Response.setApiResponse('success', 200, 'Successfully deleted videos.', '/', result);
                } else {
                    Response.setStatus = 404;
                    Response.setMessage = 'No videos found.';
                    Response.setData = result;
                }
            }
        } else {
            videoLogger.log('error', 'Invalid Arguments');
            Response.setApiResponse('error', 422, 'Invalid Arguments', '/');
        }
    } catch (err) {
        Response.setStatus = (err as AppError).status;
        Response.setMessage = (Response.getStatus === 404) ? (err as Error).message : 'Error removing videos.';
        videoLogger.log('error', `Error deleting selected videos: ${(err as Error).message}`);
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