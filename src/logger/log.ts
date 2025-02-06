import winston from 'winston';
import chalk from 'chalk'; 

// Format personnalisé 
const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    const levelColor = {
        error: chalk.red,
        warn: chalk.yellow,
        info: chalk.green,
        debug: chalk.blue
    }[level] || chalk.white;

    const messageColor = {
        error: chalk.red,
        warn: chalk.yellow,
        info: chalk.green, 
        debug: chalk.cyan
    }[level] || chalk.white;

    return `${levelColor(level.toUpperCase())} ${messageColor(message)} ${chalk.gray(timestamp)}`;
});

// Format personnalisé sans timestamp
const simpleCustomFormat = winston.format.printf(({ level, message }) => {
    const levelColor = {
        error: chalk.red,
        warn: chalk.yellow,
        info: chalk.green,
        debug: chalk.blue
    }[level] || chalk.white;

    const messageColor = {
        error: chalk.red,
        warn: chalk.yellow,
        info: chalk.green, 
        debug: chalk.cyan
    }[level] || chalk.white;

    return `${levelColor(level.toUpperCase())} ${messageColor(message)}`;
});

// Logger avec timestamp
const loggerWithTimestamp = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        customFormat
    ),
    transports: [
        // Les fichiers de logs gardent le format JSON sans couleurs
        new winston.transports.File({ 
            filename: 'error.log', 
            level: 'error',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        new winston.transports.File({ 
            filename: 'combined.log',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        // La console utilise le format personnalisé avec couleurs
        new winston.transports.Console()
    ],
});

// Logger sans timestamp
const loggerWithoutTimestamp = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        simpleCustomFormat
    ),
    transports: [
        new winston.transports.File({ 
            filename: 'error-simple.log', 
            level: 'error',
            format: winston.format.json()
        }),
        new winston.transports.File({ 
            filename: 'combined-simple.log',
            format: winston.format.json()
        }),
        new winston.transports.Console()
    ],
});

export { loggerWithTimestamp, loggerWithoutTimestamp };