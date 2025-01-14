const nodemailer = require('nodemailer');
const config = require('../config/environment');
const { createLogger } = require('../utils/Logger');
const Bull = require('bull');
const emailQueue = new Bull('email', {
  redis: {
    host: '10.0.2.15',
    port:'6379'
  }
});
const logger = createLogger('AlertService');

class AlertService {
  constructor() {
    this.transporter = nodemailer.createTransport(config.SMTP_CONFIG);
    this.alertCache = new Map();
    this.validateConfiguration();
  }

  validateConfiguration() {
    if (!config.SMTP_CONFIG.auth.user || !config.SMTP_CONFIG.auth.pass) {
      throw new Error('SMTP configuration is required');
    }
  }

  async sendAlert(ip, failedAttempts, details) {
    const cacheKey = `${ip}_${Math.floor(Date.now() / (1000 * 60 * 60))}`;

    if (this.alertCache.has(cacheKey)) {
      logger.debug(`Alert suppressed for IP ${ip} (already sent)`);
      return;
    }

    const mailOptions = {
      from: config.SMTP_CONFIG.auth.user,
      to: config.ADMIN_EMAIL,
      subject: `🚨 Security Alert: Multiple Failed Requests from IP ${ip}`,
      html: this.generateAlertEmail(ip, failedAttempts, details)
    };

    try {
      await emailQueue.add(mailOptions, { attempts: 3, backoff: 5000 });
      this.alertCache.set(cacheKey, true);
      setTimeout(() => this.alertCache.delete(cacheKey), 60 * 60 * 1000);
      logger.info(`Alert sent for IP ${ip}`);
    } catch (error) {
      logger.error('Failed to send alert email:', error);
      throw error;
    }
  }

  generateAlertEmail(ip, failedAttempts, details) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d63031;">⚠️ Security Alert</h2>
        <p><strong>IP Address:</strong> ${ip}</p>
        <p><strong>Failed Attempts:</strong> ${failedAttempts}</p>
        <p><strong>Time Window:</strong> Last ${config.TIME_WINDOW_MINUTES} minutes</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
        
        <h3>Recent Failures:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f1f1f1;">
            <th style="padding: 8px; text-align: left;">Timestamp</th>
            <th style="padding: 8px; text-align: left;">Reason</th>
          </tr>
          ${details.map(detail => `
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">
                ${new Date(detail.timestamp).toLocaleString()}
              </td>
              <td style="padding: 8px; border: 1px solid #ddd;">
                ${detail.reason}
              </td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  }
}

module.exports = new AlertService();