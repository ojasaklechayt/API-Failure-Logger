const mongoose = require('mongoose');

const failedRequestSchema = new mongoose.Schema({
    ip: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    reason: {
        type: String,
        required: true
    },
    headers: {
        type: Object
    },
    endpoint: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

failedRequestSchema.index({ ip: 1, timestamp: -1 });

module.exports = mongoose.model('FailedRequest', failedRequestSchema);