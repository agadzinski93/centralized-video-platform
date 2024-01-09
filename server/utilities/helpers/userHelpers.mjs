import { getDatabase } from "../db/mysql-connect.mjs";
import {AppError} from "../AppError.mjs";
import { cloudinary } from "../cloudinary.mjs";
import { enableHyphens } from "./topicHelpers.mjs";
import { setPaginationData,endOfResults } from "./pagination.mjs";

/**
 * 
 * @param {string} username - username of user
 * @param {string} content - retrieve user's topics, videos, or About Me
 * @param {boolean} getAll - get all results, will be paginated (topics and videos only)
 * @param {uint} page - if retrieving all, which page number
 */
const getUserInfo = async (username,content,getAll=false,page=0) => {
    const RESULTS_DEFAULT = 12;
    const RESULTS_PER_PAGE = 24;
    let data = null;
    let choice = content.toLowerCase();
    try {
        const db = await getDatabase();
        if (db instanceof AppError) {
            data = {response:'error',message:'Couldn\'t connet to database.'};
        }
        else {
            let {resultsPerPage,pageNum} = setPaginationData(RESULTS_DEFAULT,0);
            let result,
                count,
                moreResults;

            switch(choice) {
                case 'topics':
                    if (getAll) {
                        ({resultsPerPage,pageNum} = setPaginationData(RESULTS_PER_PAGE,page));
                    }
                    result = await db.execute(`SELECT * FROM topics 
                        WHERE username = ? ORDER BY timeCreated DESC LIMIT ? OFFSET ?`,
                        [username,resultsPerPage.toString(),(pageNum*resultsPerPage).toString()]);

                    data = result[0];
                    result = await db.execute(`SELECT count(*) AS count FROM topics WHERE username = ?`,
                        [username]);
                    count = Object.assign({},result[0][0]).count;
                    moreResults = (getAll) ? endOfResults(resultsPerPage,page,count) : false;
                    for (let object of data) {
                        object.topicUrl = enableHyphens(object.name,true);
                    }
                    data = {response:'success',data,moreResults};
                    break;
                case 'videos':
                    if (getAll) {
                        ({resultsPerPage,pageNum} = setPaginationData(RESULTS_PER_PAGE,page));
                    }
                    result = await db.execute(`SELECT * FROM videos 
                        WHERE username = ? ORDER BY timeCreated DESC LIMIT ? OFFSET ?`,
                        [username,resultsPerPage.toString(),(pageNum*resultsPerPage).toString()]);
                    data = result[0];
                    result = await db.execute(`SELECT count(*) AS count FROM videos WHERE username = ?`,
                        [username]);
                    count = Object.assign({},result[0][0]).count;
                    moreResults = (getAll) ? endOfResults(resultsPerPage,page,count) : false;
                    for (let object of data) {
                        object.topicUrl = enableHyphens(object.topic,true);
                    }
                    data = {response:'success',data,moreResults};
                    break;
                case 'about-me':
                    result = await db.execute(`SELECT dateJoined,about_me,subscriptions FROM users WHERE username = ?`,
                        [username]);
                    data = {response:'success',data:result[0][0]};
                    break;
                default:
                    data = {response:'error',message:'Invalid query.'};
            }
        }
    } catch (err) {
        console.log(err.message);
        data = {response:'error',message:`Error: ${err.message}`};
    }
    return data;
}
/**
 * Alter of path and filename of an image
 * @param {string} userId 
 * @param {string} path - URL of image
 * @param {string} filename - filename of image used by Cloudinary for ID
 * @param {string} target - which image property (e.g. 'PROFILE PIC', 'BANNER')
 * @returns 
 */
const modifyImage = async (userId, path, filename, target) => {
    try {
        const db = await getDatabase();
        if (db instanceof AppError) return db;

        let result;
        switch(target) {
            case 'PROFILE PIC':
                result = await db.execute(`UPDATE users 
                    SET pic_url = ?, pic_filename = ? 
                    WHERE user_id = ?`,
                    [path,filename,userId]);
                break;
            case 'BANNER':
                result = await db.execute(`UPDATE users 
                    SET banner_url = ?, banner_filename = ? 
                    WHERE user_id = ?`,
                    [path,filename,userId]);
                break;
            default:
        }
        return {
            path,
            filename
        };
        } catch(err) {
        return new AppError(500, "Error Updating Image");
        }
}
const updateRefreshSettings = async (userId, setting, value) => {
    let result;

    try {
        const db = await getDatabase();
        if (db instanceof AppError) return db;

        switch(setting) {
            case 'Title':
            case 'title':
                result = await db.execute(`UPDATE users SET settingRefreshTitle = ? WHERE user_id = ?`,
                [value,userId]);
                break;
            case 'Description':
            case 'description':
                result = await db.execute(`UPDATE users SET settingRefreshDescription = ? WHERE user_id = ?`,
                [value,userId]);
                break;
            case 'Thumbnail':
            case 'thumbnail':
                result = await db.execute(`UPDATE users SET settingRefreshThumbnail = ? WHERE user_id = ?`,
                [value,userId]);
                break;
            default:
                result = null;
        };
    } catch(err) {
        result = new AppError(500, "Something went wrong!");
    }
    return result;
}
const updateDisplayNameSetting = async (userId, newDisplayName) => {
    let result;
    try {
        const db = await getDatabase();
        result = await db.execute(`UPDATE users SET display_name = ? WHERE user_id = ?`,
            [newDisplayName,userId]);
    } catch(err) {
        result = new AppError(500, err.message);
    }
    return result;
}
const updateEmailSetting = async (userId, newEmail) => {
    let result;
    try {
        const db = await getDatabase();
        result = await db.execute(`UPDATE users SET email = ? WHERE user_id = ?`,
            [newEmail,userId]);
    } catch(err) {
        result = new AppError(500, err.message);
    }
    return result;
}
const updateAboutMeSetting = async (userId,newAboutMe) => {
    let result;
    try {
        const db = await getDatabase();
        result = await db.execute(`UPDATE users SET about_me = ? WHERE user_id = ?`,
            [newAboutMe,userId]);
    } catch(err) {
        result = new AppError(500,err.message);
    }
    return result;
}
const deleteImage = async (user,target) => {
    try {
        const db = await getDatabase();
        if (db instanceof AppError) return db;

        let path = null,
            filename = null;
        switch(target) {
            case 'PROFILE PIC':
                filename = user.pic_filename;
                if (filename !== process.env.DEFAULT_PIC_FILENAME) {
                    await cloudinary.uploader.destroy(filename);
                }
                db.execute(`UPDATE users SET pic_url = ?, pic_filename = ? WHERE user_id = ?`,
                    [process.env.DEFAULT_PROFILE_PIC,process.env.DEFAULT_PIC_FILENAME,user.user_id]);
                path = process.env.DEFAULT_PROFILE_PIC;
                filename = process.env.DEFAULT_PIC_FILENAME;
                break;
            case 'BANNER':
                filename = user.banner_filename;
                await cloudinary.uploader.destroy(filename);
                db.execute(`UPDATE users SET banner_url = null, banner_filename = null
                    WHERE user_id = ?`,
                    [user.user_id]);
                break;
            default:
        }
        return {
            message:'Successfully deleted image.', 
            image:{
                path,
                filename
            }
        };
        } catch(err) {
        return new AppError(500, "Error Updating Topic Image");
        }
}
const deleteUser = async (id) => {
    let result;
    try {
        const db = await getDatabase();
        if (db instanceof AppError) return next(db);

        result = await db.execute(`DELETE FROM users WHERE user_id = ?`,
            [id]);
    }catch(err) {
        result = new AppError(500, "Something went wrong deleting user account!");
    }
    return result;
}

export {
    getUserInfo,
    modifyImage,
    updateRefreshSettings,
    updateDisplayNameSetting,
    updateEmailSetting,
    updateAboutMeSetting,
    deleteImage,
    deleteUser
};