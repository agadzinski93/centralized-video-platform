import { createLogger,transports,format } from "winston";
import { NODE_ENV } from "./config.mjs";

const timeZone = () => {
    return new Date().toLocaleString('en-US',{timeZone:'America/Los_Angeles'});
}

const ConsoleLog = new transports.Console({
    format:format.simple()
});

const logger = createLogger({
    transports:[
        new transports.File({
            filename:'general.log',
            level:'error',
            format:format.combine(format.timestamp({format:timeZone}),format.json())
        }),
        new transports.File({
            filename:'general.log',
            level:'info',
            format:format.combine(format.timestamp({format:timeZone}),format.json())
        })
    ]
});

const topicLogger = createLogger({
    transports:[
        new transports.File({
            filename:'topic.log',
            level:'error',
            format:format.combine(format.timestamp({format:timeZone}),format.json())
        })
    ]
});

const userLogger = createLogger({
    transports:[
        new transports.File({
            filename:'user.log',
            level:'error',
            format:format.combine(format.timestamp({format:timeZone}),format.json())
        })
    ]
});

const videoLogger = createLogger({
    transports:[
        new transports.File({
            filename:'video.log',
            level:'error',
            format:format.combine(format.timestamp({format:timeZone}),format.json())
        })
    ]
});

if (NODE_ENV !== 'production') {
    logger.add(ConsoleLog);
    topicLogger.add(ConsoleLog);
    userLogger.add(ConsoleLog);
    videoLogger.add(ConsoleLog);
}

export {logger,topicLogger,userLogger,videoLogger};