import { ApiResponse } from "../utilities/ApiResponse";
import { userLogger } from "../utilities/logger";
import { AppError } from "../utilities/AppError";
import { paramsExist } from "../utilities/validators/paramsExist";
import { escapeHTML } from "../utilities/helpers/sanitizers";
import { getUser } from "../utilities/helpers/authHelpers";
import {
    subscribeUser,
    unsubscribeUser
} from '../utilities/helpers/subscribeHelpers'

import { Request, Response } from "express";

const subscribe = async (req: Request, res: Response) => {
    const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
    let userId = null;
    const user = (req.user) ? req.user : res.locals.user;
    try {
        if (user && paramsExist([req.params.username])) {
            let result;

            userId = escapeHTML(user.user_id.toString());
            const author = await getUser(req.params.username, 'user_id');
            if (author instanceof AppError) throw author;
            const authorId = author.user_id;

            if (userId !== authorId) {
                result = await subscribeUser(userId, authorId);
                if (result instanceof AppError) {
                    userLogger.log('error', `User ID: ${userId} -> ${result.message}`);
                    Response.setStatus = result.status;
                    Response.setMessage = 'Unable to subscribe. Try again.';
                }
                else {
                    Response.setApiResponse('success', 201, 'Successfully subscribed', '/');
                }
            }
            else {
                userLogger.log('error', `User ID: ${userId} -> Cannot subscribe to yourself.`);
                Response.setStatus = 400;
                Response.setMessage = 'Cannot subscribe to yourself.';
            }
        }
        else {
            userLogger.log('error', `User ID: ${userId} -> Invalid Arguments.`);
            Response.setApiResponse('error', 422, 'Invalid Arguments.', '/');
        }
    } catch (err) {
        if (err instanceof AppError) Response.setStatus = err.status;
        if (Response.getStatus === 404) Response.setMessage = 'User not found.';
        userLogger.log('error', `User ID: ${userId} -> ${Response.getMessage}.`);
    }

    res.status(Response.getStatus).json(Response.getApiResponse());
}

const unsubscribe = async (req: Request, res: Response) => {
    const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
    let userId = null;
    const user = (req.user) ? req.user : res.locals.user;
    try {
        if (user && paramsExist([req.params.username])) {
            let result;

            userId = escapeHTML(user.user_id.toString());
            const author = await getUser(req.params.username, 'user_id');
            if (author instanceof AppError) throw author;
            const authorId = author.user_id;
            result = await unsubscribeUser(userId as string, authorId as string);
            if (result instanceof AppError) {
                userLogger.log('error', `User ID: ${userId} -> ${result.message}`);
                Response.setStatus = result.status;
                Response.setMessage = 'Unable to unsubscribe. Try again.';
            }
            else {
                Response.setApiResponse('success', 200, 'Successfully unsubscribed', '/');
            }
        }
        else {
            userLogger.log('error', `User ID: ${userId} -> Invalid Arguments.`);
            Response.setApiResponse('error', 422, 'Invalid Arguments.', '/');
        }
    } catch (err) {
        if (err instanceof AppError) Response.setStatus = err.status;
        if (Response.getStatus === 404) Response.setMessage = 'User not found.';
        userLogger.log('error', `User ID: ${userId} -> ${Response.getMessage}.`);
    }

    res.status(Response.getStatus).json(Response.getApiResponse());
}

export { subscribe, unsubscribe };