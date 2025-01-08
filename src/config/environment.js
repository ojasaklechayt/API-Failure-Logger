require('dotenv').config();

const config = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    MONGODB_URI: process.env.MONGODB_URI,
    PORT: parseInt(process.env.PORT) || 3000,
    ALERT_THRESHOLD: parseInt(process.env.ALERT_THRESHOLD) || 5,
    TIME_WINDOW_MINUTES: parseInt(process.env.TIME_WINDOW_MINUTES) || 10,
    SMTP_CONFIG: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    },
    ADMIN_EMAIL: process.env.ADMIN_EMAIL
};

module.exports = config;