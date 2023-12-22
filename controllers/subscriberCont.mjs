import {AppError} from "../utilities/AppError.mjs";
import { paramsExist } from "../utilities/validators/paramsExist.mjs";
import { escapeHTML } from "../utilities/helpers/sanitizers.mjs";
import {
    subscribeUser,
    unsubscribeUser
} from '../utilities/helpers/subscribeHelpers.mjs'

const subscribe = async(req,res)=>{
        let result;
        let exist = paramsExist([req.body.user_id,req.body.author_id]);
        if (exist) {
            const userId = escapeHTML(req.body.user_id.toString());
            const authorId = escapeHTML(req.body.author_id.toString());
            if (userId !== authorId) {
                result = await subscribeUser(userId,authorId, res);
                if (result instanceof AppError) {
                    result = {response:'error',message:'Error: Unable to Subscribe. Try again.'};
                }
                else {
                    result = {response:'success',message:'Successfully subscribed!'};
                }
            }
            else {
                result = {response:'error',message:'Error: Cannot subscribe to yourself.'};
            }
        }
        else {
            result = {response:'error',message:'Error: Arguments not provided.'};
        }
        res.json(result);
    }

const unsubscribe = async(req,res)=>{
        let result;
        let exist = paramsExist([req.body.user_id,req.body.author_id]);
        if (exist) {
            const userId = escapeHTML(req.body.user_id.toString());
            const authorId = escapeHTML(req.body.author_id.toString());
            result = await unsubscribeUser(userId,authorId);
            if (result instanceof AppError) {
                result = {response:'error',message:'Error: Unable to Unsubscribe. Try again.'};
            }
            else {
                result = {response:'success',message:'Successfully unsubscribed!'};
            }
        }
        else {
            result = {response:'error',message:'Error: Arguments not provided.'};
        }
        res.json(result);
    }
    

export {subscribe,unsubscribe};