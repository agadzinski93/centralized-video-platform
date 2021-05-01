const { getDatabase } = require("../mysql-connect");
const AppError = require("../AppError");

module.exports = {
  topicExists: async (name) => {
    try {
      const db = await getDatabase();
      let exists = await db.execute(
        `SELECT COUNT(name) FROM topics WHERE name = '${name}' LIMIT 1`
      );
      return Object.values(Object.assign({}, exists[0][0]))[0];
    } catch (err) {
      return new AppError(500, err.message);
    }
  },
  insertTopic: async (topicName, topicDifficulty, topicDescription) => {
    const db = await getDatabase();
    await db.execute(
      `INSERT INTO topics (name, description, difficulty) VALUES('${topicName}', '${topicDescription}', '${topicDifficulty}')`
    );
  },
  getTopics: async () => {
    try {
      const db = await getDatabase();
      let topics = await db.execute(
        "SELECT name, description, difficulty FROM topics LIMIT 10"
      );
      return topics[0].map((o) => Object.assign({}, o));
    } catch (err) {
      return new AppError(500, "Error Retrieving Topics");
    }
  },
  removeTopic: async (topic) => {
    try {
      const db = await getDatabase();
      await db.execute(`DELETE FROM topics WHERE name = '${topic}'`);
      return null;
    } catch (err) {
      return new AppError(500, "Error Deleting Topic");
    }
  },
};
