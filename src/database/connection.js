const mongoose = require('mongoose');
const config = require('../config/environment');
const { createLogger } = require('../utils/Logger');

const logger = createLogger('Database');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGODB_URI, {
            retryWrites: true,
            w: 'majority',
            maxPoolSize: 50,
            wtimeoutMS: 2500
        });

        logger.info(`MongoDB Connected: ${conn.connection.host}`);

        mongoose.connection.on('error', err => {
            logger.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('MongoDB disconnected');
        });

        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;