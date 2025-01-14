const MetricsService = require('../services/MerticsServices');
const { createLogger } = require('../utils/Logger');
const FailedRequest = require('../models/FailedRequest');

const logger = createLogger('MetricsRouter');

const getAllMetrics = async (req, res) => {
    try {
        const timeRange = req.query.timeRange || '24h';
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        if (page < 1 || limit < 1 || limit > 100) {
            return res.status(400).json({
                error: 'Invalid pagination parameters'
            });
        }

        const metrics = await MetricsService.getMetrics(timeRange, { page, limit });
        res.json(metrics);
    } catch (error) {
        logger.error('Error fetching metrics: ', error);
        res.status(500).json({ error: 'Failed to fetch metrics' });
    }
}

const getIPMetrics = async (req, res) => {
    try {
        const { ip } = req.params;
        const timeRange = req.query.timeRange || '24h';

        const startTime = new Date(Date.now() - getTimeInMilliseconds(timeRange));
        const failures = await FailedRequest.find({
            ip, timestamp: { $gte: startTime }
        }).sort({ timestamp: -1 })
            .select('-__v');

        res.json({
            ip,
            timeRange,
            totalFailures: failures.length,
            failures
        });
    } catch (error) {
        logger.error(`Error fetching metrics for IP ${req.params.ip}:`, error);
        res.status(500).json({ error: 'Failed to fetch IP metrics' });
    }
}

const getStatistics = async (req, res) => {
    try {
        const timeRange = req.query.timeRange || '24h';
        const startTime = new Date(Date.now() - getTimeInMilliseconds(timeRange));

        const stats = await FailedRequest.aggregate([
            {
                $match: {
                    timestamp: { $gte: startTime }
                }
            },
            {
                $group: {
                    _id: null,
                    totalFailures: { $sum: 1 },
                    uniqueIPs: { $addToSet: '$ip' },
                    reasons: { $addToSet: '$reason' }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalFailures: 1,
                    uniqueIPCount: { $size: '$uniqueIPs' },
                    uniqueReasonCount: { $size: '$reasons' }
                }
            }
        ]);

        res.json({
            timeRange,
            statistics: stats[0] || { totalFailures: 0, uniqueIPCount: 0, uniqueReasonCount: 0 }
        });
    } catch (error) {
        logger.error('Error fetching summary statistics:', error);
        res.status(500).json({ error: 'Failed to fetch summary statistics' });
    }
}

function getTimeInMilliseconds(timeRange) {
    const times = {
        '1h': 60 * 60 * 1000,
        '24h': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000
    };
    return times[timeRange] || times['24h'];
}

module.exports = { getAllMetrics, getIPMetrics, getStatistics };