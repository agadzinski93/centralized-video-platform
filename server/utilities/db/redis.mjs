import { logger } from "../logger.mjs";
import { createClient } from "redis";
import { NODE_ENV, USE_DOCKER, REDIS_PATH, REDIS_DOCKER_HOST, REDIS_PORT } from "../config.mjs";

let client = null;

class RedisConnection {
    #client;
    constructor(){}
    async setConnection() {
        if (NODE_ENV === 'production') {
            this.#client = createClient({
                socket:{
                    host:'localhost',
                    path:REDIS_PATH,
                    port:REDIS_PORT
                }
            }).on('error', err => logger.log('error',`Redis Client Error: ${err.message}`))
                .connect();
        }
        else {
            if (USE_DOCKER === 'true') {
                this.#client = await createClient({url:`redis://${REDIS_DOCKER_HOST}:${REDIS_PORT}`})
                    .on('error', err => logger.log('error',`Redis Client Error: ${err.message}`))
                    .connect();
            } else {
                this.#client = await createClient()
                    .on('error', err => logger.log('error',`Redis Client Error: ${err.message}`))
                    .connect();
            }
        }
    }
    getConnection() {
        return this.#client;
    }
    closeConnection(){
        if (this.#client) this.#client.disconnect();
    }
}

const getRedisConnection = async () => {
    if (client === null) {
        client = new RedisConnection();
        await client.setConnection();
    }
    return client.getConnection();
}

export {getRedisConnection};