const winston = require('winston');

function createLogger(service) {
    return winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.metadata({ fillWith: ['service'] }),
            winston.format.json()
        ),
        defaultMeta: { service },
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.printf(({ timestamp, level, message, metadata }) => {
                        return `${timestamp} [${metadata.service}] ${level}: ${message}`;
                    })
                )
            }),
            new winston.transports.File({
                filename: 'logs/error.log',
                level: 'error'
            }),
            new winston.transports.File({
                filename: 'logs/combined.log'
            })
        ]
    });
}

module.exports = { createLogger };