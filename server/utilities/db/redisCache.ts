import { logger } from "../logger";
import { getRedisConnection } from "./redis";
import { REDIS_ENABLED } from "../config";

import { SetOptions } from "redis";
import { ApiResponse } from "../../types/types";

/**
 * Check if key exists in Redis, return false if it doesn't exist or no active Redis connection
 * @param {string} key - Key in redis db
 * @returns {Promise<string | boolean>}
 */
const getRedisCache = async (key: string): Promise<ApiResponse | null> => {
    let cache: ApiResponse | null = null;
    if (REDIS_ENABLED === 'true') {
        try {
            const client = await getRedisConnection();
            const value = (client) && await client.get(key);
            if (value) {
                cache = JSON.parse(value);
            }
        } catch (err) {
            logger.log('error', `Redis 'Get Cache' Error: ${(err as Error).message}`);
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
const setRedisCache = async (key: string, value: string, options: SetOptions): Promise<void> => {
    if (REDIS_ENABLED === 'true') {
        try {
            const client = await getRedisConnection();
            if (client) {
                await client.set(key, value, options);
            }
            else {
                throw Error('Client is undefined');
            }
        } catch (err) {
            logger.log('error', `Redis 'Set Cache' Error: ${(err as Error).message}`);
        }
    }
}

export { getRedisCache, setRedisCache };