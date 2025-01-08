const { createLogger } = require('../utils/Logger');
const logger = createLogger('Validator');

const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const { error } = schema.validate(req.body);
            if (error) {
                logger.warn('Validation error:', error.details);
                return res.status(400).json({
                    error: 'Validation Error',
                    details: error.details.map(detail => detail.message)
                });
            }
            next();
        } catch (err) {
            logger.error('Validator error:', err);
            next(err);
        }
    };
};

module.exports = { validateRequest };