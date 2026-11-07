/**
 * LOGGING STANDARD
 *
 * This project uses Pino for centralized structured logging.
 *
 * LOG LEVELS:
 * - fatal: Application cannot continue or critical system failure.
 * - error: Operation failed or unexpected application error.
 * - warn: Unexpected situation that does not prevent execution.
 * - info: Important application events (login, logout, server startup, etc.).
 * - debug: Detailed information useful during development.
 * - trace: Very detailed diagnostic information.
 *
 * LOGGING RULES:
 * 1. Always use this centralized logger. Never use console.log().
 * 2. Use structured objects instead of string concatenation.
 * 3. Use consistent property names (userId, requestId, operation, etc.).
 * 4. Include relevant context when logging errors.
 * 5. Always pass errors using the { err: error } property.
 * 6. Never log passwords, tokens, cookies, API keys or sensitive data.
 * 7. Never log entire request bodies or database records.
 * 8. Avoid redundant logs and unnecessary logging.
 * 9. Use debug/trace for development-only diagnostic information.
 * 10. Log meaningful events, not every execution step.
 *
 * STANDARD FORMAT:
 * logger.<level>({ context }, 'Descriptive message');
 *
 * EXAMPLES:
 * logger.info({ userId: 1 }, 'User logged in');
 * logger.warn({ userId: 1 }, 'Unauthorized access attempt');
 * logger.error({ err: error, operation: 'createUser' }, 'User creation failed');
 *
 * ENVIRONMENT:
 * - Development: LOG_LEVEL=debug
 * - Production: LOG_LEVEL=info
 */
const pino = require('pino');

const logger = pino({
    level: process.env.LOG_LEVEL || 'info',

    redact: {
        paths: [
            'password',
            'token',
            'authorization',
            'cookie',
            'req.headers.authorization',
            'req.headers.cookie',
        ],
        censor: '[REDACTED]',
    },

    transport:
        process.env.NODE_ENV !== 'production'
            ? {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      translateTime: 'SYS:standard',
                      ignore: 'pid,hostname',
                  },
              }
            : undefined,
});

module.exports = logger;
