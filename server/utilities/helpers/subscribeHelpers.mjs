import { getDatabase } from "../db/mysql-connect.mjs";
import {AppError} from "../AppError.mjs";

/**
 * 
 * @param {string} username
 * @param {string} videoAuthor - User ID of video's author
 * @returns {boolean | object} AppError or true/false on whether user is subscribed to author
 */
const isSubscribed = async(userId,authorId)=>{
    const db = await getDatabase();
    let result;
    let subscribed = false;
    
    try{
        const sql = `SELECT count(*) AS count FROM subscribers WHERE user_id = ? AND subscriber_id = ?`;
        const values = [userId,authorId];

        result = await db.execute(sql,values);

        if (Object.assign({},result[0][0]).count > 0) {
            subscribed = true;
        }
    }catch(err){
        subscribed = new AppError(500,"Error Verifying Subscription Status");
    }
    return subscribed;
}
/**
 * 
 * @param {string} userId 
 * @param {string} authorId 
 * @returns {object} AppError or Object with Response status and Message
 */
const subscribeUser = async(userId,authorId)=>{
    let result = null;
    try {
        const db = await getDatabase();

        const sql = `INSERT INTO subscribers(user_id,subscriber_id) VALUES(?,?)`;
        const values = [userId,authorId];

        result = await db.execute(sql,values);
    }catch(err){
        result = new AppError(500,"Error Subscribing user");
    }
    return result;
}
/**
 * 
 * @param {string} userId 
 * @param {string} authorId 
 * @returns {object} AppError or Object with Response status and Message
 */
const unsubscribeUser = async(userId,authorId)=>{
    let result = null
    try {
        const db = await getDatabase();

        const sql = `DELETE FROM subscribers WHERE user_id = ? AND subscriber_id = ?`
        const values = [userId,authorId];

        result = await db.execute(sql,values);
    }catch(err){
        result = new AppError(500,"Error Unsubscribing User");
    }
    return result;
}

export {
    isSubscribed,
    subscribeUser,
    unsubscribeUser
};