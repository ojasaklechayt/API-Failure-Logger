const FailedRequest = require('../models/FailedRequest');
const { createLogger } = require('../utils/Logger');

const logger = createLogger('MetricsService');

class MetricsService {
    async getMetrics(timeRange = '24h', pagination = { page: 1, limit: 10 }) {
        try {
            const startTime = this.getStartTimeFromRange(timeRange);
            const skip = (pagination.page - 1) * pagination.limit;

            const [metrics, totalCount] = await Promise.all([
                this.aggregateMetrics(startTime, skip, pagination.limit),
                this.getTotalCount(startTime)
            ]);

            return {
                timeRange,
                pagination: {
                    currentPage: pagination.page,
                    totalPages: Math.ceil(totalCount / pagination.limit),
                    totalItems: totalCount,
                    itemsPerPage: pagination.limit
                },
                metrics
            };
        } catch (error) {
            logger.error('Error fetching metrics:', error);
            throw error;
        }
    }

    async aggregateMetrics(startTime, skip, limit) {
        return FailedRequest.aggregate([
            {
                $match: {
                    timestamp: { $gte: startTime }
                }
            },
            {
                $group: {
                    _id: {
                        ip: '$ip',
                        reason: '$reason'
                    },
                    count: { $sum: 1 },
                    lastOccurrence: { $max: '$timestamp' }
                }
            },
            {
                $group: {
                    _id: '$_id.ip',
                    failures: {
                        $push: {
                            reason: '$_id.reason',
                            count: '$count',
                            lastOccurrence: '$lastOccurrence'
                        }
                    },
                    totalFailures: { $sum: '$count' }
                }
            },
            { $sort: { totalFailures: -1 } },
            { $skip: skip },
            { $limit: limit }
        ]);
    }

    async getTotalCount(startTime) {
        const result = await FailedRequest.aggregate([
            {
                $match: {
                    timestamp: { $gte: startTime }
                }
            },
            {
                $group: {
                    _id: '$ip'
                }
            },
            {
                $count: 'total'
            }
        ]);

        return result[0]?.total || 0;
    }

    getStartTimeFromRange(range) {
        const now = new Date();
        const ranges = {
            '1h': () => new Date(now - 60 * 60 * 1000),
            '24h': () => new Date(now - 24 * 60 * 60 * 1000),
            '7d': () => new Date(now - 7 * 24 * 60 * 60 * 1000),
            '30d': () => new Date(now - 30 * 24 * 60 * 60 * 1000)
        };

        return ranges[range]?.() || ranges['24h']();
    }
}

module.exports = new MetricsService();