const { getDatabase } = require("../mysql-connect");
const AppError = require("../AppError");
const {cloudinary} = require("../../utilities/cloudinary");

module.exports = {
    /**
     * Alter of path and filename of an image
     * @param {*} userId 
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