import { getDatabase } from "../db/mysql-connect.mjs";
import { escapeSQL,prepareLikeStatement } from "./sanitizers.mjs";
import {AppError} from "../AppError.mjs";

  const getTopicVideos = async (topic) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      topic = escapeSQL(topic);

      const sql = `SELECT * FROM videos WHERE topic = ? ORDER BY id`;
      const values = [topic];

      const videos = await db.execute(sql,values);
      
      return videos[0].map((v) => Object.assign({}, v));
    } catch (err) {
      return new AppError(500, "Error Retrieving Videos");
    }
  }
  /**
   * 
   * @param {string} vidId - Unique ID of video 
   * @param {string} topicName - Unique topic name video belongs to
   * @param {boolean} author - True if you want to include info on video's author
   * @returns AppError or Object containing video info
   */
  const getVideo = async (vidId, topicName, author = false) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      topicName = escapeSQL(topicName);

      const vidUrl = 'youtube.com/watch?v=' + vidId;
      let video;
      if (!author) {
        const sql = `SELECT * FROM videos WHERE url = ? AND topic = ?`;
        const values = [vidUrl,topicName];

        video = await db.execute(sql,values);
      } else {
        const sqlTwo = `SELECT v.*,u.user_id,u.subscribers,u.pic_url 
          FROM videos v JOIN users u 
          ON v.username = u.username 
          WHERE url = ? AND topic = ?`;
        const valuesTwo = [vidUrl,topicName];

        video = await db.execute(sqlTwo,valuesTwo);
      }

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
  }
  const getVideos = async (vidIds) => {
    let videos;
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
      
      const sql = `SELECT url FROM videos WHERE id IN (?)`;
      const values = [input];

      videos = await db.execute(sql,values);

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
  }
  const getRecentVideos = async () => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      const sql = 'SELECT * FROM recent_videos LIMIT 14';

      let videos = await db.execute(sql);

      return videos[0].map((v) => Object.assign({}, v));
    } catch(err) {
      return new AppError(500, "Error Retrieving Videos");
    }
  }
  const searchVideos = async (q) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      const query = prepareLikeStatement(q);

      const sql = `SELECT * FROM search_videos WHERE title LIKE ? LIMIT 20`;
      const values = [query+'%'];

      let videos = await db.execute(sql,values);
      return videos[0];
    } catch(err) {
      return new AppError(500, "Error Retrieving Videos");
    }
  }
  const getMoreVideos = async (q,pageNumber) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      const skip = pageNumber * 20;

      const query = prepareLikeStatement(q);

      const sql = `SELECT * FROM search_videos WHERE title LIKE ? LIMIT 20 OFFSET ?`;
      const values = [query+'%',skip.toString()];

      let videos = await db.execute(sql,values);
      return videos[0];
    } catch(err) {
      return new AppError(500, "Error Retrieving Videos");
    }
  }
  const getVideoInfo = async (vidId) => {
    let result;

    try {
      const data = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${vidId}&key=${process.env.YOUTUBE_KEY}
        &part=snippet,statistics&fields=items(id,snippet,statistics)`,
        {
          method:'GET'
        });

      const yt = await data.json();
      let snippet = yt.items[0].snippet;
      let stats = yt.items[0].statistics;

      result = {
        title: snippet.title,
        url: `youtube.com/watch?v=${vidId}`,
        description: snippet.description,
        views: stats.viewCount,
        thumbnail: snippet.thumbnails.medium.url,
      };
    } catch(err) {
      result = new AppError(500, "Invalid YT Video");
    }
    return result;
  }
  const getPlaylistInfo = async (playlistId) => {
    let result;
    const resultsPerPage = 50; //Max allowed by YouTube API

    try {
      const data = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${process.env.YOUTUBE_KEY}
        &part=snippet`,
        {
          method:'GET'
        });
      const yt = await data.json();
      const videos = yt.items;
      const numOfVideos = yt.pageInfo.totalResults;

      result = {
        playlistId,
        numOfVideos,
        resultsPerPage,
      }
    }catch(err) {
      result = new AppError(500, "Invalid Playlist");
    }
    return result;
  }
  const getPlaylistVideos = async (playlist) => {
    let result = new Array();
    let nextPageToken;
    const {playlistId, numOfVideos, resultsPerPage} = playlist;
    const numOfPages = Math.ceil(numOfVideos / resultsPerPage);
    const numOfVideosOnLastPage = numOfVideos % resultsPerPage;

    for (let i = 0;i < numOfPages;i++) {
      if (i === 0) {

        try {
          const data = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${process.env.YOUTUBE_KEY}
            &part=snippet&maxResults=${resultsPerPage}`);
          const yt = await data.json();
          nextPageToken = yt.nextPageToken;
          if (i === numOfPages - 1) {
            for (let j = 0; j < numOfVideosOnLastPage; j++) {
              result.push(yt.items[j].snippet);
            }
          }
          else {
            for (let j = 0; j < resultsPerPage; j++) {
              result.push(yt.items[j].snippet);
            }
          }
        }catch(err){
          result = new AppError(500, "Error adding first set of videos from playlist");
        }

      } else {
      try {
        const data = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&key=${process.env.YOUTUBE_KEY}
          &part=snippet&maxResults=${resultsPerPage}&pageToken=${nextPageToken}`);
        const yt = await data.json();

        nextPageToken = yt.nextPageToken;
        if (i === numOfPages - 1) {
          for (let j = 0; j < numOfVideosOnLastPage; j++) {
            result.push(yt.items[j].snippet);
          }
        }
        else {
          for (let j = 0; j < resultsPerPage; j++) {
            result.push(yt.items[j].snippet);
          }
        }
      }catch(err){
        result = new AppError(500, `Error adding videos on page ${i+1}`);
      }
    }
  }
    return result;
  }
  const videoExists = async (id) => {
    try {
      let exists;
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      const sql = `SELECT COUNT(url) FROM videos WHERE id = ? LIMIT 1`;
      const values = [id];

      const result = await db.execute(sql,values);
      
      exists = Object.values(result[0][0])[0] === 0 ? (exists = false) : (exists = true);
        
      return exists;
    } catch (err) {
      return new AppError(500, "Error Checking Video");
    }
  }
  const videoExistsInTopic = async (vidId, topicName) => {
    try {
      let exists;
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      topicName = escapeSQL(topicName);

      const sql = `SELECT COUNT(url) FROM videos WHERE url = 'youtube.com/watch?v=:vidId' AND topic = :topicName`;
      const values = {vidId,topicName};

      const result = await db.execute(sql,values);
      exists = Object.values(result[0][0])[0] === 0 ? (exists = false) : (exists = true);
        
      return exists;
    } catch (err) {
      return new AppError(500, "Error Checking Video");
    }
  }
  const insertVideo = async (video, topicName, username) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      video.title = escapeSQL(video.title);
      video.description = escapeSQL(video.description);
      if (video.description.length > 2047) {
        video.description = video.description.substring(0,2047).toString();
      }
      const sql = `INSERT INTO videos (title, url, description, views, thumbnail, topic, username) 
        VALUES(?, ?, ?, ?, ?, ?, ?)`;
      const values = [video.title,video.url,video.description,video.views,video.thumbnail,topicName,username];

      await db.execute(sql,values);

      const sqlTwo = `SELECT id FROM videos WHERE url = ? AND topic = ?`;
      const valuesTwo = [video.url,topicName];

      const id = await db.execute(sqlTwo,valuesTwo);
      
      return id[0][0].id;
    } catch (err) {
      return new AppError(500, `Error Adding Video: ${err.message}`);
    }
  }
  const insertManyVideos = async (videos, topicName, username) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      let values = ``;

      for (let i = 0; i < videos.length; i++) {
        videos[i].title = escapeSQL(videos[i].title);
        videos[i].description = escapeSQL(videos[i].description);
        if (videos[i].description.length > 2047) {
          videos[i].description = videos[i].description.substring(0,2047);
        }
        if (i === videos.length - 1) {
          values += `('${videos[i].title}', 'youtube.com/watch?v=${videos[i].resourceId.videoId}', '${videos[i].description}', '5', '${videos[i].thumbnails.medium.url}', '${topicName}', '${username}')`;
        }
        else {
          values += `('${videos[i].title}', 'youtube.com/watch?v=${videos[i].resourceId.videoId}', '${videos[i].description}', '5', '${videos[i].thumbnails.medium.url}', '${topicName}', '${username}'), `;
        }
      }
      const sql = `INSERT IGNORE INTO videos (title, url, description, views, thumbnail, topic, username) 
        VALUES ?`;
      const input = [values];

      let result = await db.execute(sql,input);

      let firstId = await db.execute('SELECT LAST_INSERT_ID() As firstId');
      firstId = firstId[0][0].firstId;
      
      let data = result.map(o => Object.assign({},o))

      const sqlTwo = `SELECT * FROM videos WHERE id BETWEEN ? AND ?`;
      const inputTwo = [firstId,firstId + data[0].affectedRows - 1];

      let addedVideos = await db.execute(sqlTwo,inputTwo);
      
      return {
        affectedRows: data[0].affectedRows,
        info: data[0].info,
        addedVideos:addedVideos[0]
      };
    } catch(err) {
      console.log(err.message);
      return new AppError(500, `Error Adding Videos: ${err.message}`);
    }
  }
  /**
   * 
   * @param {int} id - id of video
   * @param {string} title - title of video
   * @param {string} description - description of video
   * @param {string} thumbnail - url of thumbnail
   * @returns 
   */
  const modifyVideo = async (id, title, description, thumbnail = null) => {
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
            const sql = `UPDATE videos SET title = ?, description = ?, thumbnail = ? WHERE id = ?`;
            const values = [title,description,thumbnail,id];
            await db.execute(sql,values);
          }
          else {
            const sqlTwo = `UPDATE videos SET title = ?, description = ? WHERE id = ?`;
            const valuesTwo = [title,description,id];
            await db.execute(sqlTwo,valuesTwo);
          }
        }
        else if (thumbnail !== null) {
          const sqlThree = `UPDATE videos SET title = ?, thumbnail = ? WHERE id = ?`;
          const valuesThree = [title,thumbnail,id];
          await db.execute(sqlThree,valuesThree);
        }
        else {
          const sqlFour = `UPDATE videos SET title = ? WHERE id = ?`;
          const valuesFour = [title,id];
          await db.execute(sqlFour,valuesFour);
        }
      }
      else if (description !== null) {
        if (thumbnail !== null) {
          const sqlFive = `UPDATE videos SET description = ?, thumbnail = ? WHERE id = ?`;
          const valuesFive = [description,thumbnail,id];
          await db.execute(sqlFive,valuesFive);
        }
        else {
          const sqlSix = `UPDATE videos SET description = ? WHERE id = ?`;
          const valuesSix = [description,id];
          await db.execute(sqlSix,valuesSix);
        }
      }
      else if (thumbnail !== null) {
        const sqlSeven = `UPDATE videos SET thumbnail = ? WHERE id = ?`;
        const valuesSeven = [thumbnail,id];
        await db.execute(sqlSeven,valuesSeven);
      }
      return {title, description, thumbnail};
    } catch(err) {
      return new AppError(500, `Error Updating Video: ${err.message}`);
    }
  }
  const swapVideoRecords = async (currentVidId, swapVideoId) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      const sql = `CALL swap_video_rows(?,?)`;
      const values = [currentVidId,swapVideoId];

      await db.execute(sql,values);
      
      return null;
    } catch(err) {
      return new AppError(500, "Error Swapping Videos");
    }
  }
  const removeVideo = async (id) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      const sql = `DELETE FROM videos WHERE id = ?`;
      const values = [id];

      await db.execute(sql,values);

      return null;
    } catch (err) {
      return new AppError(500, "Error Deleting Video");
    }
  }
  const removeSelectedVideos = async (videos) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;

      let stmt = '';

      for (let i = 0; i < videos.length; i++) {
        if (i === 0) {
          stmt += `${videos[i]}`;
        }
        else {
          stmt += `,${videos[i]}`;
        }
      }

      const sql = `DELETE FROM videos WHERE id IN (?)`;
      const values = [stmt];
      
      await db.execute(sql,values);

      return null
    } catch(err) {
      return new AppError(500, "Error Deleting Videos");
    }
  }

  export {
    getTopicVideos,
    getVideo,
    getVideos,
    getRecentVideos,
    searchVideos,
    getMoreVideos,
    getVideoInfo,
    getPlaylistInfo,
    getPlaylistVideos,
    videoExists,
    videoExistsInTopic,
    insertVideo,
    insertManyVideos,
    modifyVideo,
    swapVideoRecords,
    removeVideo,
    removeSelectedVideos
  };