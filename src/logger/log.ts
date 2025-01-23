import winston from 'winston';

// Logger avec timestamp
const loggerWithTimestamp = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

// Logger sans timestamp
const loggerWithoutTimestamp = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error-simple.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined-simple.log' }),
        new winston.transports.Console({
            format: winston.format.simple(),
        }),
    ],
});

export { loggerWithTimestamp, loggerWithoutTimestamp };