const Bull = require('bull');
const nodemailer = require('nodemailer');
const config = require('../config/environment');
const { createLogger } = require('../utils/Logger');

const emailQueue = new Bull('email', {
    redis: {
        host: '10.0.2.15',
        port: '6379'
    }
});
const transporter = nodemailer.createTransport(config.SMTP_CONFIG);
const logger = createLogger('QueueWorker');

emailQueue.process(async (job) => {
    try {
        await transporter.sendMail(job.data);
        console.log(job.data);
        logger.info(`Email sent successfully: ${job.data.to}`);
    } catch (error) {
        logger.error(`Failed to send email: ${error}`)
        throw error;
    }
})