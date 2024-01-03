import { createClient } from "redis";

let client = null;

class RedisConnection {
    #client;
    constructor(){}
    async setConnection() {
        if (process.env.NODE_ENV === 'production') {
            this.#client = createClient({
                socket:{
                    host:'localhost',
                    path:process.env.REDIS_PATH,
                    port:process.env.REDIS_PORT
                }
            }).on('error', err => console.error(`Redis Client Error: ${err.message}`))
                .connect();
        }
        else {
            this.#client = await createClient()
                .on('error', err => console.error(`Redis Client Error: ${err.message}`))
                .connect();

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