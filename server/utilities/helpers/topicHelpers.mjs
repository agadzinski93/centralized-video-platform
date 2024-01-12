import { getDatabase } from "../db/mysql-connect.mjs";
import { escapeSQL } from "./sanitizers.mjs";
import {AppError} from "../AppError.mjs";
import { cloudinary } from "../cloudinary.mjs";

/**
 * Choose whether topic's title has hyphens or whitespaces
 * @param {string} name - name of topic
 * @param {boolean} enable - true replaces whitespaces with hyphens, false for opposite
 * @returns {string} modified topic title
 */
const enableHyphens = (name,enable) => {
  let output = (enable) ?  name.replaceAll(' ','-') :  name.replaceAll('-',' ')
  return output;
}
const topicExists = async (name) => {
  try {
    let topicName = escapeSQL(name);
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT COUNT(name) FROM topics WHERE name = ?`;
    const values = [topicName];
    let exists = await db.execute(sql,values);
    
    return Object.values(Object.assign({}, exists[0][0]))[0];
  } catch (err) {
    return new AppError(500, err.message);
  }
}
const insertTopic = async (
  topicName,
  topicDifficulty,
  topicDescription,
  username,
  topicImage,
  filename
) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    topicName = escapeSQL(topicName);
    topicDescription = escapeSQL(topicDescription);

    const sql = `INSERT INTO topics (name, description, difficulty, username, imageUrl, filename, timeCreated) 
      VALUES(?, ?, ?, ?, ?, ?, NOW())`;
    const values = [topicName,topicDescription,topicDifficulty,username,topicImage,filename];
    
    await db.execute(sql,values);

    return await getTopic(topicName);
  } catch (err) {
    return new AppError(500, `Error creating topic: ${err.message}`);
  }
}
const getAllTopics = async () => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT name, description, difficulty, username, imageUrl FROM topics LIMIT 10`;
    let topics = await db.execute(sql);
    return topics[0].map((o) => Object.assign({}, o));
  } catch (err) {
    return new AppError(500, "Error Retrieving Topics");
  }
}
const getUserTopics = async (username) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT name, description, difficulty, imageUrl 
      FROM topics WHERE username = ? LIMIT 10`;
    const values = [username];

    let topics = await db.execute(sql,values);
    return topics[0].map((o) => Object.assign({}, o));
  } catch (err) {
    return new AppError(500, `Error Retrieving ${username}'s topics`);
  }
}
const getTopic = async (topic) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    topic = escapeSQL(topic);

    const sql = `SELECT name, description, difficulty, imageUrl 
      FROM topics WHERE name = ?`;
    const values = [topic];
    let topics = await db.execute(sql,values);
    return topics[0].map((o) => Object.assign({}, o));
  } catch (err) {
    return new AppError(500, `Error Retrieving Topic`);
  }
}
const getRecentTopic = async () => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = 'SELECT * FROM recent_topics LIMIT 14';

    let topics = await db.execute(sql);
    return topics[0].map(o => Object.assign({}, o));
  } catch(err) {
    return new AppError(500, 'Error Retrieving Recent Videos');
  }
}
const updateTopic = async (
  topicName,
  topicDifficulty,
  topicDescription,
  originalTopicName
) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `UPDATE topics 
      SET name = ?, difficulty = ?, description = ?
      WHERE name = ?`;
    const values = [topicName,topicDifficulty,topicDescription,originalTopicName];

    await db.execute(sql,values);
  } catch (err) {
    return new AppError(500, `Error Updating Topic: ${err.message}`);
  }
}
const modifyTopicImage = async (topicName, topicImage, filename) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    //Get topic filename
    const sql = `UPDATE topics SET imageUrl = ?, filename = ? WHERE name = ?`;
    const values = [topicImage,filename,topicName];
    let result = await db.execute(sql,values);

    const sqlTwo = `SELECT imageUrl FROM topics WHERE name = ?`;
    const valuesTwo = [topicName];
    result = await db.execute(sqlTwo,valuesTwo);
    let topic = result[0].map(o => Object.assign({},o));
    
    return topic[0].imageUrl;
  } catch(err) {
    return new AppError(500, "Error Updating Topic Image");
  }
}
const removeTopic = async (topic) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    topic = escapeSQL(topic);

    const sql = `SELECT filename FROM topics WHERE name = ?`;
    const values = [topic];

    let topicInfo = await db.execute(sql,values);
    topicInfo = topicInfo[0].map((o) => Object.assign({},o))
    await cloudinary.uploader.destroy(topicInfo[0].filename);

    const sqlTwo = `DELETE FROM topics WHERE name = ?`;
    const valuesTwo = [topic];

    await db.execute(sqlTwo,valuesTwo);
    return null;
  } catch (err) {
    return new AppError(500, "Error Deleting Topic");
  }
}
const deleteTopicImage = async (topicName) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    topicName = escapeSQL(topicName);

    //Get topic filename
    const sql = `SELECT filename FROM topics WHERE name = ?`;
    const values = [topicName];

    let result = await db.execute(sql,values);
    let topic = result[0].map(o => Object.assign({}, o));
    let filename = topic[0].filename;
    if (filename !== 'null') {
      await cloudinary.uploader.destroy(filename);
    }
    
    return null;
  } catch(err) {
    return new AppError(500, "Error Updating Topic Image");
  }
}
const removeSelectedTopics = async (topics) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    if (!(Array.isArray(topics))) {
      return new AppError(422,'Invalid Arguments.');
    }
    else if (topics.length > 1000) {
      return new AppError(422,'Can\'t delete more than 1,000 topics at a time.');
    }
    else {
      let stmt = '';
      for (let i = 0; i < topics.length; i++) {
        (i === 0) ? stmt += `'${escapeSQL(topics[i])}'`: stmt += `,'${escapeSQL(topics[i])}'`;
      }

      //Select topics to get filenames
      const sql = `SELECT filename FROM topics WHERE name IN (?)`;
      const values = [stmt];
      let selectedTopics = await db.execute(sql,values);
      selectedTopics = selectedTopics[0].map(o => Object.assign({},o));
      for (let i = 0;i < selectedTopics.length; i++) {
        await cloudinary.uploader.destroy(selectedTopics[i].filename);
      }

      const sqlTwo = `DELETE FROM topics WHERE name IN (?)`;
      const valuesTwo = [stmt];
      await db.execute(sqlTwo,valuesTwo);
    }
  } catch (err) {
    return new AppError(500, "Error Deleting Topics");
  }
}

export {
  enableHyphens,
  topicExists,
  insertTopic,
  getAllTopics,
  getUserTopics,
  getTopic,
  getRecentTopic,
  updateTopic,
  modifyTopicImage,
  removeTopic,
  deleteTopicImage,
  removeSelectedTopics
};