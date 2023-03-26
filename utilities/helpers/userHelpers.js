const { getDatabase } = require("../mysql-connect");
const AppError = require("../AppError");
const {cloudinary} = require("../../utilities/cloudinary");
const {setPaginationData,endOfResults} = require("./pagination");

module.exports = {
    /**
     * 
     * @param {string} username - username of user
     * @param {string} content - retrieve user's topics, videos, or About Me
     * @param {boolean} getAll - get all results, will be paginated (topics and videos only)
     * @param {uint} page - if retrieving all, which page number
     */
    getUserInfo: async (username,content,getAll=false,page=0) => {
        const RESULTS_DEFAULT = 12;
        const RESULTS_PER_PAGE = 24;
        let data = null;
        let choice = content.toLowerCase();
        if (choice === 'topics' || choice === 'videos'){
            let {resultsPerPage,pageNum} = setPaginationData(RESULTS_DEFAULT,0);
            if (getAll && choice !== 'about-me') {
                ({resultsPerPage,pageNum} = setPaginationData(RESULTS_PER_PAGE,page));
            }
            try {
                const db = await getDatabase();
                if (db instanceof AppError) {
                    data = {response:'error',message:'Couldn\'t connet to database.'};
                }
                let result = await db.execute(`SELECT * FROM ${choice} 
                    WHERE username = '${username}' ORDER BY timeCreated DESC LIMIT ${resultsPerPage} OFFSET ${pageNum * resultsPerPage}`);
                data = result[0];
                result = await db.execute(`SELECT count(*) AS count FROM ${choice} WHERE username = '${username}'`);
                let count = Object.assign({},result[0][0]).count;
                const moreResults = (getAll) ? endOfResults(resultsPerPage,page,count) : false;
                data = {response:'success',data,moreResults};
            } catch(err) {
                data = {response:'error',message:`Error: ${err.message}`};
            }
        }
        else if (choice === 'about-me') {
            const db = await getDatabase();
            if (db instanceof AppError) {
                data = {response:'error',message:'Couldn\'t connet to database.'};
            }
            let result = await db.execute(`SELECT dateJoined,about_me,subscriptions FROM users WHERE username = '${username}'`);
            data = {response:'success',data:result[0]};
        }
        else {
            data = {response:'error',message:'Invalid query.'};
        }
        return data;
    },
    /**
     * Alter of path and filename of an image
     * @param {string} userId 
     * @param {string} path - URL of image
     * @param {string} filename - filename of image used by Cloudinary for ID
     * @param {string} target - which image property (e.g. 'PROFILE PIC', 'BANNER')
     * @returns 
     */
    modifyImage: async (userId, path, filename, target) => {
        try {
            const db = await getDatabase();
            if (db instanceof AppError) return db;

            let result;
            switch(target) {
                case 'PROFILE PIC':
                    result = await db.execute(`UPDATE users 
                        SET pic_url = '${path}', pic_filename = '${filename}' 
                        WHERE user_id = '${userId}'`);
                    break;
                case 'BANNER':
                    result = await db.execute(`UPDATE users 
                        SET banner_url = '${path}', banner_filename = '${filename}' 
                        WHERE user_id = '${userId}'`);
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
    },
    updateRefreshSettings: async (userId, setting, value) => {
        let result;

        try {
            const db = await getDatabase();
            if (db instanceof AppError) return db;

            switch(setting) {
                case 'Title':
                case 'title':
                    result = await db.execute(`UPDATE users SET settingRefreshTitle = '${value}' 
                    WHERE user_id = '${userId}'`);
                    break;
                case 'Description':
                case 'description':
                    result = await db.execute(`UPDATE users SET settingRefreshDescription = '${value}' 
                    WHERE user_id = '${userId}'`);
                    break;
                case 'Thumbnail':
                case 'thumbnail':
                    result = await db.execute(`UPDATE users SET settingRefreshThumbnail = '${value}' 
                    WHERE user_id = '${userId}'`);
                    break;
                default:
                    result = null;
            };
        } catch(err) {
            result = new AppError(500, "Something went wrong!");
        }
        return result;
    },
    updateDisplayNameSetting: async (userId, newDisplayName) => {
        let result;
        try {
            const db = await getDatabase();
            result = await db.execute(`UPDATE users SET display_name = '${newDisplayName}'
                WHERE user_id = '${userId}'`);
        } catch(err) {
            result = new AppError(500, err.message);
        }
        return result;
    },
    updateEmailSetting: async (userId, newEmail) => {
        let result;
        try {
            const db = await getDatabase();
            result = await db.execute(`UPDATE users SET email = '${newEmail}'
                WHERE user_id = '${userId}'`);
        } catch(err) {
            result = new AppError(500, err.message);
        }
        return result;
    },
    updateAboutMeSetting: async (userId,newAboutMe) => {
        let result;
        try {
            const db = await getDatabase();
            result = await db.execute(`UPDATE users SET about_me = '${newAboutMe}'
                WHERE user_id = '${userId}'`);
        } catch(err) {
            result = new AppError(500,err.message);
        }
        return result;
    },
    deleteImage: async (user,target) => {
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
                    db.execute(`UPDATE users SET pic_url = '${process.env.DEFAULT_PROFILE_PIC}', pic_filename = '${process.env.DEFAULT_PIC_FILENAME}'
                        WHERE user_id = '${user.user_id}'`);
                    path = process.env.DEFAULT_PROFILE_PIC;
                    filename = process.env.DEFAULT_PIC_FILENAME;
                    break;
                case 'BANNER':
                    filename = user.banner_filename;
                    await cloudinary.uploader.destroy(filename);
                   db.execute(`UPDATE users SET banner_url = null, banner_filename = null
                        WHERE user_id = '${user.user_id}'`);
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
    },
    deleteUser: async (id) => {
        let result;
        try {
            const db = await getDatabase();
            if (db instanceof AppError) return next(db);

            result = await db.execute(`DELETE FROM users WHERE user_id = '${id}'`);
        }catch(err) {
            result = new AppError(500, "Something went wrong deleting user account!");
        }
        return result;
    }
};