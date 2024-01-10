import { createLogger,transports,format } from "winston";

const timeZone = () => {
    return new Date().toLocaleString('en-US',{timeZone:'America/Los_Angeles'});
}

const ConsoleLog = new transports.Console({
    format:format.simple()
});

const logger = createLogger({
    transports:[
        new transports.File({
            filename:'error.log',
            level:'error',
            format:format.combine(format.timestamp({format:timeZone}),format.json())
        })
    ]
});

const topicLogger = createLogger({
    transports:[
        new transports.File({
            filename:'topic-error.log',
            level:'error',
            format:format.combine(format.timestamp({format:timeZone}),format.json())
        })
    ]
});

const userLogger = createLogger({
    transports:[
        new transports.File({
            filename:'user-error.log',
            level:'error',
            format:format.combine(format.timestamp({format:timeZone}),format.json())
        })
    ]
});

const videoLogger = createLogger({
    transports:[
        new transports.File({
            filename:'video-error.log',
            level:'error',
            format:format.combine(format.timestamp({format:timeZone}),format.json())
        })
    ]
});

if (process.env.NODE_ENV !== 'production') {
    logger.add(ConsoleLog);
    topicLogger.add(ConsoleLog);
    userLogger.add(ConsoleLog);
    videoLogger.add(ConsoleLog);
}

export {logger,topicLogger,userLogger,videoLogger};