/**
 * Production-safe logger utility
 * Suppresses console logs in production builds
 */

const isProduction = process.env.NODE_ENV === 'production';

const logger = {
    log: (...args: any[]) => {
        if (!isProduction) {
            console.log(...args);
        }
    },

    error: (...args: any[]) => {
        // Always log errors, even in production (but can be sent to error tracking service)
        console.error(...args);
        // TODO: Send to error tracking service in production (e.g., Sentry)
    },

    warn: (...args: any[]) => {
        if (!isProduction) {
            console.warn(...args);
        }
    },

    info: (...args: any[]) => {
        if (!isProduction) {
            console.info(...args);
        }
    },

    debug: (...args: any[]) => {
        if (!isProduction) {
            console.debug(...args);
        }
    },
};

export default logger;
