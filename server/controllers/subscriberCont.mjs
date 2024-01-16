import { ApiResponse } from "../utilities/ApiResponse.mjs";
import { userLogger } from "../utilities/logger.mjs";
import {AppError} from "../utilities/AppError.mjs";
import { paramsExist } from "../utilities/validators/paramsExist.mjs";
import { escapeHTML } from "../utilities/helpers/sanitizers.mjs";
import {
    subscribeUser,
    unsubscribeUser
} from '../utilities/helpers/subscribeHelpers.mjs'

const subscribe = async(req,res)=>{
    const Response = new ApiResponse('error',500,'Something went wrong.','/');
    if (paramsExist([req.user?.user_id,req.body.author_id])) {
        let result;
        
        const userId = escapeHTML(req.user.user_id.toString());
        const authorId = escapeHTML(req.body.author_id.toString());
        if (userId !== authorId) {
            result = await subscribeUser(userId,authorId, res);
            if (result instanceof AppError) {
                userLogger.log('error',`User ID: ${userId} -> ${result.message}`);
                Response.setStatus = result.status;
                Response.setMessage = 'Unable to subscribe. Try again.';
            }
            else {
                Response.setApiResponse('success',201,'Successfully subscribed','/');
            }
        }
        else {
            userLogger.log('error',`User ID: ${userId} -> Cannot subscribe to yourself.`);
            Response.setStatus = 400;
            Response.setMessage = 'Cannot subscribe to yourself.';
        }
    }
    else {
        userLogger.log('error',`User ID: ${userId} -> Invalid Arguments.`);
        Response.setApiResponse('error',422,'Invalid Arguments.','/');
    }
    res.status(Response.getStatus).json(Response.getApiResponse()); 
}

const unsubscribe = async(req,res)=>{
    const Response = new ApiResponse('error',500,'Something went wrong.','/');
    if (paramsExist([req.user?.user_id,req.body.author_id])) {
        let result;
       
        const userId = escapeHTML(req.user.user_id.toString());
        const authorId = escapeHTML(req.body.author_id.toString());
        result = await unsubscribeUser(userId,authorId);
        if (result instanceof AppError) {
            userLogger.log('error',`User ID: ${userId} -> ${result.message}`);
            Response.setStatus = result.status;
            Response.setMessage = 'Unable to unsubscribe. Try again.';
        }
        else {
            Response.setApiResponse('success',200,'Successfully unsubscribed','/');
        }
    }
    else {
        userLogger.log('error',`User ID: ${userId} -> Invalid Arguments.`);
        Response.setApiResponse('error',422,'Invalid Arguments.','/');
    }
    res.status(Response.getStatus).json(Response.getApiResponse());    
}
    
export {subscribe,unsubscribe};