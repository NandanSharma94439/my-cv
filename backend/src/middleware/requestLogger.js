/**
 * requestLogger.js
 * ----------------
 * HTTP request logger using morgan.
 *
 * In development: coloured "dev" format (concise, human-readable).
 * In production:  Apache "combined" format (machine-parseable,
 *                 compatible with most log aggregators).
 */

import morgan from 'morgan';

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Exported middleware — mount this early in app.js so every
 * request is logged, including those that never reach a route.
 */
export const requestLogger = morgan(isDev ? 'dev' : 'combined');
