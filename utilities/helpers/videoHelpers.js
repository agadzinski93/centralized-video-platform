const { getDatabase } = require("../mysql-connect");
const AppError = require("../AppError");
const axios = require("axios").default;

module.exports = {
    getTopicVideos: async (topic) => {
        try {
            const db = await getDatabase();
            if (db instanceof AppError) return db;
            const videos = await db.execute(`SELECT * FROM videos where topic = '${topic}'`);

            return videos[0].map(v => Object.assign({}, v));
        } catch(err) {
            return new AppError(500, "Error Retrieving videos");
        }
    },
    getVideoInfo: async (vidId) => {
        let result;

        await axios
        .get(
            `https://www.googleapis.com/youtube/v3/videos?id=${vidId}&key=${process.env.YOUTUBE_KEY}
            &part=snippet,statistics&fields=items(id,snippet,statistics)`
        )
        .then((yt) => {
            let snippet = yt.data.items[0].snippet;
            let stats = yt.data.items[0].statistics;
    
            result = {title: snippet.title, url: `youtube.com/watch?v=${vidId}`, description: snippet.description, views: stats.viewCount, likes: stats.likeCount, thumbnail: snippet.thumbnails.medium.url};
        })
        .catch((err) => {
            result = new AppError(500, "Invalid YT Video");
        });
        return result;
    },
    videoExists: async (vidId) => {
        try {
            let exists;
            const db = await getDatabase();
            if (db instanceof AppError) return db;

            const result = await db.execute(`SELECT COUNT(id) FROM videos WHERE id = '${vidId}' LIMIT 1`);
            (Object.values(result[0][0])[0] !== 0) ? exists = true : exists = false;

            return exists;
        } catch(err) {
            return new AppError(500, "Error Checking Video");
        }
    },
    insertVideo: async (video, topicName) => {
        try {
            const db = await getDatabase();
            if (db instanceof AppError) return db;

            db.execute(`INSERT INTO videos (title, url, description, views, likes, thumbnail, topic) 
            VALUES('${video.title}', '${video.url}', '${video.description}', '${video.views}', '${video.likes}', '${video.thumbnail}', '${topicName}')`);
            
            return null;
        } catch (err) {
            return new AppError(500, "Error Adding Video");
        }
    },
    removeVideo: async (id) => {
        try {
            const db = await getDatabase();
            if (db instanceof AppError) return db;

            db.execute(`DELETE FROM videos WHERE id = ${id}`);

            return null;
        } catch (err) {
            return new AppError(500, "Error Deleting Video");
        }
    }
}