const { createLogger } = require('../utils/Logger');
const logger = createLogger('ErrorHandler');

const errorHandler = (err, req, res, next) => {
    logger.error('Error:', {
        error: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        ip: req.ip
    });

    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            details: Object.values(err.errors).map(error => error.message)
        });
    }

    if (err.name === 'MongoError' && err.code === 11000) {
        return res.status(409).json({
            error: 'Duplicate Entry',
            details: 'A record with this key already exists'
        });
    }

    res.status(500).json({
        error: 'Internal Server Error',
        requestId: req.id
    });
};

module.exports = errorHandler;