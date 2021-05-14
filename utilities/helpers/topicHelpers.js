const { getDatabase } = require("../mysql-connect");
const AppError = require("../AppError");

module.exports = {
  topicExists: async (name) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      let exists = await db.execute(
        `SELECT COUNT(name) FROM topics WHERE name = '${name}' LIMIT 1`
      );
      return Object.values(Object.assign({}, exists[0][0]))[0];
    } catch (err) {
      return new AppError(500, err.message);
    }
  },
  insertTopic: async (
    topicName,
    topicDifficulty,
    topicDescription,
    username
  ) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      await db.execute(
        `INSERT INTO topics (name, description, difficulty, username) 
        VALUES('${topicName}', '${topicDescription}', '${topicDifficulty}', '${username}')`
      );
    } catch (err) {
      return new AppError(500, `Error creating topic: ${err.message}`);
    }
  },
  getAllTopics: async () => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      let topics = await db.execute(
        "SELECT name, description, difficulty, username FROM topics LIMIT 10"
      );
      return topics[0].map((o) => Object.assign({}, o));
    } catch (err) {
      return new AppError(500, "Error Retrieving Topics");
    }
  },
  getUserTopics: async (username) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      let topics = await db.execute(`SELECT name, description, difficulty 
      FROM topics WHERE username = '${username}' LIMIT 10`);
      return topics[0].map((o) => Object.assign({}, o));
    } catch (err) {
      return new AppError(500, `Error Retrieving ${username}'s topics`);
    }
  },
  getTopic: async (topic) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      let topics = await db.execute(`SELECT name, description, difficulty 
      FROM topics WHERE name = '${topic}' LIMIT 1`);
      return topics[0].map((o) => Object.assign({}, o));
    } catch (err) {
      return new AppError(500, `Error Retrieving Topic`);
    }
  },
  updateTopic: async (
    topicName,
    topicDifficulty,
    topicDescription,
    originalTopicName
  ) => {
    const db = await getDatabase();
    if (db instanceof AppError) return db;
    await db.execute(
      `UPDATE topics 
      SET name = '${topicName}', difficulty = '${topicDifficulty}', description = '${topicDescription}'
      WHERE name = '${originalTopicName}'`
    );
    try {
    } catch (err) {
      return new AppError(500, `Error Updating Topic`);
    }
  },
  removeTopic: async (topic) => {
    try {
      const db = await getDatabase();
      if (db instanceof AppError) return db;
      await db.execute(`DELETE FROM topics WHERE name = '${topic}'`);
      return null;
    } catch (err) {
      return new AppError(500, "Error Deleting Topic");
    }
  },
};
