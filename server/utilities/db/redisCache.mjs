import { logger } from "../logger.mjs";
import { getRedisConnection } from "./redis.mjs";

/**
 * Check if key exists in Redis, return false if it doesn't exist or no active Redis connection
 * @param {string} key - Key in redis db
 * @returns {Promise<string | boolean>}
 */
const getRedisCache = async (key) => {
    let cache = false;
    if (process.env.REDIS_ENABLED === 'true') {
        try {
            const client = await getRedisConnection();
            const value = await client.get(key);
            if (value) {
                cache = JSON.parse(value);
            }
        } catch (err) {
            cache = false;
            logger.log('error',`Redis 'Get Cache' Error: ${err.message}`);
        }
    }
    return cache;
}

/**
 * 
 * @param {string} key 
 * @param {string} value - Make sure to use JSON.stringify if needed
 * @param {object} options - Options for redis.set command
 */
const setRedisCache = async (key,value,options) => {
    if (process.env.REDIS_ENABLED === 'true') {
        try {
            const client = await getRedisConnection();
            await client.set(key,value,options);
        } catch (err) {
            logger.log('error',`Redis 'Get Cache' Error: ${err.message}`);
        }
    }
}

export {getRedisCache,setRedisCache};