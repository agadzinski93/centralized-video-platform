const { getDatabase } = require("../mysql-connect");
const {escapeSQL} = require("./sanitizers");
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
  getPlaylistInfo: async (playlistId) => {
    let result;
    const resultsPerPage = 3; //Max allowed by YouTube API
    
    await axios
      .get(
        `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${process.env.YOUTUBE_KEY}
        &part=snippet`
      )
      .then((yt) => {
        const videos = yt.data.items;
        const numOfVideos = yt.data.pageInfo.totalResults;

        result = {
          playlistId,
          numOfVideos,
          resultsPerPage,
        }
      })
      .catch((err) => {
        result = new AppError(500, "Invalid YT Video");
      });
    return result;
  },
  getPlaylistVideos: async (playlist) => {
    let result = new Array();
    let nextPageToken;
    const {playlistId, numOfVideos, resultsPerPage} = playlist;
    const numOfPages = Math.ceil(numOfVideos / resultsPerPage);

    for (let i = 0;i < numOfPages;i++) {
      if (i === 0) {
        await axios
        .get(
          `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${process.env.YOUTUBE_KEY}
          &part=snippet&maxResults=${resultsPerPage}`
        )
        .then((yt) => {
          nextPageToken = yt.data.nextPageToken;
          for (let j = 0; j < resultsPerPage; j++) {
            result.push(yt.data.items[j].snippet);
          }
        })
        .catch((err) => {
          result = new AppError(500, "Invalid YT Video");
        });
      } else {
        await axios
        .get(
          `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${process.env.YOUTUBE_KEY}
          &part=snippet&maxResults=${resultsPerPage}&pageToken=${nextPageToken}`
        )
        .then((yt) => {
          nextPageToken = yt.data.nextPageToken;
          for (let j = 0; j < resultsPerPage; j++) {
            result.push(yt.data.items[j].snippet);
          }
        })
        .catch((err) => {
          result = new AppError(500, "Invalid YT Video");
        });
      }
    }
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
      video.title = escapeSQL(video.title);
      video.description = escapeSQL(video.description);
      if (video.description.length > 1023) {
        video.description = video.description.substring(0,1023).toString();
      }
      await db.execute(`INSERT INTO videos (title, url, description, views, thumbnail, topic, username) 
            VALUES('${video.title}', '${video.url}', '${video.description}', '${video.views}', '${video.thumbnail}', '${topicName}', '${username}')`);

      return null;
    } catch (err) {
      return new AppError(500, `Error Adding Video: ${err.message}`);
    }
  },
  insertManyVideos: async (videos, topicName, username) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      let values = ``;

      for (let i = 0; i < videos.length; i++) {
        videos[i].title = escapeSQL(videos[i].title);
        videos[i].description = escapeSQL(videos[i].description);
        if (videos[i].description.length > 1023) {
          videos[i].description = videos[i].description.substring(0,1023);
        }
        if (i === videos.length - 1) {
          values += `('${videos[i].title}', 'youtube.com/watch?v=${videos[i].resourceId.videoId}', '${videos[i].description}', '5', '${videos[i].thumbnails.medium.url}', '${topicName}', '${username}')`;
        }
        else {
          values += `('${videos[i].title}', 'youtube.com/watch?v=${videos[i].resourceId.videoId}', '${videos[i].description}', '5', '${videos[i].thumbnails.medium.url}', '${topicName}', '${username}'), `;
        }
      }
    
      await db.execute(`INSERT INTO videos (title, url, description, views, thumbnail, topic, username) 
            VALUES ${values}`);

      return null;
    } catch(err) {
      return new AppError(500, `Error Adding Videos: ${err.message}`);
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
