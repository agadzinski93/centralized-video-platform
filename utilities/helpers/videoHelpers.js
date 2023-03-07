const { getDatabase } = require("../mysql-connect");
const {escapeSQL} = require("./sanitizers");
const AppError = require("../AppError");
const e = require("connect-flash");
const axios = require("axios").default;

module.exports = {
  getTopicVideos: async (topic) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      topic = escapeSQL(topic);
      const videos = await db.execute(
        `SELECT * FROM videos WHERE topic = '${topic}' ORDER BY id`
      );
      
      return videos[0].map((v) => Object.assign({}, v));
    } catch (err) {
      return new AppError(500, "Error Retrieving Videos");
    }
  },
  getVideo: async (vidId, topicName) => {
    let video;
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      topicName = escapeSQL(topicName);

      const vidUrl = 'youtube.com/watch?v=' + vidId;

      let video = await db.execute(`SELECT * FROM videos WHERE url = '${vidUrl}' AND topic = '${topicName}' LIMIT 1`);

      let videoInfo = video[0].map((v) => Object.assign({}, v));
      if (videoInfo.length < 1) {
        return new AppError(400, "Video Doesn't Exist In This Topic");
      }
      else {
        return video[0].map((v) => Object.assign({}, v));
      }
    } catch(err) {
      return new AppError(500, "Error Retrieving Video");
    }
  },
  getVideos: async (vidIds) => {
    let video;
    let input = ``;
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      for (let i = 0; i < vidIds.length; i++) {
        if (i === 0) {
          input += `${vidIds[i]}`;
        }
        else {
          input += `,${vidIds[i]}`;
        }
      }
      
      let videos = await db.execute(`SELECT url FROM videos WHERE id IN (${input})`);

      let videoInfo = videos[0].map((v) => Object.assign({}, v));
      if (videoInfo.length < 1) {
        return new AppError(400, "Video Doesn't Exist");
      }
      else {
        return videos[0].map((v) => Object.assign({}, v));
      }
    } catch(err) {
      return new AppError(500, "Error Retrieving Video");
    }
  },
  getRecentVideos: async () => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      let videos = await db.execute(`SELECT * FROM videos ORDER BY id DESC LIMIT 14`);

      return videos[0].map((v) => Object.assign({}, v));
    } catch(err) {
      return new AppError(500, "Error Retrieving Videos");
    }
  },
  searchVideos: async (q) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      let videos = await db.execute(`SELECT * FROM videos WHERE title LIKE '%${q}%' LIMIT 20`);

      return videos[0].map((v) => Object.assign({}, v));
    } catch(err) {
      return new AppError(500, "Error Retrieving Videos");
    }
  },
  getMoreVideos: async (q,pageNumber) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      const skip = pageNumber * 20;

      let videos = await db.execute(`SELECT * FROM videos WHERE title LIKE '%${q}%' LIMIT 20 OFFSET ${skip}`);

      return videos[0].map((v) => Object.assign({}, v));
    } catch(err) {
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
    const resultsPerPage = 50; //Max allowed by YouTube API
    
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
        result = new AppError(500, "Invalid Playlist");
      });
    return result;
  },
  getPlaylistVideos: async (playlist) => {
    let result = new Array();
    let nextPageToken;
    const {playlistId, numOfVideos, resultsPerPage} = playlist;
    const numOfPages = Math.ceil(numOfVideos / resultsPerPage);
    const numOfVideosOnLastPage = numOfVideos % resultsPerPage;

    for (let i = 0;i < numOfPages;i++) {
      if (i === 0) {
        await axios
        .get(
          `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${process.env.YOUTUBE_KEY}
          &part=snippet&maxResults=${resultsPerPage}`
        )
        .then((yt) => {
          nextPageToken = yt.data.nextPageToken;
          if (i === numOfPages - 1) {
            for (let j = 0; j < numOfVideosOnLastPage; j++) {
              result.push(yt.data.items[j].snippet);
            }
          }
          else {
            for (let j = 0; j < resultsPerPage; j++) {
              result.push(yt.data.items[j].snippet);
            }
          }
        })
        .catch((err) => {
          result = new AppError(500, "Error adding first set of videos from playlist");
        });
      } else {
        await axios
        .get(
          `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${process.env.YOUTUBE_KEY}
          &part=snippet&maxResults=${resultsPerPage}&pageToken=${nextPageToken}`
        )
        .then((yt) => {
          nextPageToken = yt.data.nextPageToken;
          if (i === numOfPages - 1) {
            for (let j = 0; j < numOfVideosOnLastPage; j++) {
              result.push(yt.data.items[j].snippet);
            }
          }
          else {
            for (let j = 0; j < resultsPerPage; j++) {
              result.push(yt.data.items[j].snippet);
            }
          }
        })
        .catch((err) => {
          result = new AppError(500, `Error adding videos on page ${i+1}`);
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

      topicName = escapeSQL(topicName);

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
      let result = await db.execute(`INSERT IGNORE INTO videos (title, url, description, views, thumbnail, topic, username) 
            VALUES ${values}`);

      let data = result.map(o => Object.assign({},o))
      return {
        affectedRows: data[0].affectedRows,
        info: data[0].info
      };
    } catch(err) {
      return new AppError(500, `Error Adding Videos: ${err.message}`);
    }
  },
  /**
   * 
   * @param {int} id - id of video
   * @param {string} title - title of video
   * @param {string} description - description of video
   * @param {string} thumbnail - url of thumbnail
   * @returns 
   */
  modifyVideo: async (id, title, description, thumbnail = null) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      if (title !== null) {
        title = escapeSQL(title);
        if (description !== null) {
          description = escapeSQL(description);
        }
      }

      if (title !== null) {
        if (description !== null) {
          if (thumbnail !== null) {
            await db.execute(`UPDATE videos SET title = '${title}', description = '${description}', thumbnail = '${thumbnail}' WHERE id = ${id}`);
          }
          else {
            await db.execute(`UPDATE videos SET title = '${title}', description = '${description}' WHERE id = ${id}`);
          }
        }
        else if (thumbnail !== null) {
          await db.execute(`UPDATE videos SET title = '${title}', thumbnail = '${thumbnail}' WHERE id = ${id}`);
        }
        else {
          await db.execute(`UPDATE videos SET title = '${title}' WHERE id = ${id}`);
        }
      }
      else if (description !== null) {
        if (thumbnail !== null) {
          await db.execute(`UPDATE videos SET description = '${description}', thumbnail = '${thumbnail}' WHERE id = ${id}`);
        }
        else {
          await db.execute(`UPDATE videos SET description = '${description}' WHERE id = ${id}`);
        }
      }
      else if (thumbnail !== null) {
        await db.execute(`UPDATE videos SET thumbnail = '${thumbnail}' WHERE id = ${id}`);
      }

      return {title, description, thumbnail};
    } catch(err) {
      return new AppError(500, `Error Updating Video: ${err.message}`);
    }
  },
  swapVideoRecords: async (currentVidId, swapVideoId) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      const result = await db.execute(`CALL swap_video_rows(${currentVidId},${swapVideoId})`);
      
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
