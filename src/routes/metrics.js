const express = require('express');
const router = express.Router();

const { getAllMetrics, getIPMetrics, getStatistics } = require('../controllers/MetricsController');

router.get('/metrics', getAllMetrics);

// Get metrics for a specific IP
router.get('/metrics/:ip', getIPMetrics);

// Get summary statistics
router.get('/metrics/summary/statistics', getStatistics);

module.exports = router;