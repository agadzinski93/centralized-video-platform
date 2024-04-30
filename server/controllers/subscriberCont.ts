import { ApiResponse } from "../utilities/ApiResponse";
import { userLogger } from "../utilities/logger";
import { AppError } from "../utilities/AppError";
import { paramsExist } from "../utilities/validators/paramsExist";
import { escapeHTML } from "../utilities/helpers/sanitizers";
import {
    subscribeUser,
    unsubscribeUser
} from '../utilities/helpers/subscribeHelpers'

import { Request, Response } from "express";

const subscribe = async (req: Request, res: Response) => {
    const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
    let userId = null;
    try {
        if (req.user && paramsExist([req.body.author_id])) {
            let result;

            userId = escapeHTML(req.user.user_id.toString());
            const authorId = escapeHTML(req.body.author_id.toString());
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
        userLogger.log('error', `User ID: ${userId} -> Invalid Arguments.`);
        Response.setApiResponse('error', 422, 'Invalid Arguments.', '/');
    }

    res.status(Response.getStatus).json(Response.getApiResponse());
}

const unsubscribe = async (req: Request, res: Response) => {
    const Response = new ApiResponse('error', 500, 'Something went wrong.', '/');
    let userId = null;
    try {
        if (req.user && paramsExist([req.body.author_id])) {
            let result;

            userId = escapeHTML(req.user.user_id.toString());
            const authorId = escapeHTML(req.body.author_id.toString());
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

    }

    res.status(Response.getStatus).json(Response.getApiResponse());
}

export { subscribe, unsubscribe };