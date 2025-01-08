class RateLimiter {
    constructor() {
        this.requests = new Map();
        this.windowMs = 60000; // 1 minute
        this.maxRequests = 100; // requests per minute
    }

    checkLimit(ip) {
        const now = Date.now();
        const windowStart = now - this.windowMs;

        if (!this.requests.has(ip)) {
            this.requests.set(ip, [now]);
            return true;
        }

        const requests = this.requests.get(ip).filter(time => time > windowStart);
        requests.push(now);
        this.requests.set(ip, requests);

        return requests.length <= this.maxRequests;
    }

    getRetryAfter(ip) {
        const requests = this.requests.get(ip) || [];
        if (requests.length === 0) return 0;

        const oldestRequest = requests[0];
        return Math.ceil((oldestRequest + this.windowMs - Date.now()) / 1000);
    }
}

module.exports = { RateLimiter };