import { getDatabase } from "../mysql-connect.mjs";
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
    let exists = await db.execute(
      `SELECT COUNT(name) FROM topics WHERE name = '${topicName}' LIMIT 1`
    );
    
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
    
    await db.execute(
      `INSERT INTO topics (name, description, difficulty, username, imageUrl, filename, timeCreated) 
      VALUES('${topicName}', '${topicDescription}', '${topicDifficulty}', '${username}', '${topicImage}', '${filename}', NOW())`
    );
  } catch (err) {
    return new AppError(500, `Error creating topic: ${err.message}`);
  }
}
const getAllTopics = async () => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    let topics = await db.execute(
      "SELECT name, description, difficulty, username, imageUrl FROM topics LIMIT 10"
    );
    return topics[0].map((o) => Object.assign({}, o));
  } catch (err) {
    return new AppError(500, "Error Retrieving Topics");
  }
}
const getUserTopics = async (username) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    let topics = await db.execute(`SELECT name, description, difficulty, imageUrl 
    FROM topics WHERE username = '${username}' LIMIT 10`);
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
    let topics = await db.execute(`SELECT name, description, difficulty, imageUrl 
    FROM topics WHERE name = '${topic}' LIMIT 1`);
    return topics[0].map((o) => Object.assign({}, o));
  } catch (err) {
    return new AppError(500, `Error Retrieving Topic`);
  }
}
const getRecentTopic = async () => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    let topics = await db.execute('SELECT * FROM recent_topics LIMIT 14');
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
    await db.execute(
      `UPDATE topics 
      SET name = '${topicName}', difficulty = '${topicDifficulty}', description = '${topicDescription}'
      WHERE name = '${originalTopicName}'`
  );
  } catch (err) {
    return new AppError(500, `Error Updating Topic: ${err.message}`);
  }
}
const modifyTopicImage = async (topicName, topicImage, filename) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    //Get topic filename
    let result = await db.execute(`UPDATE topics SET imageUrl = '${topicImage}', filename = '${filename}' WHERE name = '${topicName}'`);
    result = await db.execute(`SELECT imageUrl FROM topics WHERE name = '${topicName}'`);
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
    let topicInfo = await db.execute(`SELECT filename FROM topics WHERE name = '${topic}' LIMIT 1`);
    topicInfo = topicInfo[0].map((o) => Object.assign({},o))
    await cloudinary.uploader.destroy(topicInfo[0].filename);
    await db.execute(`DELETE FROM topics WHERE name = '${topic}'`);
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
    let result = await db.execute(`SELECT filename FROM topics WHERE name = '${topicName}'`);
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
    let sql = '';
    for (let i = 0; i < topics.length; i++) {
      (i === 0) ? sql += `'${escapeSQL(topics[i])}'`: sql += `,'${escapeSQL(topics[i])}'`;
    }

    //Select topics to get filenames
    let selectedTopics = await db.execute(`SELECT filename FROM topics WHERE name IN (${sql})`);
    selectedTopics = selectedTopics[0].map(o => Object.assign({},o));
    for (let i = 0;i < selectedTopics.length; i++) {
      await cloudinary.uploader.destroy(selectedTopics[i].filename);
    }

    await db.execute(`DELETE FROM topics WHERE name IN (${sql})`);
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