import { getRedisConnection } from "./db/redis.mjs";

const redisCache = async (key) => {
    const client = await getRedisConnection();
    let cache = null;
    try {
        const value = await client.get(key);
        if (value) {
            cache = JSON.parse(value);
        }
    } catch (err) {
        console.error(`Redis Get Error: ${err.message}`);
    }
    return cache;
}

export {redisCache};