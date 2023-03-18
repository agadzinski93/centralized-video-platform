const AppError = require("../utilities/AppError");
const { getUser } = require("../utilities/helpers/authHelpers");
const { escapeHTML} = require("../utilities/helpers/sanitizers");
const {
    subscribeUser,
    unsubscribeUser
} = require("../utilities/helpers/subscribeHelpers");

module.exports = {
    subscribe:async(req,res)=>{
        const userId = escapeHTML(req.body.user_id.toString());
        const authorId = escapeHTML(req.body.author_id.toString());
        let result;
        if (userId !== authorId) {
            result = await subscribeUser(userId,authorId);
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
        res.json(result);
    },
    unsubscribe:async(req,res)=>{
        const userId = escapeHTML(req.body.user_id.toString());
        const authorId = escapeHTML(req.body.author_id.toString());
        let result = await unsubscribeUser(userId,authorId);
        if (result instanceof AppError) {
            result = {response:'error',message:'Error: Unable to Unsubscribe. Try again.'};
        }
        else {
            result = {response:'success',message:'Successfully unsubscribed!'};
        }
        res.json(result);
    }
}