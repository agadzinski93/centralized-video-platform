const { getDatabase } = require("../mysql-connect");
const AppError = require("../AppError");

module.exports = {
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