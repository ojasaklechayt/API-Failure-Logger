# Failed Request Monitoring and Alert System

A robust backend system for monitoring failed POST requests, tracking IP-based request patterns, and sending alerts when suspicious activity is detected.

## 🌟 Features

- **Request Monitoring**: Tracks failed POST requests due to invalid headers or incorrect access tokens
- **IP Tracking**: Monitors and logs requests from each IP address within configurable time windows
- **Alert System**: Sends email notifications when failed attempts exceed thresholds
- **Metrics Collection**: Stores and exposes detailed metrics for analysis
- **Rate Limiting**: Protects against excessive requests
- **Scalable Architecture**: Designed to handle high traffic volumes (~500 requests/second)

## 🔧 Tech Stack

- **Backend**: Node.js with Express
- **Database**: MongoDB
- **Email**: Gmail SMTP Server
- **Logging**: Winston Logger
- **Security**: Helmet middleware
- **Testing**: Jest

## 📋 Prerequisites

- Node.js (>=14.0.0)
- MongoDB
- Gmail account for sending alerts
- Git (for version control)

## 🚀 Getting Started

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd API-Failure-Logger

# Install dependencies
npm install
```

### 2. Configuration

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-gmail-app-password
ADMIN_EMAIL=where-to-send-alerts@email.com
ALERT_THRESHOLD=5
TIME_WINDOW_MINUTES=10
LOG_LEVEL=debug
```

### 3. Gmail Setup for Alerts

1. Go to Google Account Settings
2. Enable 2-Factor Authentication
3. Navigate to Security → App passwords
4. Generate new app password
5. Use the generated password in `SMTP_PASS` environment variable

### 4. Running the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📝 API Documentation

### POST /api/submit
Main endpoint for request monitoring

**Headers Required:**
- `Authorization`: Bearer token
- `Content-Type`: Application type
- `User-Agent`: Client identifier

### GET /api/metrics
Fetch general metrics with pagination and time range filtering

**Query Parameters:**
- `timeRange`: '1h', '24h', '7d', '30d' (default: '24h')
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### GET /api/metrics/:ip
Fetch metrics for specific IP address

**Query Parameters:**
- `timeRange`: Time window for metrics

### GET /api/metrics/summary/statistics
Get summary statistics of failed requests

**Query Parameters:**
- `timeRange`: Time window for statistics

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Manual Testing

Test invalid requests:
```bash
# Missing authentication
curl -X POST http://localhost:3000/api/submit

# Invalid token
curl -X POST http://localhost:3000/api/submit \
  -H "Authorization: Bearer invalid-token"
```

Test metrics:
```bash
# Get general metrics
curl http://localhost:3000/api/metrics

# Get IP-specific metrics
curl http://localhost:3000/api/metrics/127.0.0.1
```

## 📊 Monitoring & Debugging

- **Logs**: Check `logs/` directory
  - `error.log`: Error-level logs
  - `combined.log`: All logs
- **MongoDB**: Monitor collections for failed requests
- **Email Alerts**: Check configured admin email

## ⚙️ Architecture

```
src/
├── app.js              # Application entry point
├── config/             # Configuration files
├── database/           # Database connection
├── middleware/         # Express middleware
├── models/            # MongoDB models
├── routes/            # API routes
├── services/          # Business logic
└── utils/             # Utility functions
```

## 🔐 Security Features

- Rate limiting
- Request validation
- Security headers (Helmet)
- Token validation
- IP tracking
- Alert system

## ⚡ Performance Optimizations

- MongoDB connection pooling
- Request compression
- Efficient indexing
- Cache implementation
- Rate limiting

## 🛠 Troubleshooting

Common issues and solutions:

1. **MongoDB Connection Issues**
   - Verify MONGODB_URI
   - Check network connectivity
   - Verify MongoDB service status

2. **Email Alert Issues**
   - Verify SMTP credentials
   - Check Gmail settings
   - Verify no rate limits

3. **Rate Limiting**
   - Check logs for blocked requests
   - Verify rate limit configuration

## 📈 Scaling Considerations

- Horizontal scaling capability
- Load balancer ready
- Database indexing
- Connection pooling
- Rate limiting by IP

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Support

For any issues, email [ojasaklechayt@gmail.com](mailto:ojasaklechayt@gmail.com) or create an issue in the repository.
