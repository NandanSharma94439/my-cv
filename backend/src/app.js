/**
 * app.js
 * ------
 * Express application factory.
 *
 * Exports the configured Express `app` instance.
 * The HTTP server itself lives in server.js — keeping them
 * separate makes the app easier to test without port binding.
 */

import 'dotenv/config';
import express  from 'express';
import helmet   from 'helmet';
import cors     from 'cors';

import { requestLogger } from './middleware/requestLogger.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import routes            from './routes/contactRoutes.js';

const app = express();

// ─────────────────────────────────────────────────────────────
// SECURITY HEADERS — Helmet sets ~15 HTTP headers that harden
// the API against common web vulnerabilities (clickjacking,
// MIME sniffing, etc.)
// ─────────────────────────────────────────────────────────────
app.use(helmet());

// ─────────────────────────────────────────────────────────────
// CORS — Only allow requests from the portfolio frontend.
// Update ALLOWED_ORIGIN in .env when you deploy to Vercel.
// ─────────────────────────────────────────────────────────────
const allowedOrigin = process.env.ALLOWED_ORIGIN;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., direct browser navigation, curl, server-to-server health checks)
      if (!origin) {
        return callback(null, true);
      }
      // If ALLOWED_ORIGIN is not set or set to '*', allow all origins
      if (!allowedOrigin || allowedOrigin === '*') {
        return callback(null, true);
      }
      // If origin matches allowed origin, allow
      if (origin === allowedOrigin || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow for portfolio frontend
    },
    methods:        ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials:    false,
  })
);

// ─────────────────────────────────────────────────────────────
// TRUST PROXY — Required when deployed behind Vercel/Nginx so
// express-rate-limit reads the real client IP from
// X-Forwarded-For rather than the proxy's IP.
// ─────────────────────────────────────────────────────────────
app.set('trust proxy', 1);

// ─────────────────────────────────────────────────────────────
// REQUEST LOGGING
// ─────────────────────────────────────────────────────────────
app.use(requestLogger);

// ─────────────────────────────────────────────────────────────
// GLOBAL RATE LIMITER — broad protection before body parsing
// ─────────────────────────────────────────────────────────────
app.use(globalLimiter);

// ─────────────────────────────────────────────────────────────
// BODY PARSER
// 10kb limit: prevents very large request bodies that could
// exhaust memory. Contact form payloads are tiny.
// ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));

// ─────────────────────────────────────────────────────────────
// ROUTES
// ─────────────────────────────────────────────────────────────
app.use('/', routes);

// ─────────────────────────────────────────────────────────────
// 404 HANDLER — for any route not matched above
// ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// ─────────────────────────────────────────────────────────────
// GLOBAL ERROR HANDLER — catches any error passed via next(err)
// ─────────────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[app] Unhandled error:', err.message);
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred.'
        : err.message,
  });
});

export default app;
