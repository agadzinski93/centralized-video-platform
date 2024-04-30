import { getDatabase } from "../db/mysql-connect";
import { escapeSQL } from "./sanitizers";
import { AppError } from "../AppError";
import { Cloudinary } from "../storage";

import { RowDataPacket, ResultSetHeader } from "mysql2";

/**
 * Choose whether topic's title has hyphens or whitespaces
 * @param {string} name - name of topic
 * @param {boolean} enable - true replaces whitespaces with hyphens, false for opposite
 * @returns {string} modified topic title
 */
const enableHyphens = (name: string, enable: boolean): string => {
  let output = (enable) ? name.replaceAll(' ', '-') : name.replaceAll('-', ' ')
  return output;
}
const topicExists = async (name: string) => {
  try {
    let topicName = escapeSQL(name);
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT COUNT(name) FROM topics WHERE name = ?`;
    const values = [topicName];
    let exists = await db.execute<RowDataPacket[]>(sql, values);

    return Object.values(Object.assign({}, exists[0][0]))[0];
  } catch (err) {
    return new AppError(500, (err as Error).message);
  }
}
const insertTopic = async (
  topicName: string,
  topicDifficulty: string,
  topicDescription: string,
  username: string,
  topicImage: string,
  filename: string
) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    topicName = escapeSQL(topicName);
    topicDescription = escapeSQL(topicDescription);

    const sql = `INSERT INTO topics (name, description, difficulty, username, imageUrl, filename, timeCreated) 
      VALUES(?, ?, ?, ?, ?, ?, NOW())`;
    const values = [topicName, topicDescription, topicDifficulty, username, topicImage, filename];

    await db.execute(sql, values);

    return await getTopic(topicName);
  } catch (err) {
    return new AppError(500, `Error creating topic: ${(err as Error).message}`);
  }
}
const getAllTopics = async () => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT name, description, difficulty, username, imageUrl FROM topics LIMIT 10`;
    let topics = await db.execute<RowDataPacket[]>(sql);
    return topics[0].map((o) => Object.assign({}, o));
  } catch (err) {
    return new AppError(500, "Error Retrieving Topics");
  }
}
const getUserTopics = async (username: string) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `SELECT name, description, difficulty, imageUrl 
      FROM topics WHERE username = ? LIMIT 10`;
    const values = [username];

    let topics = await db.execute<RowDataPacket[]>(sql, values);
    return topics[0].map((o) => Object.assign({}, o));
  } catch (err) {
    return new AppError(500, `Error Retrieving ${username}'s topics`);
  }
}
const getTopic = async (topic: string) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    topic = escapeSQL(topic);

    const sql = `SELECT name, description, difficulty, imageUrl 
      FROM topics WHERE name = ?`;
    const values = [topic];
    let topics = await db.execute<RowDataPacket[]>(sql, values);
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

    let topics = await db.execute<RowDataPacket[]>(sql);
    return topics[0].map((o) => Object.assign({}, o));
  } catch (err) {
    return new AppError(500, 'Error Retrieving Recent Videos');
  }
}
const updateTopic = async (
  topicName: string,
  topicDifficulty: string,
  topicDescription: string,
  originalTopicName: string
): Promise<void | AppError> => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    const sql = `UPDATE topics 
      SET name = ?, difficulty = ?, description = ?
      WHERE name = ?`;
    const values = [topicName, topicDifficulty, topicDescription, originalTopicName];

    await db.execute(sql, values);
  } catch (err) {
    return new AppError(500, `Error Updating Topic: ${(err as Error).message}`);
  }
}
const modifyTopicImage = async (topicName: string, topicImage: string, filename: string) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    //Get topic filename
    const sql = `UPDATE topics SET imageUrl = ?, filename = ? WHERE name = ?`;
    const values = [topicImage, filename, topicName];
    let result = await db.execute<RowDataPacket[]>(sql, values);

    const sqlTwo = `SELECT imageUrl FROM topics WHERE name = ?`;
    const valuesTwo = [topicName];
    result = await db.execute<RowDataPacket[]>(sqlTwo, valuesTwo);
    let topic = result[0].map((o) => Object.assign({}, o));

    return topic[0].imageUrl;
  } catch (err) {
    return new AppError(500, (err as Error).message);
  }
}
const removeTopic = async (topic: string) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    topic = escapeSQL(topic);
    const sql = `SELECT filename FROM topics WHERE name = ?`;
    const values = [topic];

    let topicInfo = await db.execute<RowDataPacket[]>(sql, values);
    const topicfilename: string = topicInfo[0][0].filename;

    if (topicInfo) {
      await Cloudinary.uploader.destroy(topicfilename);
    }

    const sqlTwo = `DELETE FROM topics WHERE name = ?`;
    const valuesTwo = [topic];

    await db.execute(sqlTwo, valuesTwo);

    return null;
  } catch (err) {
    return new AppError(500, "Error Deleting Topic");
  }
}
const deleteTopicImage = async (topicName: string) => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;

    topicName = escapeSQL(topicName);

    //Get topic filename
    const sql = `SELECT filename FROM topics WHERE name = ?`;
    const values = [topicName];

    let result = await db.execute<RowDataPacket[]>(sql, values);
    let topic = result[0].map((o) => Object.assign({}, o));
    let filename = topic[0].filename;

    if (filename !== null) {
      await Cloudinary.uploader.destroy(filename);
    }

    return null;
  } catch (err) {
    return new AppError(500, (err as Error).message);
  }
}
const removeSelectedTopics = async (topics: string): Promise<void | AppError> => {
  try {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    if (!(Array.isArray(topics))) {
      return new AppError(422, 'Invalid Arguments.');
    }
    else if (topics.length > 100) {
      return new AppError(422, 'Can\'t delete more than 100 topics at a time.');
    }
    else {
      let preparedLength = '';
      let stmt = Array(topics.length);
      for (let i = 0; i < topics.length; i++) {
        stmt[i] = `${escapeSQL(topics[i])}`;
        (i === 0) ? preparedLength += '?' : preparedLength += ',?';
      }

      //Select topics to get filenames
      const sql = `SELECT filename FROM topics WHERE name IN (${preparedLength})`;
      const values = stmt;

      let selectedTopics = await db.execute<RowDataPacket[]>(sql, values);
      const topicFilenames = selectedTopics[0];

      for (let i = 0; i < topicFilenames.length; i++) {
        if (topicFilenames[i].filename) await Cloudinary.uploader.destroy(topicFilenames[i].filename);
      }

      const sqlTwo = `DELETE FROM topics WHERE name IN (${preparedLength})`;
      const valuesTwo = stmt;
      await db.execute(sqlTwo, valuesTwo);
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