const FailedRequest = require('../models/FailedRequest');
const alertService = require('../services/AlertService');
const { createLogger } = require('../utils/Logger');
const config = require('../config/environment');
const { RateLimiter } = require('../utils/rateLimiter');

const logger = createLogger('RequestMonitor');
const rateLimiter = new RateLimiter();

async function monitorRequests(req, res, next) {
    const ip = req.ip;

    try {
        // Rate limiting check
        if (!rateLimiter.checkLimit(ip)) {
            await handleFailedRequest(req, 'Rate limit exceeded');
            return res.status(429).json({
                error: 'Too many requests',
                retryAfter: rateLimiter.getRetryAfter(ip)
            });
        }

        // Auth token validation
        const authToken = req.headers['authorization'];
        if (!authToken || !isValidToken(authToken)) {
            await handleFailedRequest(req, 'Invalid authentication token');
            return res.status(401).json({ error: 'Invalid authentication token' });
        }

        // Required headers check
        const missingHeaders = checkRequiredHeaders(req);
        if (missingHeaders.length > 0) {
            await handleFailedRequest(req, `Missing required headers: ${missingHeaders.join(', ')}`);
            return res.status(400).json({ error: 'Missing required headers' });
        }

        next();
    } catch (error) {
        logger.error('Error in request monitor:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function handleFailedRequest(req, reason) {
    const ip = req.ip;

    try {
        await FailedRequest.create({
            ip,
            reason,
            headers: req.headers,
            endpoint: req.path
        });

        const timeWindow = new Date(Date.now() - (config.TIME_WINDOW_MINUTES * 60 * 1000));
        const recentFailures = await FailedRequest.find({
            ip,
            timestamp: { $gte: timeWindow }
        }).sort({ timestamp: -1 });

        if (recentFailures.length >= config.ALERT_THRESHOLD) {
            const details = recentFailures.map(failure => ({
                timestamp: failure.timestamp,
                reason: failure.reason
            }));

            await alertService.sendAlert(ip, recentFailures.length, details);
        }
    } catch (error) {
        logger.error('Error handling failed request:', error);
        throw error;
    }
}

function isValidToken(token) {
    return token.startsWith('Bearer ') && token.length >= 32;
}

function checkRequiredHeaders(req) {
    const requiredHeaders = ['content-type', 'user-agent'];
    return requiredHeaders.filter(header => !req.headers[header]);
}

module.exports = monitorRequests;