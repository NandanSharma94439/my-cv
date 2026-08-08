/**
 * rateLimiter.js
 * --------------
 * Two rate limiters:
 *
 * 1. globalLimiter  — applied to ALL routes (100 req / 15 min per IP)
 *    Protects the entire API from general abuse.
 *
 * 2. contactLimiter — applied ONLY to POST /api/contact (5 req / 15 min per IP)
 *    Tight limit prevents contact form spam.
 */

import rateLimit from 'express-rate-limit';

// ── Shared window ─────────────────────────────────────────────
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Global limiter: broad protection for all endpoints.
 */
export const globalLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 100,
  standardHeaders: true,   // Return RateLimit-* headers (RFC 6585)
  legacyHeaders: false,    // Disable X-RateLimit-* headers
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
  },
  // Trust the first hop of a proxy (needed for Vercel / Render)
  // Set to the number of proxies in front of the server (1 for most PaaS).
  // Override with TRUST_PROXY env var if needed.
  skip: () => false,
});

/**
 * Contact limiter: strict limit specifically for the contact form endpoint.
 * 5 submissions per 15 minutes per IP is generous for a real user
 * but blocks automated spammers effectively.
 */
export const contactLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'You have submitted the contact form too many times. ' +
      'Please wait 15 minutes before trying again.',
  },
});
