const { getDatabase } = require("../mysql-connect");
const AppError = require("../AppError");
const axios = require("axios").default;

module.exports = {
  getTopicVideos: async (topic) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      const videos = await db.execute(
        `SELECT * FROM videos WHERE topic = '${topic}'`
      );
      
      return videos[0].map((v) => Object.assign({}, v));
    } catch (err) {
      return new AppError(500, "Error Retrieving Videos");
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

        result = {
          title: snippet.title,
          url: `youtube.com/watch?v=${vidId}`,
          description: snippet.description,
          views: stats.viewCount,
          thumbnail: snippet.thumbnails.medium.url,
        };
      })
      .catch((err) => {
        result = new AppError(500, "Invalid YT Video");
      });
    return result;
  },
  videoExists: async (id) => {
    try {
      let exists;
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      const result = await db.execute(
        `SELECT COUNT(url) FROM videos WHERE id = '${id}' LIMIT 1`
      );
      
      exists = Object.values(result[0][0])[0] === 0 ? (exists = false) : (exists = true);
        
      return exists;
    } catch (err) {
      return new AppError(500, "Error Checking Video");
    }
  },
  videoExistsInTopic: async (vidId, topicName) => {
    try {
      let exists;
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      const result = await db.execute(
        `SELECT COUNT(url) FROM videos WHERE url = 'youtube.com/watch?v=${vidId}' AND topic = '${topicName}' LIMIT 1`
      );
      exists = Object.values(result[0][0])[0] === 0 ? (exists = false) : (exists = true);
        
      return exists;
    } catch (err) {
      return new AppError(500, "Error Checking Video");
    }
  },
  insertVideo: async (video, topicName, username) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      if (video.description.length > 512) {
        video.description = video.description.substring(0,1023).toString();
      }
      await db.execute(`INSERT INTO videos (title, url, description, views, thumbnail, topic, username) 
            VALUES('${video.title}', '${video.url}', '${video.description}', '${video.views}', '${video.thumbnail}', '${topicName}', '${username}')`);

      return null;
    } catch (err) {
      return new AppError(500, `Error Adding Video: ${err.message}`);
    }
  },
  modifyVideo: async (id, title, description) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      await db.execute(`UPDATE videos SET title = '${title}', description = '${description}' WHERE id = ${id}`);

      return null;
    } catch(err) {
      return new AppError(500, `Error Updating Video: ${err.message}`);
    }
  },
  swapVideoRecords: async (currentVidId, swapVideoId) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      await db.execute(`CALL swap_video_rows(${currentVidId},${swapVideoId})`);

      return null;
    } catch(err) {
      return new AppError(500, "Error Swapping Videos");
    }
  },
  removeVideo: async (id) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      await db.execute(`DELETE FROM videos WHERE id = ${id}`);

      return null;
    } catch (err) {
      return new AppError(500, "Error Deleting Video");
    }
  },
  removeSelectedVideos: async (videos) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      let sql = '';

      for (let i = 0; i < videos.length; i++) {
        if (i === 0) {
          sql += `${videos[i]}`;
        }
        else {
          sql += `,${videos[i]}`;
        }
      }
      
      await db.execute(`DELETE FROM videos WHERE id IN (${sql})`);

      return null
    } catch(err) {
      return new AppError(500, "Error Deleting Videos");
    }
  }
};
